const { Order, OrderItem, Dish, Table, User } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// Obtener órdenes pendientes de pago
exports.getPendingPayments = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        status: {
          [Op.in]: ["delivered", "ready"],
        },
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Dish, as: "dish" }],
        },
        { model: Table, as: "table" },
        { model: User, as: "waiter", attributes: ["id", "name"] },
      ],
      order: [["created_at", "ASC"]],
    });

    res.json({ orders });
  } catch (error) {
    console.error("Get pending payments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Procesar pago de una orden
exports.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, amount_paid, tip, customer_name } = req.body;

    if (!payment_method || !amount_paid) {
      return res.status(400).json({
        message: "Payment method and amount paid are required",
      });
    }

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: "items",
        },
        { model: Table, as: "table" },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verificar que la orden esté lista para pago
    if (!["delivered", "ready"].includes(order.status)) {
      return res.status(400).json({
        message: "Order is not ready for payment",
      });
    }

    // Calcular totales
    const totalAmount = parseFloat(order.total_amount);
    const tipAmount = parseFloat(tip || 0);
    const amountPaid = parseFloat(amount_paid);
    const finalTotal = totalAmount + tipAmount;

    // Validar que el monto pagado sea suficiente
    if (amountPaid < finalTotal) {
      return res.status(400).json({
        message: "Insufficient amount paid",
        required: finalTotal,
        received: amountPaid,
      });
    }

    const change = amountPaid - finalTotal;

    // Actualizar orden
    console.log(`💰 Procesando pago para orden ${order.order_number}`);
    console.log(`   Método de pago: ${payment_method}`);
    console.log(`   Usuario autenticado: ${req.user?.name || 'NO DISPONIBLE'} (ID: ${req.user?.id || 'NO DISPONIBLE'})`);
    console.log(`   Rol del usuario: ${req.user?.role || 'NO DISPONIBLE'}`);
    console.log(`   Nombre del cliente: ${customer_name || 'No especificado'}`);
    
    // Verificar que req.user existe
    if (!req.user || !req.user.id) {
      console.error('❌ ERROR: req.user no está disponible en processPayment');
      return res.status(500).json({ 
        message: "Error de autenticación: usuario no disponible",
        error: "req.user is undefined" 
      });
    }
    
    // Preparar datos de actualización
    const updateData = {
      status: "paid",
      payment_method,
      tip_amount: tipAmount,
      completed_at: new Date(),
      cashier_id: req.user.id,
    };
    
    // Agregar customer_name si se proporcionó
    if (customer_name) {
      updateData.customer_name = customer_name;
    }
    
    await order.update(updateData);
    
    console.log(`   payment_method guardado: ${order.payment_method}`);
    console.log(`   cashier_id guardado: ${order.cashier_id}`);
    console.log(`   customer_name guardado: ${order.customer_name || 'N/A'}`);

    // Recargar la orden con todas las relaciones
    await order.reload({
      include: [
        {
          model: OrderItem,
          as: "items",
        },
        { model: Table, as: "table" },
        { model: User, as: "waiter", attributes: ["id", "name"] },
        { model: User, as: "cashier", attributes: ["id", "name"] },
      ],
    });

    // Liberar mesa SIEMPRE que exista (el pago completa la orden)
    if (order.table_id) {
      console.log(`🔓 Liberando mesa ${order.table?.table_number || order.table_id}`);
      await Table.update(
        { status: "available", current_order_id: null },
        { where: { id: order.table_id } }
      );
    }

    // Emitir evento Socket.io
    if (global.io) {
      // Evento de pago procesado
      global.io.emit("payment:processed", {
        orderId: order.id,
        orderNumber: order.order_number,
        tableId: order.table_id,
        totalAmount,
        tipAmount,
        paymentMethod: payment_method,
        timestamp: new Date(),
      });

      // Evento de mesa actualizada (para que los meseros vean la mesa disponible)
      if (order.table_id) {
        console.log(`📡 Emitiendo evento table:updated para mesa ${order.table_id}`);
        global.io.emit("table:updated", {
          tableId: order.table_id,
          status: "available",
        });
      }
    }

    res.json({
      message: "Payment processed successfully",
      order: {
        ...order.toJSON(),
        total_amount: totalAmount,
        tip_amount: tipAmount,
        final_total: finalTotal,
        amount_paid: amountPaid,
        change,
      },
    });
  } catch (error) {
    console.error("Process payment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Obtener historial de pagos del día
exports.getDailyPayments = async (req, res) => {
  try {
    const { date } = req.query;
    let startDate, endDate;

    if (date) {
      // Parsear la fecha como local, no como UTC
      const [year, month, day] = date.split("-").map(Number);
      startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      // Si no se especifica fecha, usar hoy
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    const orders = await Order.findAll({
      where: {
        status: "paid",
        completed_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: OrderItem,
          as: "items",
        },
        { model: Table, as: "table" },
        { model: User, as: "waiter", attributes: ["id", "name"] },
        {
          model: User,
          as: "cashier",
          attributes: ["id", "name"],
        },
      ],
      order: [["completed_at", "DESC"]],
    });

    res.json({ orders });
  } catch (error) {
    console.error("Get daily payments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Obtener estadísticas de caja del día
exports.getDailyCashierStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await Order.findAll({
      where: {
        status: "paid",
        completed_at: {
          [Op.gte]: today,
        },
      },
      attributes: [
        "payment_method",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("total_amount")), "total"],
        [sequelize.fn("SUM", sequelize.col("tip_amount")), "tips"],
      ],
      group: ["payment_method"],
      raw: true,
    });

    // Calcular totales generales
    const totalOrders = await Order.count({
      where: {
        status: "paid",
        completed_at: {
          [Op.gte]: today,
        },
      },
    });

    const totals = await Order.findOne({
      where: {
        status: "paid",
        completed_at: {
          [Op.gte]: today,
        },
      },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("total_amount")), "totalSales"],
        [sequelize.fn("SUM", sequelize.col("tip_amount")), "totalTips"],
        [sequelize.fn("AVG", sequelize.col("total_amount")), "averageOrder"],
      ],
      raw: true,
    });

    res.json({
      stats: {
        totalOrders,
        totalSales: parseFloat(totals.totalSales || 0),
        totalTips: parseFloat(totals.totalTips || 0),
        averageOrder: parseFloat(totals.averageOrder || 0),
        byPaymentMethod: result.map((r) => ({
          method: r.payment_method,
          count: parseInt(r.count),
          total: parseFloat(r.total || 0),
          tips: parseFloat(r.tips || 0),
        })),
      },
    });
  } catch (error) {
    console.error("Get cashier stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Obtener resumen de cierre de caja
exports.getCashClosing = async (req, res) => {
  try {
    const { date } = req.query;
    let startDate, endDate;

    if (date) {
      // Parsear la fecha como local, no como UTC
      const [year, month, day] = date.split("-").map(Number);
      startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    const orders = await Order.findAll({
      where: {
        status: "paid",
        completed_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: User,
          as: "cashier",
          attributes: ["id", "name"],
        },
      ],
    });

    // Agrupar por cajero
    const byCashier = {};
    orders.forEach((order) => {
      const cashierId = order.cashier_id || "unassigned";
      const cashierName = order.cashier?.name || "Sin asignar";

      if (!byCashier[cashierId]) {
        byCashier[cashierId] = {
          cashierId: order.cashier_id,
          cashierName,
          orders: 0,
          cash: 0,
          card: 0,
          transfer: 0,
          tips: 0,
          total: 0,
        };
      }

      byCashier[cashierId].orders++;
      const amount = parseFloat(order.total_amount);
      const tip = parseFloat(order.tip_amount || 0);

      if (order.payment_method === "cash") {
        byCashier[cashierId].cash += amount;
      } else if (order.payment_method === "card") {
        byCashier[cashierId].card += amount;
      } else if (order.payment_method === "transfer") {
        byCashier[cashierId].transfer += amount;
      }

      byCashier[cashierId].tips += tip;
      byCashier[cashierId].total += amount + tip;
    });

    // Totales generales
    const totalOrders = orders.length;
    const totalSales = orders.reduce(
      (sum, o) => sum + parseFloat(o.total_amount),
      0
    );
    const totalTips = orders.reduce(
      (sum, o) => sum + parseFloat(o.tip_amount || 0),
      0
    );

    res.json({
      date: startDate.toISOString().split("T")[0],
      summary: {
        totalOrders,
        totalSales,
        totalTips,
        grandTotal: totalSales + totalTips,
      },
      byCashier: Object.values(byCashier),
    });
  } catch (error) {
    console.error("Get cash closing error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reimprimir recibo
exports.reprintReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Dish, as: "dish" }],
        },
        { model: Table, as: "table" },
        { model: User, as: "waiter", attributes: ["id", "name"] },
        { model: User, as: "cashier", attributes: ["id", "name"] },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "paid") {
      return res.status(400).json({ message: "Order is not paid yet" });
    }

    res.json({
      message: "Receipt data retrieved",
      receipt: {
        orderNumber: order.order_number,
        date: order.completed_at,
        table: order.table?.table_number,
        waiter: order.waiter?.name,
        cashier: order.cashier?.name,
        items: order.items.map((item) => ({
          name: item.dish_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          subtotal: item.subtotal,
        })),
        subtotal: order.total_amount,
        tip: order.tip_amount || 0,
        total:
          parseFloat(order.total_amount) + parseFloat(order.tip_amount || 0),
        paymentMethod: order.payment_method,
      },
    });
  } catch (error) {
    console.error("Reprint receipt error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Dividir cuenta entre varios clientes
exports.splitBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { numberOfPeople } = req.body;

    if (!numberOfPeople || numberOfPeople < 2) {
      return res.status(400).json({
        message: "Number of people must be at least 2",
      });
    }

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Dish, as: "dish" }],
        },
        { model: Table, as: "table" },
        { model: User, as: "waiter", attributes: ["id", "name"] },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verificar que la orden esté lista para división
    if (!["delivered", "ready"].includes(order.status)) {
      return res.status(400).json({
        message: "Order is not ready for bill splitting",
      });
    }

    const totalAmount = parseFloat(order.total_amount);
    const amountPerPerson = totalAmount / numberOfPeople;

    res.json({
      orderId: order.id,
      orderNumber: order.order_number,
      totalAmount,
      numberOfPeople,
      amountPerPerson: parseFloat(amountPerPerson.toFixed(2)),
      items: order.items.map((item) => ({
        id: item.id,
        name: item.dish_name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
        subtotal: parseFloat(item.subtotal),
      })),
    });
  } catch (error) {
    console.error("Split bill error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Procesar pago parcial (para cuentas divididas)
exports.processPartialPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, amount_paid, tip, personNumber, totalPeople } =
      req.body;

    if (!payment_method || !amount_paid) {
      return res.status(400).json({
        message: "Payment method and amount paid are required",
      });
    }

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: "items",
        },
        { model: Table, as: "table" },
        { model: User, as: "waiter", attributes: ["id", "name"] },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verificar que la orden esté lista para pago
    if (!["delivered", "ready"].includes(order.status)) {
      return res.status(400).json({
        message: "Order is not ready for payment",
      });
    }

    const tipAmount = parseFloat(tip || 0);
    const amountPaidValue = parseFloat(amount_paid);
    const change = amountPaidValue - (parseFloat(amount_paid) + tipAmount);

    // Verificar que req.user existe
    if (!req.user || !req.user.id) {
      console.error('❌ ERROR: req.user no está disponible en processPartialPayment');
      return res.status(500).json({ 
        message: "Error de autenticación: usuario no disponible",
        error: "req.user is undefined" 
      });
    }

    console.log(`💰 Procesando pago parcial ${personNumber}/${totalPeople} para orden ${order.order_number}`);
    console.log(`   Cajero: ${req.user.name} (ID: ${req.user.id})`);

    // Registrar el pago parcial en metadata (puedes crear una tabla separada si prefieres)
    const partialPayments = order.metadata?.partialPayments || [];
    partialPayments.push({
      personNumber,
      paymentMethod: payment_method,
      amount: amountPaidValue,
      tip: tipAmount,
      cashierId: req.user.id,
      cashierName: req.user.name,
      timestamp: new Date(),
    });

    // Verificar si todos pagaron
    const allPaid = partialPayments.length >= totalPeople;

    if (allPaid) {
      // Calcular totales
      const totalPaid = partialPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalTips = partialPayments.reduce((sum, p) => sum + p.tip, 0);

      console.log(`✅ Completando pago dividido para orden ${order.order_number}`);
      console.log(`   Cajero final: ${req.user.name} (ID: ${req.user.id})`);

      // Actualizar orden a pagada
      await order.update({
        status: "paid",
        payment_method: "split", // Indicar que fue pago dividido
        tip_amount: totalTips,
        completed_at: new Date(),
        cashier_id: req.user.id,
        metadata: { partialPayments },
      });
      
      console.log(`   cashier_id guardado: ${order.cashier_id}`);

      // Recargar con relaciones
      await order.reload({
        include: [
          {
            model: OrderItem,
            as: "items",
          },
          { model: Table, as: "table" },
          { model: User, as: "waiter", attributes: ["id", "name"] },
          { model: User, as: "cashier", attributes: ["id", "name"] },
        ],
      });

      // Liberar mesa si existe
      if (order.table_id) {
        await Table.update(
          { status: "available", current_order_id: null },
          { where: { id: order.table_id } }
        );

        if (global.io) {
          global.io.emit("table:updated", {
            tableId: order.table_id,
            status: "available",
          });
        }
      }

      // Emitir evento Socket.io
      if (global.io) {
        global.io.emit("payment:processed", {
          orderId: order.id,
          orderNumber: order.order_number,
          tableId: order.table_id,
          totalAmount: order.total_amount,
          tipAmount: totalTips,
          paymentMethod: "split",
          timestamp: new Date(),
        });
      }

      res.json({
        message: "All payments received. Order completed",
        completed: true,
        order: order.toJSON(),
        partialPayments,
      });
    } else {
      // Actualizar metadata con el pago parcial
      await order.update({
        metadata: { partialPayments },
      });

      res.json({
        message: `Payment ${partialPayments.length}/${totalPeople} received`,
        completed: false,
        remaining: totalPeople - partialPayments.length,
        partialPayments,
      });
    }
  } catch (error) {
    console.error("Process partial payment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
