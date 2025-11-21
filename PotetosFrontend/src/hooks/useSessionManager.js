import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import socketService from '../services/socket';
import toast from 'react-hot-toast';

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
      console.log('🔒 Sesión cerrada remotamente:', data);
      
      // Mostrar toast inmediato
      toast.error('Tu sesión ha sido cerrada desde otro dispositivo', {
        duration: 4000,
        icon: '🔒',
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
        },
      });

      // Mostrar modal
      setSessionClosedReason(data.reason || 'new_login');
      setShowSessionModal(true);

      // Ejecutar logout local
      logout();
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
