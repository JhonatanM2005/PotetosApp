const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

// Estadísticas del dashboard (admin)
router.get(
  "/stats",
  roleMiddleware("admin"),
  dashboardController.getDashboardStats
);

// Estadísticas del día
router.get(
  "/today",
  roleMiddleware("admin"),
  dashboardController.getTodayStats
);

// Estadísticas para el resumen admin
router.get(
  "/admin-stats",
  roleMiddleware("admin"),
  dashboardController.getAdminStats
);

// Exportar datos para Excel
router.get(
  "/export",
  roleMiddleware("admin"),
  dashboardController.getExportData
);

module.exports = router;
