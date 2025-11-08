import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function UsersPage() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "mesero",
    phone: "",
  });

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error("Error al cargar usuarios");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Editar
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }

        await api.patch(`/users/${editingId}`, updateData);
        toast.success("Usuario actualizado");
      } else {
        // Crear
        if (!formData.password) {
          toast.error("La contraseña es requerida");
          return;
        }
        await api.post("/users", formData);
        toast.success("Usuario creado");
      }

      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al guardar usuario");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "mesero",
      phone: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (userData) => {
    setFormData({
      name: userData.name,
      email: userData.email,
      password: "",
      role: userData.role,
      phone: userData.phone || "",
    });
    setEditingId(userData.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await api.delete(`/users/${id}`);
        toast.success("Usuario eliminado");
        fetchUsers();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Error al eliminar usuario"
        );
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);
      toast.success(`Usuario ${currentStatus ? "desactivado" : "activado"}`);
      fetchUsers();
    } catch (error) {
      toast.error("Error al cambiar estado del usuario");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              👥 Gestión de Usuarios
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón Nuevo Usuario */}
        <div className="mb-6">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Nuevo Usuario
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-8 border-l-4 border-orange-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingId ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {editingId
                    ? "Contraseña (dejar vacío para no cambiar)"
                    : "Contraseña"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                  required={!editingId}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                >
                  <option value="mesero">Mesero</option>
                  <option value="chef">Chef</option>
                  <option value="cajero">Cajero</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                />
              </div>

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  {editingId ? "Actualizar" : "Crear"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Usuarios */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                      Teléfono
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-gray-800 font-semibold">
                        {u.name}
                        {u.id === currentUser.id && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            TÚ
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : u.role === "chef"
                              ? "bg-red-100 text-red-800"
                              : u.role === "cajero"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {u.phone || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.is_active)}
                          disabled={u.id === currentUser.id}
                          className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold ${
                            u.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          } transition disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {u.is_active ? (
                            <>
                              <Check size={14} /> Activo
                            </>
                          ) : (
                            <>
                              <X size={14} /> Inactivo
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(u)}
                            disabled={u.id === currentUser.id}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={u.id === currentUser.id}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
