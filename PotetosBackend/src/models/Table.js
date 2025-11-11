const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Table = sequelize.define(
  "Table",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    table_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4,
    },
    status: {
      type: DataTypes.ENUM("available", "occupied", "reserved", "maintenance"),
      defaultValue: "available",
    },
    current_order_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "orders",
        key: "id",
      },
    },
    location: {
      type: DataTypes.STRING(50),
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "tables",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Table;
