const express = require("express");
const router = express.Router();
const kitchenController = require("../controllers/kitchenController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);
router.use(roleMiddleware("admin", "chef"));

router.get("/orders", kitchenController.getKitchenOrders);
router.patch("/items/:id/status", kitchenController.updateItemStatus);

module.exports = router;
