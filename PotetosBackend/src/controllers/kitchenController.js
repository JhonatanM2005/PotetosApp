const { OrderItem, Order, Dish, Table } = require("../models");
const { Op } = require("sequelize");

// Obtener items pendientes en cocina
exports.getKitchenOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        status: {
          [Op.in]: ["pending", "preparing"],
        },
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          where: {
            status: {
              [Op.in]: ["pending", "preparing"],
            },
          },
          include: [{ model: Dish, as: "dish" }],
        },
        {
          model: Table,
          as: "table",
        },
      ],
      order: [["created_at", "ASC"]],
    });

    res.json({ orders });
  } catch (error) {
    console.error("Get kitchen orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Actualizar estado de item
exports.updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const item = await OrderItem.findByPk(id, {
      include: [{ model: Order, as: "order" }],
    });

    if (!item) {
      return res.status(404).json({ message: "Order item not found" });
    }

    await item.update({ status });

    // Si todos los items están listos, actualizar pedido
    const allItems = await OrderItem.findAll({
      where: { order_id: item.order_id },
    });

    const allReady = allItems.every(
      (i) => i.status === "ready" || i.status === "delivered"
    );

    if (allReady) {
      await Order.update({ status: "ready" }, { where: { id: item.order_id } });

      // Emitir evento
      if (global.io) {
        global.io.to("waiters").emit("order:ready", {
          orderId: item.order_id,
          orderNumber: item.order.order_number,
        });
      }
    }

    res.json({ message: "Item status updated", item });
  } catch (error) {
    console.error("Update item status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
