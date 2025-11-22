import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import socketService from "../services/socket";
import toast from "react-hot-toast";

/**
 * Hook para detectar y manejar el cierre de sesión remoto
 */
const useSessionManager = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionClosedReason, setSessionClosedReason] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Configurar listener para sesión cerrada remotamente
    const handleSessionClosed = (data) => {
      setSessionClosedReason(data.reason || "unknown");
      setShowSessionModal(true);
    };

    socketService.onSessionClosed(handleSessionClosed);

    // Cleanup
    return () => {
      socketService.onSessionClosed(null);
    };
  }, [isAuthenticated, logout]);

  return {
    showSessionModal,
    setShowSessionModal,
    sessionClosedReason,
  };
};

export default useSessionManager;
