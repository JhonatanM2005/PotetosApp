const sequelize = require("../config/database");
const User = require("./User");
const Category = require("./Category");
const Dish = require("./Dish");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

// Relaciones
// Dish - Category
Dish.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Dish, { foreignKey: "category_id", as: "dishes" });

// Order - User (waiter)
Order.belongsTo(User, { foreignKey: "waiter_id", as: "waiter" });
User.hasMany(Order, { foreignKey: "waiter_id", as: "orders" });

// Order - OrderItems
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// OrderItem - Dish
OrderItem.belongsTo(Dish, { foreignKey: "dish_id", as: "dish" });
Dish.hasMany(OrderItem, { foreignKey: "dish_id", as: "orderItems" });

module.exports = {
  sequelize,
  User,
  Category,
  Dish,
  Order,
  OrderItem,
};
