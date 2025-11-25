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
  ChevronRight,
  ChevronLeft,
  DollarSign,
  FileText,
  Calendar,
} from "lucide-react";
import { chairsTablePlatter } from "@lucide/lab";
import favicon from "@/assets/images/favicon-potetos.svg";
import logo from "@/assets/images/logo.png";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const menuItems = [
    {
      path: "/dashboard",
      icon: Home,
      label: "Inicio",
      roles: ["admin", "mesero", "chef", "cajero"],
    },
        {
      path: "/dashboard/stats",
      icon: BarChart3,
      label: "Estadísticas",
      roles: ["admin"],
    },
    {
      path: "/dashboard/menu",
      icon: BookOpenText,
      label: "Menú",
      roles: ["admin", "mesero", "chef"],
    },
    {
      path: "/dashboard/tables",
      icon: chairsTablePlatter,
      label: "Mesas",
      roles: ["admin"],
      isCustomIcon: true,
    },
    {
      path: "/dashboard/orders",
      icon: NotebookPen,
      label: "Órdenes",
      roles: ["admin", "mesero"],
    },
    {
      path: "/dashboard/reservations",
      icon: Calendar,
      label: "Reservas",
      roles: ["admin", "mesero"],
    },
    {
      path: "/dashboard/kitchen",
      icon: UtensilsCrossed,
      label: "Cocina",
      roles: ["chef"],
    },
    {
      path: "/dashboard/cashier",
      icon: DollarSign,
      label: "Caja",
      roles: ["cajero"],
    },
    {
      path: "/dashboard/cashier/reports",
      icon: FileText,
      label: "Reportes",
      roles: ["cajero"],
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
      roles: ["admin", "mesero", "chef", "cajero"],
    },
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
      <aside
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        className={`fixed lg:sticky top-0 left-0 h-screen bg-primary flex flex-col py-6 z-40 transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "w-64" : "w-16"
        }`}
      >
        {/* Logo */}
        <div className="mb-6 px-3 flex items-center justify-center">
          <img
            src={isSidebarExpanded ? logo : favicon}
            alt="Potetos"
            className={`transition-all duration-300 rounded-lg ${
              isSidebarExpanded ? "h-12 w-auto" : "h-10 w-10"
            }`}
          />
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide px-2">
          {filteredMenuItems.map((item) => {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all group ${
                  isActive(item.path)
                    ? "bg-secondary text-primary"
                    : "text-secondary hover:bg-secondary/20"
                }`}
                title={item.label}
              >
                <div className="shrink-0">
                  {item.isCustomIcon ? (
                    <Icon iconNode={item.icon} size={24} />
                  ) : (
                    <item.icon size={24} />
                  )}
                </div>
                <span
                  className={`font-medium whitespace-nowrap transition-all duration-300 ${
                    isSidebarExpanded
                      ? "opacity-100 w-auto"
                      : "opacity-0 w-0 overflow-hidden"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-3 p-3 mx-2 rounded-lg transition-all text-secondary hover:bg-red-600 hover:text-white mt-auto group"
          title="Cerrar Sesión"
        >
          <LogOut size={24} className="shrink-0" />
          <span
            className={`font-medium whitespace-nowrap transition-all duration-300 ${
              isSidebarExpanded
                ? "opacity-100 w-auto"
                : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            Cerrar Sesión
          </span>
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
