import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { User, Menu, X, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/images/logo.png";
import userIcon from "@/assets/images/User.svg";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Si el usuario está autenticado, no mostramos enlaces de navegación
  // Solo mostramos el ícono de usuario que lleva a Settings
  const navigationItems = isAuthenticated ? [] : [
    { href: "/", label: "Inicio" },
    { href: "/menu", label: "Menú" },
    { href: "/reservations", label: "Reservas" },
    { href: "/about", label: "Nosotros" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  return (
    <header className="bg-primary border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="Potetos" className="h-14 w-auto" />
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex gap-11">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-bold transition-colors ${
                  isActive(item.href)
                    ? "text-secondary border-b-2 border-secondary"
                    : "text-white hover:text-secondary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section - User & Actions */}
          <div className="flex items-center gap-4 text-secondary">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-secondary hover:text-primary rounded-lg transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {isAuthenticated ? (
              // Solo mostrar ícono de usuario que lleva a Settings
              <Link
                to="/dashboard/settings"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-primary hover:opacity-90 transition-colors shadow-md hover:shadow-lg"
                title="Configuración"
              >
                <img src={userIcon} alt="User" className="w-6 h-6" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-primary hover:opacity-90 transition-colors shadow-md hover:shadow-lg"
              >
                <img src={userIcon} alt="User" className="w-6 h-6" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <nav className="flex flex-col gap-2 mt-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "text-primary bg-secondary border-l-4 border-primary"
                      : "text-white hover:text-secondary hover:bg-primary/80"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {isAuthenticated && (
                // Link a Settings en mobile
                <Link
                  to="/dashboard/settings"
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-3 text-sm font-medium text-primary bg-secondary hover:bg-secondary/90 rounded-lg transition-colors flex items-center gap-2 justify-center mt-2"
                >
                  <Settings size={16} />
                  Ir a Configuración
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
