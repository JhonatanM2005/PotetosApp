import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  Home,
  ShoppingCart,
  Menu,
  Users,
  UtensilsCrossed,
  Settings,
} from "lucide-react";
import logo from "@/assets/images/favicon-potetos.svg";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

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

  // Agregar item de usuarios para admins
  if (user?.role === "admin") {
    menuItems.push({ path: "/users", icon: Users, label: "Usuarios" });
  }

  // Agregar configuración al final
  menuItems.push({ path: "/settings", icon: Settings, label: "Configuración" });

  const isActive = (path) => location.pathname === path;

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
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
