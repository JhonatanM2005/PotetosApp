import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Shield,
  ChefHat,
  Wallet,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PasswordStrengthIndicator from "../../components/common/PasswordStrengthIndicator";
import { userService } from "../../services";
import toast from "react-hot-toast";

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "mesero",
    phone: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data.users || []);
    } catch (error) {
      toast.error("Error al cargar usuarios");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Editar - actualizar datos del usuario
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
        };

        await userService.update(editingUser.id, updateData);

        // Si se proporciona una nueva contraseña, validarla y actualizarla
        if (formData.password) {
          // Validar contraseña segura
          const passwordRegex = {
            length: formData.password.length >= 8,
            uppercase: /[A-Z]/.test(formData.password),
            lowercase: /[a-z]/.test(formData.password),
            number: /[0-9]/.test(formData.password),
            special: /[!@#$%^&*(),.?":{}|<>_\-]/.test(formData.password),
          };

          const isValid = Object.values(passwordRegex).every((v) => v);
          if (!isValid) {
            toast.error("La contraseña no cumple con los requisitos de seguridad");
            return;
          }

          await userService.changeUserPassword(
            editingUser.id,
            formData.password
          );
        }

        toast.success("Usuario actualizado correctamente");
      } else {
        // Crear nuevo usuario
        if (!formData.password) {
          toast.error("La contraseña es requerida");
          return;
        }

        // Validar contraseña segura
        const passwordRegex = {
          length: formData.password.length >= 8,
          uppercase: /[A-Z]/.test(formData.password),
          lowercase: /[a-z]/.test(formData.password),
          number: /[0-9]/.test(formData.password),
          special: /[!@#$%^&*(),.?":{}|<>_\-]/.test(formData.password),
        };

        const isValid = Object.values(passwordRegex).every((v) => v);
        if (!isValid) {
          toast.error("La contraseña no cumple con los requisitos de seguridad");
          return;
        }

        await userService.create(formData);
        toast.success("Usuario creado correctamente");
      }

      closeModal();
      fetchUsers();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al guardar usuario";
      const errors = error.response?.data?.errors;
      
      if (errors && errors.length > 0) {
        errors.forEach((err) => toast.error(err));
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        phone: user.phone || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "mesero",
        phone: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "mesero",
      phone: "",
    });
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      toast.error("No puedes eliminarte a ti mismo");
      return;
    }
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      await userService.delete(id);
      toast.success("Usuario eliminado correctamente");
      fetchUsers();
    } catch (error) {
      toast.error("Error al eliminar usuario");
      console.error(error);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (id === currentUser.id) {
      toast.error("No puedes cambiar tu propio estado");
      return;
    }

    try {
      await userService.toggleStatus(id);
      toast.success(`Usuario ${currentStatus ? "desactivado" : "activado"}`);
      fetchUsers();
    } catch (error) {
      toast.error("Error al cambiar estado del usuario");
      console.error(error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Reset a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const getRoleInfo = (role) => {
    const roles = {
      admin: {
        name: "Administrador",
        icon: Shield,
        color: "bg-purple-100 text-purple-800",
      },
      chef: { name: "Chef", icon: ChefHat, color: "bg-red-100 text-red-800" },
      cajero: {
        name: "Cajero",
        icon: Wallet,
        color: "bg-green-100 text-green-800",
      },
      mesero: {
        name: "Mesero",
        icon: UserCircle,
        color: "bg-blue-100 text-blue-800",
      },
    };
    return (
      roles[role] || {
        name: role,
        icon: UserCircle,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  const roles = ["admin", "chef", "cajero", "mesero"];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            USUARIOS
          </h1>
          <button
            onClick={() => openModal()}
            className="bg-primary text-secondary px-4 md:px-6 py-2 md:py-3 rounded-full font-bold hover:opacity-90 transition flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nuevo Usuario</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-6 md:mb-8">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none text-sm md:text-base"
            />
          </div>

          {/* Role Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRoleFilter(null)}
              className={`px-3 md:px-4 py-2 rounded-full font-semibold transition text-sm md:text-base ${
                roleFilter === null
                  ? "bg-secondary text-primary"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Todos
            </button>
            {roles.map((role) => {
              const roleInfo = getRoleInfo(role);
              const Icon = roleInfo.icon;
              return (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 rounded-full font-semibold transition flex items-center gap-2 ${
                    roleFilter === role
                      ? "bg-secondary text-primary"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  <Icon size={16} />
                  {roleInfo.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base">
                    Nombre
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base">
                    Email
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base">
                    Rol
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base hidden lg:table-cell">
                    Teléfono
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base hidden sm:table-cell">
                    Estado
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-8 text-gray-500 text-sm md:text-base"
                    >
                      Cargando...
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-8 text-gray-500 text-sm md:text-base"
                    >
                      No hay usuarios disponibles
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    const RoleIcon = roleInfo.icon;
                    return (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-3 md:py-4 font-semibold text-sm md:text-base">
                          {user.name}
                          {user.id === currentUser?.id && (
                            <span className="ml-2 text-xs bg-secondary text-primary px-2 py-1 rounded-full font-bold">
                              TÚ
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${roleInfo.color}`}
                          >
                            <RoleIcon size={14} />
                            {roleInfo.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {user.phone || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              handleToggleStatus(user.id, user.is_active)
                            }
                            disabled={user.id === currentUser?.id}
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
                              user.is_active
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {user.is_active ? (
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
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openModal(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={user.id === currentUser?.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        {filteredUsers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-3 md:p-4 mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs md:text-sm text-gray-600 text-center sm:text-left">
                Mostrando {indexOfFirstItem + 1} a{" "}
                {Math.min(indexOfLastItem, filteredUsers.length)} de{" "}
                {filteredUsers.length} usuarios
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-primary hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft size={18} className="md:w-5 md:h-5" />
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => paginate(index + 1)}
                      className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-semibold transition ${
                        currentPage === index + 1
                          ? "bg-primary text-secondary"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-primary hover:bg-gray-100"
                  }`}
                >
                  <ChevronRight size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre Completo *
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
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {editingUser
                        ? "Contraseña (vacío = sin cambios)"
                        : "Contraseña *"}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                      required={!editingUser}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rol *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                      required
                    >
                      <option value="mesero">Mesero</option>
                      <option value="chef">Chef</option>
                      <option value="cajero">Cajero</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                    />
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="col-span-2">
                      <PasswordStrengthIndicator
                        password={formData.password}
                        showRequirements={true}
                      />
                    </div>
                  )}
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
                    {editingUser ? "Actualizar" : "Crear"}
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
