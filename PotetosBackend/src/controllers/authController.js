const jwt = require("jsonwebtoken");
const { User, PasswordReset } = require("../models");
const { sendPasswordResetCode } = require("../services/emailService");
const { Op } = require("sequelize");

// Función de validación de contraseña segura
const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("La contraseña debe incluir al menos una letra mayúscula");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("La contraseña debe incluir al menos una letra minúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("La contraseña debe incluir al menos un número");
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) {
    errors.push(
      'La contraseña debe incluir al menos un carácter especial (!@#$%^&*(),.?":{}|<>_-)'
    );
  }

  return errors;
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Buscar usuario
    const user = await User.findOne({ where: { email } });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get current user
exports.me = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verificar si el email ya existe (en otro usuario)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Actualizar campos
    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone: phone !== undefined ? phone : user.phone,
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }

    // Validar seguridad de la nueva contraseña
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message:
          "La nueva contraseña no cumple con los requisitos de seguridad",
        errors: passwordErrors,
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verificar contraseña actual
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Verificar que la nueva contraseña no sea igual a la actual
    const isSameAsCurrentPassword = await user.comparePassword(newPassword);
    if (isSameAsCurrentPassword) {
      return res.status(400).json({
        message:
          "La nueva contraseña no puede ser igual a la contraseña actual",
      });
    }

    // Verificar que no esté en el historial de contraseñas (últimas 3)
    const passwordHistory = user.password_history || [];
    const bcrypt = require("bcryptjs");

    for (const oldPasswordHash of passwordHistory) {
      const isReused = await bcrypt.compare(newPassword, oldPasswordHash);
      if (isReused) {
        return res.status(400).json({
          message: "No puedes reutilizar ninguna de tus últimas 3 contraseñas",
        });
      }
    }

    // Actualizar historial de contraseñas
    const updatedHistory = [user.password, ...passwordHistory].slice(0, 3);

    // Actualizar contraseña
    await user.update({
      password: newPassword,
      password_history: updatedHistory,
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Forgot password - Send reset code
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Verificar que el usuario existe
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return res.json({
        message: "If the email exists, a reset code has been sent",
      });
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Expiración: 15 minutos
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Invalidar códigos anteriores del mismo email
    await PasswordReset.update(
      { used: true },
      { where: { email, used: false } }
    );

    // Crear nuevo código
    await PasswordReset.create({
      email,
      code,
      expiresAt,
      attempts: 0,
      used: false,
    });

    // Enviar email (pero no fallar si hay error)
    try {
      await sendPasswordResetCode(email, code);
    } catch (emailError) {
      console.error("⚠️ Error al enviar email:", emailError.message);
      // TEMPORAL: Mostrar código en logs para debugging en producción
      console.log(`🔑 CÓDIGO DE RECUPERACIÓN: ${code} para ${email}`);
      // No fallar la petición, solo logear el error
    }

    res.json({
      message: "Reset code sent to your email",
      expiresIn: "15 minutes",
      // TEMPORAL: Incluir código en respuesta para debugging
      ...(process.env.NODE_ENV !== "production" && { code }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    // Buscar código válido
    const resetCode = await PasswordReset.findOne({
      where: {
        email,
        code,
        used: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!resetCode) {
      return res.status(400).json({
        message: "Invalid or expired code",
      });
    }

    // Verificar intentos
    if (resetCode.attempts >= 3) {
      await resetCode.update({ used: true });
      return res.status(400).json({
        message: "Maximum attempts exceeded. Please request a new code",
      });
    }

    // Incrementar intentos si el código no coincide
    if (resetCode.code !== code) {
      await resetCode.increment("attempts");
      return res.status(400).json({
        message: `Invalid code. ${
          3 - (resetCode.attempts + 1)
        } attempts remaining`,
      });
    }

    // Código válido - generar token temporal para resetear contraseña
    const resetToken = jwt.sign(
      { email, resetCodeId: resetCode.id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" } // 10 minutos para cambiar la contraseña
    );

    res.json({
      message: "Code verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ message: "Reset token and new password are required" });
    }

    // Validar seguridad de la nueva contraseña
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: "La contraseña no cumple con los requisitos de seguridad",
        errors: passwordErrors,
      });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const { email, resetCodeId } = decoded;

    // Verificar que el código no haya sido usado
    const resetCode = await PasswordReset.findByPk(resetCodeId);

    if (!resetCode || resetCode.used) {
      return res
        .status(400)
        .json({ message: "Reset code has already been used" });
    }

    // Buscar usuario
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verificar que la nueva contraseña no sea igual a la actual
    const isSameAsCurrentPassword = await user.comparePassword(newPassword);
    if (isSameAsCurrentPassword) {
      return res.status(400).json({
        message:
          "La nueva contraseña no puede ser igual a la contraseña actual",
      });
    }

    // Verificar que no esté en el historial de contraseñas (últimas 3)
    const passwordHistory = user.password_history || [];
    const bcrypt = require("bcryptjs");

    for (const oldPasswordHash of passwordHistory) {
      const isReused = await bcrypt.compare(newPassword, oldPasswordHash);
      if (isReused) {
        return res.status(400).json({
          message: "No puedes reutilizar ninguna de tus últimas 3 contraseñas",
        });
      }
    }

    // Actualizar historial de contraseñas
    const updatedHistory = [user.password, ...passwordHistory].slice(0, 3);

    // Actualizar contraseña
    await user.update({
      password: newPassword,
      password_history: updatedHistory,
    });

    // Marcar código como usado
    await resetCode.update({ used: true });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
