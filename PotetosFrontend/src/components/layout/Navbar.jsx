import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { User, Menu, X, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/images/logo.png";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navigationItems = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/orders", label: "Órdenes" },
        { href: "/menu", label: "Menú" },
        ...(user?.role === "chef"
          ? [{ href: "/kitchen", label: "Cocina" }]
          : []),
        ...(user?.role === "admin"
          ? [{ href: "/users", label: "Usuarios" }]
          : []),
      ]
    : [
        { href: "/", label: "Inicio" },
        { href: "#menu", label: "Menú" },
        { href: "#about", label: "Nosotros" },
        { href: "#contact", label: "Contacto" },
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
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <img src={logo} alt="PoTaTos" className="h-14 w-auto" />
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
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {isAuthenticated ? (
              <>
                {/* User Info - Desktop */}
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-500">Hola</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.name}
                    </p>
                  </div>
                </div>

                {/* User Menu - Desktop */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                  title="Salir"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
              >
                <User size={18} />
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
                      ? "text-orange-600 bg-orange-50 border-l-4 border-orange-600"
                      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  {/* User Info Mobile */}
                  <div className="px-4 py-3 mt-2 bg-orange-50 rounded-lg border-l-4 border-orange-600">
                    <p className="text-xs text-gray-500 mb-1">Usuario</p>
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-600 capitalize">
                      Rol: {user?.role}
                    </p>
                  </div>

                  {/* Logout Button Mobile */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 justify-center mt-2"
                  >
                    <LogOut size={16} />
                    Salir
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
