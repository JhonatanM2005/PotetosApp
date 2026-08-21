const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Errores de validación en los datos enviados",
      errors: errors.array(),
    });
  }
  next();
};

module.exports = validateRequest;
