import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  LogOut,
  UtensilsCrossed,
  ShoppingCart,
  Menu,
  User as UserIcon,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🥔</span>
            <h1 className="text-2xl font-bold text-orange-600">POTETOS</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg">
              <UserIcon size={18} className="text-orange-600" />
              <div>
                <p className="text-xs text-gray-500">Hola</p>
                <p className="font-semibold text-gray-800">{user?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-md hover:shadow-lg"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Bienvenido al Sistema POTETOS
          </h2>
          <p className="text-gray-600">
            Gestiona eficientemente tu restaurante desde aquí
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Card: Órdenes */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden border-t-4 border-orange-500">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <ShoppingCart className="text-orange-600" size={28} />
                </div>
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Órdenes</h3>
              <p className="text-gray-600 text-sm mb-4">
                Gestiona los pedidos del restaurante
              </p>
              <button
                onClick={() => navigate("/orders")}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition font-semibold"
              >
                Ir a Órdenes
              </button>
            </div>
          </div>

          {/* Card: Cocina - Solo para Chefs */}
          {user?.role === "chef" && (
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden border-t-4 border-red-500">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <UtensilsCrossed className="text-red-600" size={28} />
                  </div>
                  <span className="text-2xl">👨‍🍳</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Cocina</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Gestiona los pedidos en preparación
                </p>
                <button
                  onClick={() => navigate("/kitchen")}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                >
                  Ir a Cocina
                </button>
              </div>
            </div>
          )}

          {/* Card: Menú */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden border-t-4 border-green-500">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Menu className="text-green-600" size={28} />
                </div>
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Menú</h3>
              <p className="text-gray-600 text-sm mb-4">
                Visualiza los platos disponibles
              </p>
              <button
                onClick={() => navigate("/menu")}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-semibold"
              >
                Ver Menú
              </button>
            </div>
          </div>

          {/* Card: Gestión de Usuarios - Solo para Admin */}
          {user?.role === "admin" && (
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden border-t-4 border-purple-500">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="text-purple-600" size={28} />
                  </div>
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Usuarios
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Gestiona los usuarios del sistema
                </p>
                <button
                  onClick={() => navigate("/users")}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                >
                  Ir a Usuarios
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            📊 Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Rol</p>
              <p className="text-2xl font-bold text-blue-600 capitalize">
                {user?.role}
              </p>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-sm font-semibold text-purple-600 break-all">
                {user?.email}
              </p>
            </div>
            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Usuario ID</p>
              <p className="text-2xl font-bold text-green-600">#{user?.id}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
