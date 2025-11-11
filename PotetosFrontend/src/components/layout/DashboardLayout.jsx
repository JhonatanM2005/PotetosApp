import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";
import {
  Home,
  ShoppingCart,
  Menu,
  Users,
  UtensilsCrossed,
  Settings,
  LogOut,
  AlertTriangle,
  LayoutGrid,
  TableProperties,
} from "lucide-react";
import logo from "@/assets/images/favicon-potetos.svg";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/orders", icon: ShoppingCart, label: "Órdenes" },
    { path: "/dashboard/menu", icon: Menu, label: "Menú" },
  ];

  // Agregar item de cocina para chefs
  if (user?.role === "chef") {
    menuItems.push({
      path: "/kitchen",
      icon: UtensilsCrossed,
      label: "Cocina",
    });
  }

  // Agregar items de gestión para admins
  if (user?.role === "admin") {
    menuItems.push(
      { path: "/dashboard/categories", icon: LayoutGrid, label: "Categorías" },
      { path: "/dashboard/tables", icon: TableProperties, label: "Mesas" },
      { path: "/users", icon: Users, label: "Usuarios" }
    );
  }

  // Agregar configuración al final
  menuItems.push({ path: "/settings", icon: Settings, label: "Configuración" });

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-16 bg-primary flex flex-col items-center py-6 gap-6">
        {/* Logo */}
        <div className="mb-4">
          <img src={logo} alt="Potetos" className="h-10 w-10 rounded-lg" />
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-4 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`p-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? "bg-secondary text-primary"
                    : "text-secondary hover:bg-secondary/20"
                }`}
                title={item.label}
              >
                <Icon size={24} />
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="p-3 rounded-lg transition-all text-secondary hover:bg-red-600 hover:text-white"
          title="Cerrar Sesión"
        >
          <LogOut size={24} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

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
                ¿Estás seguro de que deseas cerrar sesión? Tendrás que volver a
                iniciar sesión para acceder al sistema.
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
  );
}
