const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorMiddleware = require("./middlewares/errorMiddleware");

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const kitchenRoutes = require("./routes/kitchenRoutes");
const cashierRoutes = require("./routes/cashierRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const dishRoutes = require("./routes/dishRoutes");
const tableRoutes = require("./routes/tableRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Ruta raíz - Bienvenida
app.get("/", (req, res) => {
  res.json({
    message: "🍟 POTETOS ERP API",
    version: "1.0.0",
    status: "online",
    endpoints: {
      health: "/health",
      api: "/api",
      auth: "/api/auth",
      users: "/api/users",
      orders: "/api/orders",
      kitchen: "/api/kitchen",
      categories: "/api/categories",
      dishes: "/api/dishes",
      tables: "/api/tables",
      dashboard: "/api/dashboard",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "POTETOS ERP API is running" });
});

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/kitchen", kitchenRoutes);
app.use("/api/cashier", cashierRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Manejo de errores
app.use(errorMiddleware);

module.exports = app;
