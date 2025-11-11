const { Category, Dish } = require("../models");

// Obtener todas las categorías
exports.getCategories = async (req, res) => {
  try {
    const { include_dishes } = req.query;

    const options = {
      order: [
        ["order_index", "ASC"],
        ["name", "ASC"],
      ],
    };

    // Incluir platos si se solicita
    if (include_dishes === "true") {
      options.include = [
        {
          model: Dish,
          as: "dishes",
          where: { is_active: true },
          required: false,
          attributes: { exclude: ["created_at", "updated_at"] },
        },
      ];
    }

    const categories = await Category.findAll(options);

    res.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Obtener categorías activas
exports.getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      include: [
        {
          model: Dish,
          as: "dishes",
          where: { is_active: true, is_available: true },
          required: false,
        },
      ],
      order: [
        ["order_index", "ASC"],
        ["name", "ASC"],
      ],
    });

    res.json({ categories });
  } catch (error) {
    console.error("Get active categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Obtener categoría por ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Dish,
          as: "dishes",
          attributes: { exclude: ["created_at", "updated_at"] },
        },
      ],
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ category });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Crear nueva categoría
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon, order_index, is_active } = req.body;

    // Validaciones
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Verificar si ya existe
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      description,
      icon,
      order_index: order_index || 0,
      is_active: is_active !== undefined ? is_active : true,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Actualizar categoría
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, order_index, is_active } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Verificar nombre único
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return res
          .status(400)
          .json({ message: "Category name already exists" });
      }
    }

    await category.update({
      name: name || category.name,
      description:
        description !== undefined ? description : category.description,
      icon: icon !== undefined ? icon : category.icon,
      order_index:
        order_index !== undefined ? order_index : category.order_index,
      is_active: is_active !== undefined ? is_active : category.is_active,
    });

    res.json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Eliminar categoría
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [{ model: Dish, as: "dishes" }],
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Verificar si tiene platos asociados
    if (category.dishes && category.dishes.length > 0) {
      return res.status(400).json({
        message: "Cannot delete category with associated dishes",
        dishCount: category.dishes.length,
      });
    }

    await category.destroy();

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Alternar estado activo/inactivo
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.update({ is_active: !category.is_active });

    res.json({
      message: `Category ${
        category.is_active ? "activated" : "deactivated"
      } successfully`,
      category,
    });
  } catch (error) {
    console.error("Toggle category status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
