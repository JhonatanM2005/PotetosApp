const { body } = require("express-validator");
const validateRequest = require("../middlewares/validateRequest");

exports.validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Por favor ingrese un correo electrónico válido")
    .isLength({ max: 100 })
    .withMessage("El correo es demasiado largo"),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ max: 255 })
    .withMessage("La contraseña es demasiado larga"),
  validateRequest,
];

exports.validateForgotPassword = [
  body("email")
    .isEmail()
    .withMessage("Por favor ingrese un correo electrónico válido")
    .isLength({ max: 100 })
    .withMessage("El correo es demasiado largo"),
  validateRequest,
];

exports.validateResetPassword = [
  body("resetToken")
    .notEmpty()
    .withMessage("El token es requerido")
    .isLength({ max: 1000 })
    .withMessage("El token es demasiado largo"),
  body("newPassword")
    .notEmpty()
    .withMessage("La nueva contraseña es requerida")
    .isLength({ min: 8, max: 255 })
    .withMessage("La contraseña debe tener entre 8 y 255 caracteres"),
  validateRequest,
];

exports.validateVerifyResetCode = [
  body("email")
    .isEmail()
    .withMessage("Por favor ingrese un correo electrónico válido")
    .isLength({ max: 100 }),
  body("code")
    .notEmpty()
    .withMessage("El código es requerido")
    .isLength({ max: 10 }),
  validateRequest,
];
