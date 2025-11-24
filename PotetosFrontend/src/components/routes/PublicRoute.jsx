import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/**
 * PublicRoute - Wrapper para rutas públicas
 * Redirige usuarios autenticados al dashboard
 * Solo permite acceso a usuarios no autenticados
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
