const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

// Estadísticas del dashboard (admin y gerentes)
router.get(
  "/stats",
  roleMiddleware("admin", "gerente"),
  dashboardController.getDashboardStats
);

// Estadísticas del día
router.get(
  "/today",
  roleMiddleware("admin", "gerente"),
  dashboardController.getTodayStats
);

module.exports = router;
