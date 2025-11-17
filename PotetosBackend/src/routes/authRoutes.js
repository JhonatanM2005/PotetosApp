const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);
router.patch("/profile", authMiddleware, authController.updateProfile);
router.patch("/change-password", authMiddleware, authController.changePassword);
router.get("/stats", authMiddleware, userController.getUserStats);

module.exports = router;
