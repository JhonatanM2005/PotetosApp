const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_number: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
    },
    table_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "tables",
        key: "id",
      },
    },
    waiter_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    cashier_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "preparing",
        "ready",
        "delivered",
        "paid",
        "cancelled"
      ),
      defaultValue: "pending",
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    tip_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "card", "transfer"),
    },
    customer_name: {
      type: DataTypes.STRING(100),
    },
    customer_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    completed_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeCreate: async (order) => {
        // Generar número de orden único
        const date = new Date();
        const timestamp = date.getTime().toString().slice(-6);
        order.order_number = `ORD-${timestamp}`;
      },
    },
  }
);

// Métodos de instancia
Order.prototype.updateStatus = async function (newStatus) {
  this.status = newStatus;
  if (newStatus === "delivered") {
    this.completed_at = new Date();
  }
  return this.save();
};

Order.prototype.calculateTotal = async function () {
  const OrderItem = require("./OrderItem");
  const items = await OrderItem.findAll({ where: { order_id: this.id } });
  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  this.total_amount = total;
  return this.save();
};

// Métodos estáticos
Order.getActiveOrders = async function () {
  return this.findAll({
    where: { status: ["pending", "preparing", "ready"] },
    order: [["created_at", "DESC"]],
  });
};

module.exports = Order;
