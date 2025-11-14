import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";
import {
  Home,
  NotebookPen,
  BookOpenText,
  Users,
  UtensilsCrossed,
  Settings,
  LogOut,
  AlertTriangle,
  Grid2x2Plus,
  BarChart3,
  Icon,
} from "lucide-react";
import { chairsTablePlatter } from "@lucide/lab";
import logo from "@/assets/images/favicon-potetos.svg";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    {
      path: "/dashboard",
      icon: Home,
      label: "Dashboard",
      roles: ["admin", "gerente", "mesero", "chef"],
    },
    {
      path: "/dashboard/stats",
      icon: BarChart3,
      label: "Estadísticas",
      roles: ["admin", "gerente"],
    },
    {
      path: "/dashboard/categories",
      icon: Grid2x2Plus,
      label: "Categorías",
      roles: ["admin"],
    },
    {
      path: "/dashboard/menu",
      icon: BookOpenText,
      label: "Menú",
      roles: ["admin", "gerente", "mesero"],
    },
    {
      path: "/dashboard/tables",
      icon: chairsTablePlatter,
      label: "Mesas",
      roles: ["admin", "gerente"],
      isCustomIcon: true,
    },
    {
      path: "/dashboard/orders",
      icon: NotebookPen,
      label: "Órdenes",
      roles: ["admin", "gerente", "mesero"],
    },
    {
      path: "/dashboard/kitchen",
      icon: UtensilsCrossed,
      label: "Cocina",
      roles: ["chef"],
    },
    {
      path: "/dashboard/users",
      icon: Users,
      label: "Usuarios",
      roles: ["admin"],
    },
    {
      path: "/dashboard/settings",
      icon: Settings,
      label: "Configuración",
      roles: ["admin", "gerente", "mesero", "chef"],
    }
  ];

  // Filtrar items según el rol del usuario
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-16 bg-primary flex flex-col items-center py-6 gap-6 fixed h-screen z-40">
        {/* Logo */}
        <div className="mb-4">
          <img src={logo} alt="Potetos" className="h-10 w-10 rounded-lg" />
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-4 flex-1 overflow-y-auto scrollbar-hide">
          {filteredMenuItems.map((item) => {
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
                {item.isCustomIcon ? (
                  <Icon iconNode={item.icon} size={24} />
                ) : (
                  <item.icon size={24} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="p-3 rounded-lg transition-all text-secondary hover:bg-red-600 hover:text-white mt-auto"
          title="Cerrar Sesión"
        >
          <LogOut size={24} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-16 overflow-x-hidden">{children}</main>

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
