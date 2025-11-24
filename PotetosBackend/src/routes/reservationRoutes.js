const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Ruta pública - Crear reserva (sin autenticación)
router.post("/", reservationController.createReservation);

// Rutas protegidas - Requieren autenticación
router.use(authMiddleware);

router.get("/", reservationController.getAllReservations);
router.get("/stats", reservationController.getReservationStats);
router.get("/today", reservationController.getTodayReservations);
router.get("/upcoming", reservationController.getUpcomingReservations);
router.get("/:id", reservationController.getReservationById);
router.patch("/:id/status", reservationController.updateReservationStatus);

// Solo admin puede eliminar
router.delete(
  "/:id",
  roleMiddleware("admin"),
  reservationController.deleteReservation
);

module.exports = router;
