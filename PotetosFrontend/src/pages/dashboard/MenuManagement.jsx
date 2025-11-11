import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Eye, EyeOff } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { dishService, categoryService } from "../../services";
import toast from "react-hot-toast";

export default function MenuManagementPage() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
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
          <button
            onClick={() => openModal()}
            className="bg-primary text-secondary px-6 py-3 rounded-full font-bold hover:opacity-90 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Plato
          </button>
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
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
