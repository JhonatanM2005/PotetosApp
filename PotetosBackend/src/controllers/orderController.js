const { Order, OrderItem, Dish, Table, User } = require('../models');
const { Op } = require('sequelize');

// Crear nuevo pedido
exports.createOrder = async (req, res) => {
  try {
    const { table_id, customer_name, customer_count, items, notes } = req.body;

    // Validar items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Generar número de orden único
    const timestamp = Date.now().toString().slice(-8);
    const orderNumber = `ORD-${timestamp}`;

    // Crear orden
    const order = await Order.create({
      order_number: orderNumber,
      table_id,
      waiter_id: req.user.id,
      customer_name,
      customer_count,
      notes,
      status: 'pending'
    });

    // Crear items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const dish = await Dish.findByPk(item.dish_id);
      
      if (!dish || !dish.is_available) {
        await order.destroy();
        return res.status(400).json({ 
          message: `Dish ${item.dish_id} is not available` 
        });
      }

      const dishPrice = parseFloat(dish.price);
      const subtotal = dishPrice * item.quantity;

      const orderItem = await OrderItem.create({
        order_id: order.id,
        dish_id: dish.id,
        dish_name: dish.name,
        quantity: item.quantity,
        unit_price: dishPrice,
        subtotal: subtotal,
        notes: item.notes,
        status: 'pending'
      });

      totalAmount += subtotal;
      orderItems.push(orderItem);
    }

    // Actualizar total
    await order.update({ total_amount: totalAmount });

    // Actualizar mesa
    if (table_id) {
      await Table.update(
        { status: 'occupied', current_order_id: order.id },
        { where: { id: table_id } }
      );
    }

    // Emitir evento Socket.io a cocina
    if (global.io) {
      global.io.to('kitchen').emit('kitchen:newOrder', {
        orderId: order.id,
        orderNumber: order.order_number,
        items: orderItems,
        waiter: req.user.name,
        tableNumber: table_id
      });
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        ...order.toJSON(),
        items: orderItems
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Obtener todos los pedidos
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Dish, as: 'dish' }]
        },
        {
          model: Table,
          as: 'table'
        },
        {
          model: User,
          as: 'waiter',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Obtener pedidos activos
exports.getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        status: {
          [Op.in]: ['pending', 'preparing', 'ready', 'delivered']
        }
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Dish, as: 'dish' }]
        },
        {
          model: Table,
          as: 'table'
        },
        {
          model: User,
          as: 'waiter',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Obtener pedido por ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Dish, as: 'dish' }]
        },
        {
          model: Table,
          as: 'table'
        },
        {
          model: User,
          as: 'waiter',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Eliminar pedido
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [{ model: Table, as: 'table' }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // No permitir eliminar órdenes completadas o pagadas
    if (order.status === 'paid' || order.status === 'completed') {
      return res.status(400).json({ 
        message: 'Cannot delete completed or paid orders' 
      });
    }

    // Liberar mesa si está ocupada
    if (order.table_id) {
      await Table.update(
        { status: 'available', current_order_id: null },
        { where: { id: order.table_id } }
      );
    }

    await order.destroy();

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Actualizar estado del pedido
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: Table, as: 'table' }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.update({ status });

    // Si se marca como pagado, liberar mesa
    if (status === 'paid' && order.table_id) {
      await Table.update(
        { status: 'available', current_order_id: null },
        { where: { id: order.table_id } }
      );
      await order.update({ completed_at: new Date() });
    }

    // Emitir evento
    if (global.io && status === 'ready') {
      global.io.to('waiters').emit('order:ready', {
        orderId: order.id,
        orderNumber: order.order_number,
        tableId: order.table_id
      });
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Obtener estadísticas de órdenes
exports.getOrderStats = async (req, res) => {
  try {
    const stats = {
      total: await Order.count(),
      pending: await Order.count({ where: { status: 'pending' } }),
      preparing: await Order.count({ where: { status: 'preparing' } }),
      ready: await Order.count({ where: { status: 'ready' } }),
      delivered: await Order.count({ where: { status: 'delivered' } }),
      paid: await Order.count({ where: { status: 'paid' } }),
      cancelled: await Order.count({ where: { status: 'cancelled' } }),
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};