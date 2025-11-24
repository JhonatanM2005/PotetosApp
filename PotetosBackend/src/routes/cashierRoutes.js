const express = require("express");
const router = express.Router();
const cashierController = require("../controllers/cashierController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);
router.use(roleMiddleware("admin", "cajero"));

router.get("/orders/delivered", cashierController.getDeliveredOrders);
router.get("/payment/:id", cashierController.getOrderForPayment);
router.post("/payment/:orderId/process", cashierController.processPayment);
router.get("/history", cashierController.getPaymentHistory);
router.get("/stats", cashierController.getCashierStats);

module.exports = router;
