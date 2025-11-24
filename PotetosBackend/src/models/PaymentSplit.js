const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PaymentSplit = sequelize.define(
  "PaymentSplit",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    payment_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "payments",
        key: "id",
      },
      allowNull: false,
    },
    person_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "card", "transfer"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "payment_splits",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = PaymentSplit;
