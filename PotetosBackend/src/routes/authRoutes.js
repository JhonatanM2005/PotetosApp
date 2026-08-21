const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const authValidator = require("../validators/authValidator");

router.post("/login", authValidator.validateLogin, authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.me);
router.patch("/profile", authMiddleware, authController.updateProfile);
router.patch("/change-password", authMiddleware, authController.changePassword);
router.get("/stats", authMiddleware, userController.getUserStats);

// Password reset routes
router.post("/forgot-password", authValidator.validateForgotPassword, authController.forgotPassword);
router.post("/verify-reset-code", authValidator.validateVerifyResetCode, authController.verifyResetCode);
router.post("/reset-password", authValidator.validateResetPassword, authController.resetPassword);

module.exports = router;
