const express = require("express");
const router = express.Router();
const cashierController = require("../controllers/cashierController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Proteger todas las rutas con autenticación y rol de cajero
router.use(authMiddleware);
router.use(roleMiddleware("cajero", "admin"));

// Obtener órdenes pendientes de pago
router.get("/pending-payments", cashierController.getPendingPayments);

// Procesar pago de una orden
router.post("/process-payment/:id", cashierController.processPayment);

// Obtener historial de pagos del día
router.get("/daily-payments", cashierController.getDailyPayments);

// Obtener estadísticas de caja del día
router.get("/stats", cashierController.getDailyCashierStats);

// Obtener resumen de cierre de caja
router.get("/cash-closing", cashierController.getCashClosing);

// Reimprimir recibo
router.get("/reprint-receipt/:id", cashierController.reprintReceipt);

module.exports = router;
