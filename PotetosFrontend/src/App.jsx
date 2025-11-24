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

// Route Components
import PublicRoute from "./components/routes/PublicRoute";

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
import CashierPage from "./pages/dashboard/Cashier";
import PaymentHistoryPage from "./pages/dashboard/PaymentHistory";
import InvoiceViewPage from "./pages/dashboard/InvoiceView";
import InvoicesPage from "./pages/dashboard/Invoices";
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
          {/* Public Routes - Wrapped with PublicRoute */}
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/menu" element={<PublicRoute><MenuPage /></PublicRoute>} />
          <Route path="/reservations" element={<PublicRoute><ReservationsPage /></PublicRoute>} />
          <Route path="/about" element={<PublicRoute><AboutPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/verify-code" element={<PublicRoute><VerifyCodePage /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
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
          path="/dashboard/cashier"
          element={
            <ProtectedRoute>
              <CashierPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/payment-history"
          element={
            <ProtectedRoute>
              <PaymentHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/invoice/:paymentId"
          element={
            <ProtectedRoute>
              <InvoiceViewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/invoices"
          element={
            <ProtectedRoute>
              <InvoicesPage />
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
