const { Dish, Category } = require("../models");

// Obtener todos los platos
exports.getDishes = async (req, res) => {
  try {
    const { category_id, is_available } = req.query;

    const where = {};
    if (category_id) where.category_id = category_id;
    if (is_available !== undefined)
      where.is_available = is_available === "true";

    const dishes = await Dish.findAll({
      where,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "icon"],
        },
      ],
      order: [["name", "ASC"]],
    });

    res.json({ dishes });
  } catch (error) {
    console.error("Get dishes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Obtener platos disponibles (para menú público)
exports.getAvailableDishes = async (req, res) => {
  try {
    const dishes = await Dish.findAll({
      where: {
        is_active: true,
        is_available: true,
      },
      include: [
        {
          model: Category,
          as: "category",
          where: { is_active: true },
          attributes: ["id", "name", "icon"],
        },
      ],
      order: [
        ["category_id", "ASC"],
        ["name", "ASC"],
      ],
    });

    res.json({ dishes });
  } catch (error) {
    console.error("Get available dishes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Obtener plato por ID
exports.getDishById = async (req, res) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    res.json({ dish });
  } catch (error) {
    console.error("Get dish error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Crear nuevo plato
exports.createDish = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category_id,
      image_url,
      preparation_time,
      is_available,
      is_active,
    } = req.body;

    // Validaciones
    if (!name || !price || !category_id) {
      return res.status(400).json({
        message: "Name, price and category are required",
      });
    }

    // Verificar que la categoría existe
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const dish = await Dish.create({
      name,
      description,
      price,
      category_id,
      image_url,
      preparation_time: preparation_time || 15,
      is_available: is_available !== undefined ? is_available : true,
      is_active: is_active !== undefined ? is_active : true,
    });

    // Obtener plato con categoría
    const dishWithCategory = await Dish.findByPk(dish.id, {
      include: [{ model: Category, as: "category" }],
    });

    res.status(201).json({
      message: "Dish created successfully",
      dish: dishWithCategory,
    });
  } catch (error) {
    console.error("Create dish error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Actualizar plato
exports.updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category_id,
      image_url,
      preparation_time,
      is_available,
      is_active,
    } = req.body;

    const dish = await Dish.findByPk(id);

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    // Si se cambia categoría, verificar que existe
    if (category_id && category_id !== dish.category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    await dish.update({
      name: name || dish.name,
      description: description !== undefined ? description : dish.description,
      price: price || dish.price,
      category_id: category_id || dish.category_id,
      image_url: image_url !== undefined ? image_url : dish.image_url,
      preparation_time:
        preparation_time !== undefined
          ? preparation_time
          : dish.preparation_time,
      is_available:
        is_available !== undefined ? is_available : dish.is_available,
      is_active: is_active !== undefined ? is_active : dish.is_active,
    });

    // Obtener plato actualizado con categoría
    const updatedDish = await Dish.findByPk(id, {
      include: [{ model: Category, as: "category" }],
    });

    res.json({
      message: "Dish updated successfully",
      dish: updatedDish,
    });
  } catch (error) {
    console.error("Update dish error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Eliminar plato
exports.deleteDish = async (req, res) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findByPk(id);

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    await dish.destroy();

    res.json({ message: "Dish deleted successfully" });
  } catch (error) {
    console.error("Delete dish error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Alternar disponibilidad
exports.toggleDishAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findByPk(id);

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    await dish.update({ is_available: !dish.is_available });

    res.json({
      message: `Dish ${
        dish.is_available ? "is now available" : "is now unavailable"
      }`,
      dish,
    });
  } catch (error) {
    console.error("Toggle dish availability error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Alternar estado activo/inactivo
exports.toggleDishStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findByPk(id);

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    await dish.update({ is_active: !dish.is_active });

    res.json({
      message: `Dish ${
        dish.is_active ? "activated" : "deactivated"
      } successfully`,
      dish,
    });
  } catch (error) {
    console.error("Toggle dish status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
