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
      attributes: [
        "id",
        "order_number",
        "notes",
        "status",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: OrderItem,
          as: "items",
          where: {
            status: {
              [Op.in]: ["pending", "preparing"],
            },
          },
          attributes: [
            "id",
            "dish_name",
            "quantity",
            "notes",
            "status",
            "unit_price",
            "subtotal",
          ],
          include: [{ model: Dish, as: "dish" }],
        },
        {
          model: Table,
          as: "table",
          attributes: ["id", "table_number", "capacity"],
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

    // Obtener todos los items de la orden
    const allItems = await OrderItem.findAll({
      where: { order_id: item.order_id },
    });

    const oldOrderStatus = item.order.status;
    let newOrderStatus = oldOrderStatus;

    // Determinar el nuevo estado de la orden basado en los items
    const allReady = allItems.every(
      (i) => i.status === "ready" || i.status === "delivered"
    );
    const somePreparing = allItems.some((i) => i.status === "preparing");
    const allPending = allItems.every((i) => i.status === "pending");

    // Actualizar estado de la orden según los items
    if (allReady) {
      newOrderStatus = "ready";
    } else if (somePreparing) {
      newOrderStatus = "preparing";
    } else if (allPending) {
      newOrderStatus = "pending";
    }

    // Si el estado cambió, actualizar la orden y emitir evento
    if (newOrderStatus !== oldOrderStatus) {
      await Order.update(
        { status: newOrderStatus },
        { where: { id: item.order_id } }
      );

      // Emitir eventos
      if (global.io) {
        // Evento específico para cuando está lista
        if (newOrderStatus === "ready") {
          global.io.to("waiters").emit("order:ready", {
            orderId: item.order_id,
            orderNumber: item.order.order_number,
          });
        }

        // Evento general de cambio de estado
        global.io.emit("order:statusChanged", {
          orderId: item.order_id,
          orderNumber: item.order.order_number,
          oldStatus: oldOrderStatus,
          newStatus: newOrderStatus,
        });
      }
    }

    res.json({ message: "Item status updated", item });
  } catch (error) {
    console.error("Update item status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
