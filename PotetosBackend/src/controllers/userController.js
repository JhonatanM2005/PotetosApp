const { User, Order } = require("../models");
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
    errors.push("La contraseña debe incluir al menos un carácter especial (!@#$%^&*(),.?\":{}|<>_-)");
  }

  return errors;
};

// Obtener estadísticas del usuario actual
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener todas las órdenes del usuario
    const allOrders = await Order.count({
      where: { waiter_id: userId },
    });

    // Órdenes completadas (pagadas)
    const completedOrders = await Order.count({
      where: {
        waiter_id: userId,
        status: "paid",
      },
    });

    // Órdenes pendientes (pending, preparing, ready, delivered)
    const pendingOrders = await Order.count({
      where: {
        waiter_id: userId,
        status: {
          [Op.in]: ["pending", "preparing", "ready", "delivered"],
        },
      },
    });

    // Órdenes de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.count({
      where: {
        waiter_id: userId,
        created_at: {
          [Op.gte]: today,
        },
      },
    });

    // Órdenes de esta semana
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weekOrders = await Order.count({
      where: {
        waiter_id: userId,
        created_at: {
          [Op.gte]: startOfWeek,
        },
      },
    });

    // Órdenes de este mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthOrders = await Order.count({
      where: {
        waiter_id: userId,
        created_at: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    res.json({
      stats: {
        totalOrders: allOrders,
        completedOrders,
        pendingOrders,
        todayOrders,
        weekOrders,
        monthOrders,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["created_at", "DESC"]],
    });

    res.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Obtener usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Crear nuevo usuario
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validaciones
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Name, email, password and role are required" });
    }

    // Validar seguridad de la contraseña
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: "La contraseña no cumple con los requisitos de seguridad",
        errors: passwordErrors,
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role: role || "mesero",
      phone,
      is_active: true,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        is_active: user.is_active,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, is_active } = req.body;

    const user = await User.findByPk(id);

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
      role: role || user.role,
      phone: phone || user.phone,
      is_active: is_active !== undefined ? is_active : user.is_active,
    });

    res.json({
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        is_active: user.is_active,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir eliminar al usuario actual
    if (req.user.id === parseInt(id)) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Validar seguridad de la nueva contraseña
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: "La contraseña no cumple con los requisitos de seguridad",
        errors: passwordErrors,
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({ password: newPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cambiar estado activo/inactivo
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir desactivar al usuario actual
    if (req.user.id === parseInt(id)) {
      return res
        .status(400)
        .json({ message: "Cannot deactivate your own account" });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({ is_active: !user.is_active });

    res.json({
      message: `User ${
        user.is_active ? "activated" : "deactivated"
      } successfully`,
      user: {
        id: user.id,
        is_active: user.is_active,
      },
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
