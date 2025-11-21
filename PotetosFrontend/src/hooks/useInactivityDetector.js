import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authConfig } from '../config/auth.config';

/**
 * Hook para detectar actividad del usuario y resetear el timer de inactividad
 */
const useInactivityDetector = () => {
  const { isAuthenticated, resetInactivityTimer } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Eventos que indican actividad del usuario (desde configuración)
    const events = authConfig.activityEvents;

    // Handler que resetea el timer
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Agregar listeners para cada evento
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup: remover listeners
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, resetInactivityTimer]);
};

export default useInactivityDetector;
