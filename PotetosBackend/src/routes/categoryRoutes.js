const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Rutas públicas (sin autenticación)
router.get("/active", categoryController.getActiveCategories);

// Rutas protegidas
router.use(authMiddleware);

// GET endpoints - Todos los usuarios autenticados
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);

// Rutas de administración - Solo admin
router.use(roleMiddleware("admin"));

router.post("/", categoryController.createCategory);
router.patch("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);
router.patch("/:id/toggle-status", categoryController.toggleCategoryStatus);

module.exports = router;
