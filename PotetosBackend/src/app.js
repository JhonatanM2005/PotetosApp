/**
 * PotetosApp - Sistema de Gestión para Restaurantes
 *
 * Copyright (c) 2025 Jhonatan Mendez
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file in the root directory for full license text.
 */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
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
const reservationRoutes = require("./routes/reservationRoutes");

const app = express();

// Middlewares
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Limitar tamaño del body (100kb es más que suficiente para esta API)
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting general para toda la API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas solicitudes, por favor intenta más tarde" },
});
app.use("/api", apiLimiter);

// Rate limiting estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados intentos, por favor intenta en 15 minutos" },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/reservations", rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas reservas creadas, intenta más tarde" },
  skip: (req) => req.method !== "POST", // solo limitar POST
}));

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
      cashier: "/api/cashier",
      reservations: "/api/reservations",
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
app.use("/api/reservations", reservationRoutes);

// Manejo de errores
app.use(errorMiddleware);

module.exports = app;
