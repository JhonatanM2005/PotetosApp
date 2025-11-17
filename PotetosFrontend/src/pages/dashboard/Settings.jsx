import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  LogOut,
  Edit2,
  Shield,
  AlertTriangle,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { userService, orderService } from "../../services";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    todayOrders: 0,
    weekOrders: 0,
    monthOrders: 0,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUserStats();
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const data = await userService.getStats();
      setUserStats(data.stats || {});
    } catch (error) {
      console.error("Error al cargar estadísticas", error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(formData);
      toast.success("Perfil actualizado correctamente");
      setShowEditModal(false);
    } catch (error) {
      toast.error("Error al actualizar el perfil");
      console.error(error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Contraseña actualizada correctamente");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Error al cambiar la contraseña");
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getRoleName = (role) => {
    const roles = {
      admin: "Administrador Principal",
      chef: "Chef",
      mesero: "Mesero",
      cajero: "Cajero",
    };
    return roles[role] || role;
  };

  return (
    <DashboardLayout>
      <div className="p-8 bg-[#f5f3eb] min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">MI PERFIL</h1>
          <p className="text-gray-600">
            Gestiona tu información personal y configuración
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Header with gradient */}
              <div className="h-32 bg-linear-to-r from-primary to-[#1a0d4d]"></div>

              {/* Profile Info */}
              <div className="px-8 pb-8">
                {/* Avatar */}
                <div className="flex justify-between items-start -mt-16 mb-6">
                  <div className="bg-secondary rounded-full p-1">
                    <div className="w-28 h-28 bg-secondary rounded-full flex items-center justify-center text-primary">
                      <User size={48} strokeWidth={2} />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="mt-20 bg-[#6b4fa0] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    Editar Perfil
                  </button>
                </div>

                {/* User Info */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {user?.name || "Usuario"}
                  </h2>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={16} className="text-[#6b4fa0]" />
                    <span className="text-[#6b4fa0] font-semibold">
                      {getRoleName(user?.role)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">
                      Miembro desde{" "}
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString("es-ES")
                        : "2025"}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="text-[#6b4fa0] hover:underline text-sm font-semibold flex items-center gap-1"
                  >
                    <Lock size={14} />
                    Cambiar Contraseña
                  </button>
                </div>

                {/* Personal Information */}
                <div className="bg-[#faf8f3] rounded-xl p-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={18} />
                    Información Personal
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nombre Completo</p>
                      <p className="font-semibold text-gray-800">
                        {user?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-800">
                        {user?.email || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-semibold text-gray-800">
                        {user?.phone || "No especificado"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Estadísticas */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                📊 Mis Estadísticas
              </h3>
              <div className="space-y-3">
                <div className="bg-linear-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                    Total Órdenes
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {userStats.totalOrders || 0}
                  </p>
                </div>
                <div className="bg-linear-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <p className="text-xs text-green-600 font-semibold uppercase mb-1">
                    Completadas
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {userStats.completedOrders || 0}
                  </p>
                </div>
                <div className="bg-linear-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <p className="text-xs text-orange-600 font-semibold uppercase mb-1">
                    Pendientes
                  </p>
                  <p className="text-2xl font-bold text-orange-700">
                    {userStats.pendingOrders || 0}
                  </p>
                </div>
                <div className="bg-linear-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-600 font-semibold uppercase mb-1">
                    Hoy
                  </p>
                  <p className="text-2xl font-bold text-purple-700">
                    {userStats.todayOrders || 0}
                  </p>
                </div>
                <div className="bg-linear-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                  <p className="text-xs text-indigo-600 font-semibold uppercase mb-1">
                    Esta Semana
                  </p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {userStats.weekOrders || 0}
                  </p>
                </div>
                <div className="bg-linear-to-r from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                  <p className="text-xs text-pink-600 font-semibold uppercase mb-1">
                    Este Mes
                  </p>
                  <p className="text-2xl font-bold text-pink-700">
                    {userStats.monthOrders || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="space-y-2">
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition text-left"
                >
                  <LogOut size={18} className="text-red-600" />
                  <span className="font-semibold text-red-600">
                    Cerrar Sesión
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">
                Editar Perfil
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Completo
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
                    Email
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
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-secondary rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">
                Cambiar Contraseña
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-secondary rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Cambiar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={32} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary mb-3">
                  ¿Cerrar Sesión?
                </h2>
                <p className="text-gray-600 mb-8">
                  ¿Estás seguro de que deseas cerrar sesión? Tendrás que volver
                  a iniciar sesión para acceder al sistema.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
