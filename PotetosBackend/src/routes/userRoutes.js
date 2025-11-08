const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Solo admin puede acceder
router.use(roleMiddleware("admin"));

// CRUD de usuarios
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.patch("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// Acciones especiales
router.patch("/:id/password", userController.changePassword);
router.patch("/:id/toggle-status", userController.toggleUserStatus);

module.exports = router;
