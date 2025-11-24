const sequelize = require("../config/database");
const User = require("./User");
const Category = require("./Category");
const Dish = require("./Dish");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Table = require("./Table");
const PasswordReset = require("./PasswordReset");
const Payment = require("./Payment");
const PaymentSplit = require("./PaymentSplit");

// Relaciones
// Dish - Category
Dish.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Dish, { foreignKey: "category_id", as: "dishes" });

// Order - User (waiter)
Order.belongsTo(User, { foreignKey: "waiter_id", as: "waiter" });
User.hasMany(Order, { foreignKey: "waiter_id", as: "orders" });

// Order - User (cashier)
Order.belongsTo(User, { foreignKey: "cashier_id", as: "cashier" });
User.hasMany(Order, { foreignKey: "cashier_id", as: "processedOrders" });

// Order - Table
Order.belongsTo(Table, { foreignKey: "table_id", as: "table" });
Table.hasMany(Order, { foreignKey: "table_id", as: "orders" });

// Order - OrderItems
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// OrderItem - Dish
OrderItem.belongsTo(Dish, { foreignKey: "dish_id", as: "dish" });
Dish.hasMany(OrderItem, { foreignKey: "dish_id", as: "orderItems" });

// Payment - Order
Payment.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });

// Payment - User (cashier)
Payment.belongsTo(User, { foreignKey: "cashier_id", as: "cashier" });
User.hasMany(Payment, { foreignKey: "cashier_id", as: "payments" });

// PaymentSplit - Payment
PaymentSplit.belongsTo(Payment, { foreignKey: "payment_id", as: "payment" });
Payment.hasMany(PaymentSplit, { foreignKey: "payment_id", as: "splits" });

module.exports = {
  sequelize,
  User,
  Category,
  Dish,
  Order,
  OrderItem,
  Table,
  PasswordReset,
  Payment,
  PaymentSplit,
};
