const { Order, OrderItem, Dish, Table, User, Payment, PaymentSplit } = require("../models");
const { Op } = require("sequelize");

// Obtener órdenes entregadas disponibles para pagar
exports.getDeliveredOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        status: "delivered",
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Dish, as: "dish" }],
        },
        {
          model: Table,
          as: "table",
          attributes: ["id", "table_number"],
        },
        {
          model: User,
          as: "waiter",
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Serializar datos
    const serializedOrders = orders.map((order) => {
      const orderData = order.toJSON();
      if (orderData.items) {
        orderData.items = orderData.items.map((item) => ({
          id: item.id,
          dish_id: item.dish_id,
          dish_name: item.dish_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          status: item.status,
          notes: item.notes,
        }));
      }
      return orderData;
    });

    res.json({ orders: serializedOrders });
  } catch (error) {
    console.error("Get delivered orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Obtener detalles de una orden para pagar
exports.getOrderForPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Dish, as: "dish" }],
        },
        {
          model: Table,
          as: "table",
          attributes: ["id", "table_number"],
        },
        {
          model: User,
          as: "waiter",
          attributes: ["id", "name"],
        },
        {
          model: Payment,
          as: "payments",
          include: [
            {
              model: User,
              as: "cashier",
              attributes: ["id", "name"],
            },
            {
              model: PaymentSplit,
              as: "splits",
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Serializar datos
    const orderData = order.toJSON();
    if (orderData.items) {
      orderData.items = orderData.items.map((item) => ({
        id: item.id,
        dish_id: item.dish_id,
        dish_name: item.dish_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        status: item.status,
        notes: item.notes,
      }));
    }

    res.json({ order: orderData });
  } catch (error) {
    console.error("Get order for payment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Procesar pago de una orden
exports.processPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, paymentMethod, splits } = req.body;

    console.log("💳 [Cashier] Datos recibidos:", { orderId, amount, paymentMethod, splits });

    const order = await Order.findByPk(orderId, {
      include: [
        { model: Table, as: "table" },
        { model: User, as: "waiter", attributes: ["id", "name"] },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Validar que el monto sea correcto (con tolerancia por redondeo)
    const amountDifference = Math.abs(
      parseFloat(amount) - parseFloat(order.total_amount)
    );
    if (amountDifference > 0.01) {
      console.error(
        `❌ Monto incorrecto. Esperado: ${order.total_amount}, Recibido: ${amount}`
      );
      return res.status(400).json({
        message: "Payment amount does not match order total",
        expected: order.total_amount,
        received: amount,
      });
    }

    // Validar splits si existen
    if (splits && splits.length > 0) {
      const splitTotal = splits.reduce((sum, split) => sum + parseFloat(split.amount), 0);
      const splitDifference = Math.abs(splitTotal - parseFloat(order.total_amount));
      
      if (splitDifference > 0.01) {
        console.error(
          `❌ Total de splits incorrecto. Esperado: ${order.total_amount}, Recibido: ${splitTotal}`
        );
        return res.status(400).json({
          message: "Split amounts do not match order total",
          expected: order.total_amount,
          received: splitTotal,
        });
      }
    }

    // Crear registro de pago
    const payment = await Payment.create({
      order_id: orderId,
      cashier_id: req.user.id,
      amount,
      payment_method: paymentMethod,
      status: "completed",
      paid_at: new Date(),
    });

    console.log("✅ Pago creado:", payment.id);

    // Si hay división de cuenta, crear registros de splits
    if (splits && splits.length > 0) {
      try {
        console.log("📝 Creando splits:", JSON.stringify(splits, null, 2));
        
        const splitRecords = await Promise.all(
          splits.map((split) => {
            console.log("📌 Creando split individual:", {
              payment_id: payment.id,
              person_name: split.person_name,
              amount: parseFloat(split.amount),
              payment_method: split.payment_method,
              status: "completed",
            });
            
            return PaymentSplit.create({
              payment_id: payment.id,
              person_name: split.person_name,
              amount: parseFloat(split.amount),
              payment_method: split.payment_method,
              status: "completed",
            });
          })
        );
        payment.splits = splitRecords;
        console.log(`✅ ${splitRecords.length} splits creados exitosamente`);
      } catch (splitError) {
        console.error("❌ Error creando splits:", {
          message: splitError.message,
          errors: splitError.errors?.map(e => ({ message: e.message, field: e.path })),
          stack: splitError.stack,
        });
        throw splitError;
      }
    }

    // Actualizar estado de la orden a pagada
    await order.update({
      status: "paid",
      cashier_id: req.user.id,
      completed_at: new Date(),
    });

    console.log("✅ Orden actualizada a pagada");

    // Liberar mesa si está disponible
    if (order.table_id) {
      await Table.update(
        { status: "available", current_order_id: null },
        { where: { id: order.table_id } }
      );
      console.log("✅ Mesa liberada");
    }

    // Emitir evento Socket.io a sala cashier
    if (global.io) {
      console.log("📤 Emitiendo evento payment:processed a sala cashier");
      global.io.to("cashier").emit("payment:processed", {
        orderId: order.id,
        orderNumber: order.order_number,
        amount,
        cashier: req.user.name,
        tableId: order.table_id,
        timestamp: new Date(),
      });
    } else {
      console.error("❌ global.io no disponible");
    }

    res.json({
      message: "Payment processed successfully",
      payment: {
        ...payment.toJSON(),
        order: {
          order_number: order.order_number,
          total_amount: order.total_amount,
          waiter: order.waiter,
          table: order.table,
        },
      },
    });
  } catch (error) {
    console.error("❌ Process payment error:", {
      message: error.message,
      errors: error.errors?.map(e => ({
        message: e.message,
        field: e.path,
        value: e.value,
      })),
      stack: error.stack,
    });
    
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      details: error.errors ? error.errors.map(e => ({ 
        message: e.message, 
        field: e.path 
      })) : [],
      type: error.name,
    });
  }
};

// Obtener historial de pagos
exports.getPaymentHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate || endDate) {
      where.paid_at = {};
      if (startDate) {
        where.paid_at[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.paid_at[Op.lte] = new Date(endDate);
      }
    }

    const payments = await Payment.findAll({
      where,
      include: [
        {
          model: Order,
          as: "order",
          include: [
            { model: Table, as: "table", attributes: ["table_number"] },
            { model: User, as: "waiter", attributes: ["name"] },
            {
              model: OrderItem,
              as: "items",
              attributes: ["id", "dish_id", "dish_name", "quantity", "unit_price", "subtotal"],
            },
          ],
        },
        {
          model: User,
          as: "cashier",
          attributes: ["name"],
        },
        {
          model: PaymentSplit,
          as: "splits",
        },
      ],
      order: [["paid_at", "DESC"]],
    });

    res.json({ payments });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Obtener estadísticas del cajero (ventas del día, etc)
exports.getCashierStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStats = {
      totalSales: await Payment.sum("amount", {
        where: {
          status: "completed",
          paid_at: {
            [Op.between]: [today, tomorrow],
          },
        },
      }),
      totalTransactions: await Payment.count({
        where: {
          status: "completed",
          paid_at: {
            [Op.between]: [today, tomorrow],
          },
        },
      }),
      paymentMethods: {},
    };

    // Detallar por método de pago
    const paymentsByMethod = await Payment.findAll({
      where: {
        status: "completed",
        paid_at: {
          [Op.between]: [today, tomorrow],
        },
      },
      attributes: [
        "payment_method",
        [require("sequelize").fn("COUNT", require("sequelize").col("id")), "count"],
        [require("sequelize").fn("SUM", require("sequelize").col("amount")), "total"],
      ],
      group: ["payment_method"],
    });

    paymentsByMethod.forEach((method) => {
      todayStats.paymentMethods[method.payment_method] = {
        count: method.get("count"),
        total: method.get("total"),
      };
    });

    res.json({ stats: todayStats });
  } catch (error) {
    console.error("Get cashier stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
