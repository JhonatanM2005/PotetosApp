import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Grid2x2Plus,
  Power,
  PowerOff,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { dishService, categoryService } from "../../services";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

export default function MenuManagementPage() {
  const { user } = useAuthStore();
  const isChef = user?.role === "chef";
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalTab, setCategoryModalTab] = useState("list"); // "list" or "form"
  const [editingDish, setEditingDish] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    icon: "",
    is_active: true,
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    preparation_time: 15,
    available: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dishesData, categoriesData] = await Promise.all([
        dishService.getAll(),
        categoryService.getAll(),
      ]);
      setDishes(dishesData.dishes || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      toast.error("Error al cargar datos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dishData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        preparation_time: parseInt(formData.preparation_time) || 15,
        is_available: formData.available,
        is_active: true,
      };

      if (editingDish) {
        await dishService.update(editingDish.id, dishData);
        toast.success("Plato actualizado correctamente");
      } else {
        await dishService.create(dishData);
        toast.success("Plato creado correctamente");
      }
      fetchData();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al guardar el plato");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este plato?")) return;
    try {
      await dishService.delete(id);
      toast.success("Plato eliminado correctamente");
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al eliminar el plato"
      );
      console.error(error);
    }
  };

  const toggleAvailability = async (id) => {
    try {
      await dishService.toggleAvailability(id);
      toast.success("Disponibilidad actualizada");
      fetchData();
    } catch (error) {
      toast.error("Error al cambiar disponibilidad");
      console.error(error);
    }
  };

  // Category Management Functions
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const categoryData = {
        name: categoryFormData.name,
        description: categoryFormData.description,
        icon: categoryFormData.icon,
        is_active: categoryFormData.is_active,
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.id, categoryData);
        toast.success("Categoría actualizada correctamente");
      } else {
        await categoryService.create(categoryData);
        toast.success("Categoría creada correctamente");
      }
      fetchData();
      closeCategoryModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al guardar la categoría"
      );
      console.error(error);
    }
  };

  const handleCategoryDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;
    try {
      await categoryService.delete(id);
      toast.success("Categoría eliminada correctamente");
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al eliminar la categoría"
      );
      console.error(error);
    }
  };

  const toggleCategoryStatus = async (id) => {
    try {
      await categoryService.toggleStatus(id);
      toast.success("Estado actualizado");
      fetchData();
    } catch (error) {
      toast.error("Error al cambiar el estado");
      console.error(error);
    }
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        description: category.description || "",
        icon: category.icon || "",
        is_active: category.is_active,
      });
      setCategoryModalTab("form"); // Switch to form tab when editing
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: "",
        description: "",
        icon: "",
        is_active: true,
      });
      setCategoryModalTab("list"); // Start with list tab
    }
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryModalTab("list");
    setCategoryFormData({
      name: "",
      description: "",
      icon: "",
      is_active: true,
    });
  };

  const openModal = (dish = null) => {
    if (dish) {
      setEditingDish(dish);
      setFormData({
        name: dish.name,
        description: dish.description || "",
        price: dish.price,
        category_id: dish.category_id,
        preparation_time: dish.preparation_time || 15,
        available: dish.is_available,
      });
    } else {
      setEditingDish(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category_id: "",
        preparation_time: 15,
        available: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDish(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category_id: "",
      preparation_time: 15,
      available: true,
    });
  };

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      !selectedCategory || dish.category_id === selectedCategory;
    const matchesSearch = dish.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">MENÚ</h1>
          {!isChef && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="bg-white border-2 border-primary text-primary px-6 py-3 rounded-full font-bold hover:bg-primary hover:text-secondary transition flex items-center gap-2"
              >
                <Grid2x2Plus size={20} />
                Gestionar Categorías
              </button>
              <button
                onClick={() => openModal()}
                className="bg-primary text-secondary px-6 py-3 rounded-full font-bold hover:opacity-90 transition flex items-center gap-2"
              >
                <Plus size={20} />
                Nuevo Plato
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar platos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                selectedCategory === null
                  ? "bg-secondary text-primary"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-semibold transition ${
                  selectedCategory === category.id
                    ? "bg-secondary text-primary"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-6 py-4 text-left">Nombre</th>
                <th className="px-6 py-4 text-left">Descripción</th>
                <th className="px-6 py-4 text-left">Precio</th>
                <th className="px-6 py-4 text-left">Categoría</th>
                <th className="px-6 py-4 text-left">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : filteredDishes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No hay platos disponibles
                  </td>
                </tr>
              ) : (
                filteredDishes.map((dish) => (
                  <tr key={dish.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{dish.name}</td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-xs">
                      {dish.description || "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-secondary">
                      ${parseFloat(dish.price)?.toLocaleString("es-CO")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1">
                        {dish.category?.icon} {dish.category?.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          dish.is_available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {dish.is_available ? "Disponible" : "No disponible"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => toggleAvailability(dish.id)}
                          className={`p-2 rounded-lg transition ${
                            dish.is_available
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={
                            dish.is_available
                              ? "Marcar no disponible"
                              : "Marcar disponible"
                          }
                        >
                          {dish.is_available ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                        {!isChef && (
                          <>
                            <button
                              onClick={() => openModal(dish)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(dish.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Category Management Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-primary">
                    Gestionar Categorías
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Organiza las categorías de tu menú
                  </p>
                </div>
                <button
                  onClick={() => closeCategoryModal()}
                  className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 px-6">
                <button
                  onClick={() => setCategoryModalTab("list")}
                  className={`px-6 py-3 font-semibold border-b-2 transition ${
                    categoryModalTab === "list"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  📋 Lista de Categorías ({categories.length})
                </button>
                <button
                  onClick={() => {
                    setCategoryModalTab("form");
                    if (editingCategory) {
                      setEditingCategory(null);
                      setCategoryFormData({
                        name: "",
                        description: "",
                        icon: "",
                        is_active: true,
                      });
                    }
                  }}
                  className={`px-6 py-3 font-semibold border-b-2 transition ${
                    categoryModalTab === "form"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {editingCategory
                    ? "✏️ Editar Categoría"
                    : "➕ Nueva Categoría"}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {categoryModalTab === "list" ? (
                  /* Categories List View */
                  <div>
                    {categories.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">📂</div>
                        <p className="text-xl font-semibold text-gray-800 mb-2">
                          No hay categorías
                        </p>
                        <p className="text-gray-600 mb-6">
                          Crea tu primera categoría para organizar el menú
                        </p>
                        <button
                          onClick={() => setCategoryModalTab("form")}
                          className="bg-primary text-secondary px-6 py-3 rounded-full font-bold hover:opacity-90 transition inline-flex items-center gap-2"
                        >
                          <Plus size={20} />
                          Crear Primera Categoría
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className={`bg-linear-to-br from-white to-gray-50 border-2 rounded-xl p-5 transition-all hover:shadow-lg ${
                              category.is_active
                                ? "border-gray-200 hover:border-primary"
                                : "border-red-200 opacity-60"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-start gap-3 flex-1">
                                <span className="text-4xl">
                                  {category.icon || "📂"}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-lg text-gray-800 truncate">
                                    {category.name}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {category.dishes?.length || 0} platos
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold shrink-0 ${
                                  category.is_active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {category.is_active ? "✓" : "✗"}
                              </span>
                            </div>

                            {category.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {category.description}
                              </p>
                            )}

                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                              <button
                                onClick={() =>
                                  toggleCategoryStatus(category.id)
                                }
                                className={`flex-1 py-2 px-3 rounded-lg transition font-semibold text-sm flex items-center justify-center gap-1 ${
                                  category.is_active
                                    ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                                    : "bg-green-50 text-green-700 hover:bg-green-100"
                                }`}
                                title={
                                  category.is_active ? "Desactivar" : "Activar"
                                }
                              >
                                {category.is_active ? (
                                  <PowerOff size={14} />
                                ) : (
                                  <Power size={14} />
                                )}
                              </button>
                              <button
                                onClick={() => openCategoryModal(category)}
                                className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition font-semibold text-sm flex items-center justify-center gap-1"
                                title="Editar"
                              >
                                <Edit2 size={14} />
                                Editar
                              </button>
                              <button
                                onClick={() =>
                                  handleCategoryDelete(category.id)
                                }
                                className="py-2 px-3 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Category Form View */
                  <div className="max-w-3xl mx-auto">
                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
                      <form
                        onSubmit={handleCategorySubmit}
                        className="p-8 space-y-6"
                      >
                        {/* Nombre */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            Nombre de la Categoría *
                          </label>
                          <input
                            type="text"
                            value={categoryFormData.name}
                            onChange={(e) =>
                              setCategoryFormData({
                                ...categoryFormData,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition"
                            placeholder="Ej: Entradas, Platos Fuertes, Bebidas, Postres..."
                            required
                          />
                        </div>

                        {/* Emoji Selector */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            Selecciona un Icono
                          </label>
                          <div className="bg-linear-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200">
                            <div className="grid grid-cols-8 gap-3">
                              {[
                                "🥗",
                                "🍽️",
                                "🍔",
                                "🍕",
                                "🥤",
                                "🍰",
                                "🍗",
                                "🌮",
                                "🍜",
                                "🥘",
                                "🍱",
                                "🍻",
                                "☕",
                                "🥙",
                                "🍖",
                                "🥩",
                                "🍷",
                                "🍝",
                                "🍛",
                                "🥟",
                                "🍣",
                                "🌭",
                                "🥪",
                                "🧁",
                              ].map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() =>
                                    setCategoryFormData({
                                      ...categoryFormData,
                                      icon: emoji,
                                    })
                                  }
                                  className={`aspect-square text-4xl rounded-xl transition-all transform hover:scale-110 ${
                                    categoryFormData.icon === emoji
                                      ? "bg-primary text-white shadow-lg scale-110"
                                      : "bg-white hover:bg-primary/5 hover:shadow-md"
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-300">
                              <p className="text-xs text-gray-600 mb-2">
                                O escribe tu propio emoji:
                              </p>
                              <input
                                type="text"
                                value={categoryFormData.icon}
                                onChange={(e) =>
                                  setCategoryFormData({
                                    ...categoryFormData,
                                    icon: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-3xl text-center transition bg-white"
                                placeholder="🍽️"
                                maxLength={2}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Descripción */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            Descripción
                            <span className="text-gray-400 font-normal ml-2">
                              (Opcional)
                            </span>
                          </label>
                          <textarea
                            value={categoryFormData.description}
                            onChange={(e) =>
                              setCategoryFormData({
                                ...categoryFormData,
                                description: e.target.value,
                              })
                            }
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition resize-none"
                            rows="3"
                            placeholder="Una breve descripción de esta categoría..."
                          />
                        </div>

                        {/* Estado Activo */}
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                          <label className="flex items-center gap-4 cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                id="cat_is_active"
                                checked={categoryFormData.is_active}
                                onChange={(e) =>
                                  setCategoryFormData({
                                    ...categoryFormData,
                                    is_active: e.target.checked,
                                  })
                                }
                                className="w-6 h-6 text-primary rounded-lg focus:ring-2 focus:ring-primary/20 cursor-pointer"
                              />
                            </div>
                            <div className="flex-1">
                              <span className="text-base font-bold text-gray-800 group-hover:text-primary transition">
                                Categoría activa
                              </span>
                              <p className="text-sm text-gray-500 mt-0.5">
                                Las categorías inactivas no se mostrarán en el
                                menú
                              </p>
                            </div>
                          </label>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex gap-4 pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryModalTab("list");
                              setEditingCategory(null);
                              setCategoryFormData({
                                name: "",
                                description: "",
                                icon: "",
                                is_active: true,
                              });
                            }}
                            className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-400 transition text-lg"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-6 py-4 bg-primary text-secondary rounded-2xl font-bold hover:opacity-90 transition shadow-xl shadow-primary/30 text-lg"
                          >
                            {editingCategory
                              ? "💾 Guardar Cambios"
                              : "✨ Crear Categoría"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {categoryModalTab === "list" && categories.length > 0 && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <button
                    onClick={() => setCategoryModalTab("form")}
                    className="w-full bg-primary text-secondary px-6 py-3 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Plus size={20} />
                    Agregar Nueva Categoría
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dish Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {editingDish ? "Editar Plato" : "Nuevo Plato"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Precio ($)
                    </label>
                    <input
                      type="number"
                      step="100"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tiempo Prep. (min)
                    </label>
                    <input
                      type="number"
                      value={formData.preparation_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preparation_time: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) =>
                      setFormData({ ...formData, available: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor="available"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Disponible
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-secondary rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    {editingDish ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
