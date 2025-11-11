import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  MapPin,
  Power,
  PowerOff,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { tableService } from "../../services";
import toast from "react-hot-toast";

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState({
    table_number: "",
    capacity: 4,
    location: "",
    status: "available",
    is_active: true,
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const data = await tableService.getAll();
      setTables(data.tables || []);
    } catch (error) {
      toast.error("Error al cargar mesas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tableData = {
        table_number: parseInt(formData.table_number),
        capacity: parseInt(formData.capacity),
        location: formData.location,
        status: formData.status,
        is_active: formData.is_active,
      };

      if (editingTable) {
        await tableService.update(editingTable.id, tableData);
        toast.success("Mesa actualizada correctamente");
      } else {
        await tableService.create(tableData);
        toast.success("Mesa creada correctamente");
      }
      fetchTables();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al guardar la mesa");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta mesa?")) return;
    try {
      await tableService.delete(id);
      toast.success("Mesa eliminada correctamente");
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al eliminar la mesa");
      console.error(error);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await tableService.toggleStatus(id);
      toast.success("Estado actualizado");
      fetchTables();
    } catch (error) {
      toast.error("Error al cambiar el estado");
      console.error(error);
    }
  };

  const changeTableStatus = async (id, newStatus) => {
    try {
      await tableService.updateStatus(id, newStatus);
      toast.success("Estado de mesa actualizado");
      fetchTables();
    } catch (error) {
      toast.error("Error al cambiar el estado de la mesa");
      console.error(error);
    }
  };

  const openModal = (table = null) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        table_number: table.table_number,
        capacity: table.capacity,
        location: table.location || "",
        status: table.status,
        is_active: table.is_active,
      });
    } else {
      setEditingTable(null);
      setFormData({
        table_number: "",
        capacity: 4,
        location: "",
        status: "available",
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTable(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      available: "bg-green-100 text-green-800 border-green-300",
      occupied: "bg-red-100 text-red-800 border-red-300",
      reserved: "bg-blue-100 text-blue-800 border-blue-300",
      maintenance: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      available: "Disponible",
      occupied: "Ocupada",
      reserved: "Reservada",
      maintenance: "Mantenimiento",
    };
    return labels[status] || status;
  };

  const filteredTables = tables.filter((table) => {
    if (filterStatus === "all") return true;
    return table.status === filterStatus;
  });

  const groupedTables = filteredTables.reduce((acc, table) => {
    const location = table.location || "Sin ubicación";
    if (!acc[location]) acc[location] = [];
    acc[location].push(table);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">MESAS</h1>
            <p className="text-gray-600 mt-2">
              Gestiona las mesas del restaurante
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-primary text-secondary px-6 py-3 rounded-full font-bold hover:opacity-90 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Nueva Mesa
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                filterStatus === "all"
                  ? "bg-secondary text-primary"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Todas ({tables.length})
            </button>
            <button
              onClick={() => setFilterStatus("available")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                filterStatus === "available"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Disponibles (
              {tables.filter((t) => t.status === "available").length})
            </button>
            <button
              onClick={() => setFilterStatus("occupied")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                filterStatus === "occupied"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Ocupadas ({tables.filter((t) => t.status === "occupied").length})
            </button>
            <button
              onClick={() => setFilterStatus("reserved")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                filterStatus === "reserved"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Reservadas ({tables.filter((t) => t.status === "reserved").length}
              )
            </button>
          </div>
        </div>

        {/* Tables by Location */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTables).map(([location, locationTables]) => (
              <div key={location}>
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <MapPin size={24} />
                  {location}
                  <span className="text-sm text-gray-500 font-normal">
                    ({locationTables.length} mesas)
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {locationTables.map((table) => (
                    <div
                      key={table.id}
                      className={`bg-white rounded-2xl shadow-md p-6 border-2 transition ${
                        table.is_active
                          ? getStatusColor(table.status)
                          : "border-gray-400 opacity-50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-primary">
                            Mesa #{table.table_number}
                          </h3>
                          <div className="flex items-center gap-1 text-gray-600 mt-1">
                            <Users size={16} />
                            <span className="text-sm">
                              {table.capacity} personas
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            table.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {table.is_active ? "Activa" : "Inactiva"}
                        </span>
                      </div>

                      <div className="mb-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            table.status
                          )}`}
                        >
                          {getStatusLabel(table.status)}
                        </span>
                      </div>

                      {/* Quick Status Change */}
                      {table.status !== "occupied" && table.is_active && (
                        <div className="mb-4 flex gap-1">
                          {table.status !== "available" && (
                            <button
                              onClick={() =>
                                changeTableStatus(table.id, "available")
                              }
                              className="flex-1 text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                            >
                              Disponible
                            </button>
                          )}
                          {table.status !== "reserved" && (
                            <button
                              onClick={() =>
                                changeTableStatus(table.id, "reserved")
                              }
                              className="flex-1 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                            >
                              Reservar
                            </button>
                          )}
                          {table.status !== "maintenance" && (
                            <button
                              onClick={() =>
                                changeTableStatus(table.id, "maintenance")
                              }
                              className="flex-1 text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition"
                            >
                              Mant.
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleStatus(table.id)}
                          className={`flex-1 p-2 rounded-lg transition ${
                            table.is_active
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={table.is_active ? "Desactivar" : "Activar"}
                        >
                          {table.is_active ? (
                            <PowerOff size={18} />
                          ) : (
                            <Power size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => openModal(table)}
                          className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(table.id)}
                          className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredTables.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No hay mesas con el filtro seleccionado.
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {editingTable ? "Editar Mesa" : "Nueva Mesa"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número de Mesa *
                    </label>
                    <input
                      type="number"
                      value={formData.table_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          table_number: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Capacidad *
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                    placeholder="Ej: Terraza, Salón Principal, VIP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                  >
                    <option value="available">Disponible</option>
                    <option value="occupied">Ocupada</option>
                    <option value="reserved">Reservada</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
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
                    Mesa activa
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
                    {editingTable ? "Actualizar" : "Crear"}
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
