const { Table, Order, User } = require("../models");
const { Op } = require("sequelize");

// Obtener todas las mesas
exports.getTables = async (req, res) => {
  try {
    const { status, include_current_order } = req.query;

    const where = {};
    if (status) where.status = status;

    const options = {
      where,
      order: [["table_number", "ASC"]],
    };

    // Incluir orden actual si se solicita
    if (include_current_order === "true") {
      options.include = [
        {
          model: Order,
          as: "orders",
          where: {
            status: {
              [Op.in]: ["pending", "preparing", "ready", "delivered"],
            },
          },
          required: false,
          include: [
            {
              model: User,
              as: "waiter",
              attributes: ["id", "name"],
            },
          ],
        },
      ];
    }

    const tables = await Table.findAll(options);

    res.json({ tables });
  } catch (error) {
    console.error("Get tables error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Obtener mesas disponibles
exports.getAvailableTables = async (req, res) => {
  try {
    const tables = await Table.findAll({
      where: {
        status: "available",
        is_active: true,
      },
      order: [["table_number", "ASC"]],
    });

    res.json({ tables });
  } catch (error) {
    console.error("Get available tables error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Obtener mesa por ID
exports.getTableById = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id, {
      include: [
        {
          model: Order,
          as: "orders",
          where: {
            status: {
              [Op.in]: ["pending", "preparing", "ready", "delivered"],
            },
          },
          required: false,
          include: [
            {
              model: User,
              as: "waiter",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    res.json({ table });
  } catch (error) {
    console.error("Get table error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Crear nueva mesa
exports.createTable = async (req, res) => {
  try {
    const { table_number, capacity, location, status, is_active } = req.body;

    // Validaciones
    if (!table_number) {
      return res.status(400).json({ message: "Table number is required" });
    }

    // Verificar si el número de mesa ya existe
    const existingTable = await Table.findOne({ where: { table_number } });
    if (existingTable) {
      return res.status(400).json({ message: "Table number already exists" });
    }

    const table = await Table.create({
      table_number,
      capacity: capacity || 4,
      location,
      status: status || "available",
      is_active: is_active !== undefined ? is_active : true,
    });

    res.status(201).json({
      message: "Table created successfully",
      table,
    });
  } catch (error) {
    console.error("Create table error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Actualizar mesa
exports.updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { table_number, capacity, location, status, is_active } = req.body;

    const table = await Table.findByPk(id);

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    // Verificar número de mesa único
    if (table_number && table_number !== table.table_number) {
      const existingTable = await Table.findOne({ where: { table_number } });
      if (existingTable) {
        return res.status(400).json({ message: "Table number already exists" });
      }
    }

    await table.update({
      table_number: table_number || table.table_number,
      capacity: capacity !== undefined ? capacity : table.capacity,
      location: location !== undefined ? location : table.location,
      status: status || table.status,
      is_active: is_active !== undefined ? is_active : table.is_active,
    });

    res.json({
      message: "Table updated successfully",
      table,
    });
  } catch (error) {
    console.error("Update table error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Eliminar mesa
exports.deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id, {
      include: [
        {
          model: Order,
          as: "orders",
          required: false,
        },
      ],
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    // No permitir eliminar mesas ocupadas
    if (table.status === "occupied") {
      return res.status(400).json({
        message:
          "No se puede eliminar una mesa ocupada. Por favor, libérela primero.",
      });
    }

    // Verificar si la mesa tiene órdenes activas (no pagadas/canceladas)
    if (table.orders && table.orders.length > 0) {
      const activeOrders = table.orders.filter(
        (order) => !["paid", "cancelled"].includes(order.status)
      );

      if (activeOrders.length > 0) {
        return res.status(400).json({
          message:
            "No se puede eliminar la mesa porque tiene órdenes activas. Complete o cancele las órdenes primero.",
        });
      }
    }

    await table.destroy();

    res.json({ message: "Table deleted successfully" });
  } catch (error) {
    console.error("Delete table error:", error);

    // Manejar error de foreign key constraint
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        message:
          "No se puede eliminar la mesa porque tiene órdenes asociadas. Considere desactivarla en su lugar.",
      });
    }

    res.status(500).json({
      message: "Error del servidor al eliminar la mesa",
      error: error.message,
    });
  }
};

// Cambiar estado de mesa
exports.updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["available", "occupied", "reserved", "maintenance"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        validStatuses,
      });
    }

    const table = await Table.findByPk(id);

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    // Si se libera la mesa, quitar orden actual
    if (status === "available") {
      await table.update({
        status,
        current_order_id: null,
      });
    } else {
      await table.update({ status });
    }

    res.json({
      message: "Table status updated successfully",
      table,
    });
  } catch (error) {
    console.error("Update table status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Alternar estado activo/inactivo
exports.toggleTableStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id);

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    // No permitir desactivar mesas ocupadas
    if (table.status === "occupied" && table.is_active) {
      return res.status(400).json({
        message: "Cannot deactivate an occupied table",
      });
    }

    await table.update({ is_active: !table.is_active });

    res.json({
      message: `Table ${
        table.is_active ? "activated" : "deactivated"
      } successfully`,
      table,
    });
  } catch (error) {
    console.error("Toggle table status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
