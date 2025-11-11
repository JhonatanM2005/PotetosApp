import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  MoveUp,
  MoveDown,
  Power,
  PowerOff,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { categoryService } from "../../services";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    order_index: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll(true);
      setCategories(data.categories || []);
    } catch (error) {
      toast.error("Error al cargar categorías");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const categoryData = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        order_index: parseInt(formData.order_index) || 0,
        is_active: formData.is_active,
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.id, categoryData);
        toast.success("Categoría actualizada correctamente");
      } else {
        await categoryService.create(categoryData);
        toast.success("Categoría creada correctamente");
      }
      fetchCategories();
      closeModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al guardar la categoría"
      );
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;
    try {
      await categoryService.delete(id);
      toast.success("Categoría eliminada correctamente");
      fetchCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al eliminar la categoría"
      );
      console.error(error);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await categoryService.toggleStatus(id);
      toast.success("Estado actualizado");
      fetchCategories();
    } catch (error) {
      toast.error("Error al cambiar el estado");
      console.error(error);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        icon: category.icon || "",
        order_index: category.order_index || 0,
        is_active: category.is_active,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        icon: "",
        order_index: categories.length + 1,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      icon: "",
      order_index: 0,
      is_active: true,
    });
  };

  const emojiSuggestions = [
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
    "🎉",
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">CATEGORÍAS</h1>
            <p className="text-gray-600 mt-2">
              Gestiona las categorías del menú
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-primary text-secondary px-6 py-3 rounded-full font-bold hover:opacity-90 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Nueva Categoría
          </button>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`bg-white rounded-2xl shadow-md p-6 border-2 transition ${
                  category.is_active
                    ? "border-transparent"
                    : "border-red-300 opacity-60"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{category.icon || "📂"}</span>
                    <div>
                      <h3 className="text-xl font-bold text-primary">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Orden: {category.order_index}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      category.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {category.is_active ? "Activa" : "Inactiva"}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 text-sm">
                  {category.description || "Sin descripción"}
                </p>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    {category.dishes?.length || 0} platos
                  </p>
                  {category.dishes && category.dishes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {category.dishes.slice(0, 3).map((dish) => (
                        <span
                          key={dish.id}
                          className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                        >
                          {dish.name}
                        </span>
                      ))}
                      {category.dishes.length > 3 && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          +{category.dishes.length - 3} más
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStatus(category.id)}
                    className={`flex-1 p-2 rounded-lg transition ${
                      category.is_active
                        ? "text-orange-600 hover:bg-orange-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={category.is_active ? "Desactivar" : "Activar"}
                  >
                    {category.is_active ? (
                      <PowerOff size={18} />
                    ) : (
                      <Power size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => openModal(category)}
                    className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No hay categorías. Crea una nueva para empezar.
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre *
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Icono (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none text-2xl text-center"
                    placeholder="🍽️"
                    maxLength={2}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {emojiSuggestions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, icon: emoji })
                        }
                        className="text-2xl hover:bg-gray-100 p-2 rounded-lg transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Orden de aparición
                  </label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) =>
                      setFormData({ ...formData, order_index: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                    min="0"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor="is_active"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Categoría activa
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
                    {editingCategory ? "Actualizar" : "Crear"}
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
