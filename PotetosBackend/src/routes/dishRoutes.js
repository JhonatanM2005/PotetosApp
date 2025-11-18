const express = require("express");
const router = express.Router();
const dishController = require("../controllers/dishController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Rutas públicas (sin autenticación)
router.get("/available", dishController.getAvailableDishes);

// Rutas protegidas
router.use(authMiddleware);

// GET endpoints - Todos los usuarios autenticados
router.get("/", dishController.getDishes);
router.get("/:id", dishController.getDishById);

// Toggle availability - Admin y Chef pueden cambiar disponibilidad
router.patch(
  "/:id/toggle-availability",
  roleMiddleware("admin", "chef"),
  dishController.toggleDishAvailability
);

// Rutas de administración - Solo admin
router.post("/", roleMiddleware("admin"), dishController.createDish);
router.patch("/:id", roleMiddleware("admin"), dishController.updateDish);
router.delete("/:id", roleMiddleware("admin"), dishController.deleteDish);
router.patch(
  "/:id/toggle-status",
  roleMiddleware("admin"),
  dishController.toggleDishStatus
);

module.exports = router;
