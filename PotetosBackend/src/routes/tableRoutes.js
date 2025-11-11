const express = require("express");
const router = express.Router();
const tableController = require("../controllers/tableController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET endpoints - Todos los usuarios autenticados
router.get("/", tableController.getTables);
router.get("/available", tableController.getAvailableTables);
router.get("/:id", tableController.getTableById);

// Rutas de administración - Solo admin
router.use(roleMiddleware("admin"));

router.post("/", tableController.createTable);
router.patch("/:id", tableController.updateTable);
router.delete("/:id", tableController.deleteTable);
router.patch("/:id/status", tableController.updateTableStatus);
router.patch("/:id/toggle-status", tableController.toggleTableStatus);

module.exports = router;
