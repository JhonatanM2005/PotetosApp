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

// Rutas de administración - Solo admin
router.use(roleMiddleware("admin"));

router.post("/", dishController.createDish);
router.patch("/:id", dishController.updateDish);
router.delete("/:id", dishController.deleteDish);
router.patch("/:id/toggle-availability", dishController.toggleDishAvailability);
router.patch("/:id/toggle-status", dishController.toggleDishStatus);

module.exports = router;
