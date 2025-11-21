import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import useInactivityDetector from "./hooks/useInactivityDetector";
import useSessionManager from "./hooks/useSessionManager";

// Layouts
import Layout from "./components/layout/Layout";

// Common Components
import SessionClosedModal from "./components/common/SessionClosedModal";

// Public Pages
import Home from "./pages/public/Home";
import MenuPage from "./pages/public/Menu";
import ReservationsPage from "./pages/public/Reservations";
import AboutPage from "./pages/public/About";

// Auth Pages
import LoginPage from "./pages/auth/Login";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import VerifyCodePage from "./pages/auth/VerifyCode";
import ResetPasswordPage from "./pages/auth/ResetPassword";

// Protected Pages
import DashboardPage from "./pages/dashboard/Dashboard";
import DashboardStats from "./pages/dashboard/Stats";
import KitchenPage from "./pages/dashboard/Kitchen";
import UsersPage from "./pages/dashboard/Users";
import OrdersPage from "./pages/dashboard/Orders";
import MenuManagementPage from "./pages/dashboard/MenuManagement";
import TablesPage from "./pages/dashboard/Tables";
import SettingsPage from "./pages/dashboard/Settings";

// Protected Route
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { initializeAuth } = useAuthStore();

  // Detectar actividad del usuario para resetear timer de inactividad
  useInactivityDetector();

  // Manejar cierre de sesión remoto
  const { showSessionModal, setShowSessionModal, sessionClosedReason } =
    useSessionManager();

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <Router>
      {/* Modal de sesión cerrada */}
      <SessionClosedModal
        isOpen={showSessionModal}
        reason={sessionClosedReason}
        onClose={() => setShowSessionModal(false)}
      />

      <Routes>
        {/* Routes with Layout (Navbar + Footer) - Public Pages */}
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-code" element={<VerifyCodePage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected Routes - Without Layout (Dashboard has its own sidebar) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/stats"
          element={
            <ProtectedRoute>
              <DashboardStats />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/kitchen"
          element={
            <ProtectedRoute requiredRole="chef">
              <KitchenPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/menu"
          element={
            <ProtectedRoute>
              <MenuManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/tables"
          element={
            <ProtectedRoute requiredRole="admin">
              <TablesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect not found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
