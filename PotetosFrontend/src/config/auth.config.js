/**
 * Configuración de autenticación
 */

export const authConfig = {
  // Tiempo de inactividad en minutos (por defecto 15 minutos)
  // La sesión se cerrará automáticamente después de este tiempo sin actividad
  inactivityTimeout: 15,

  // Eventos que resetean el timer de inactividad
  activityEvents: [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
    "click",
  ],

  // Usar sessionStorage en lugar de localStorage
  // sessionStorage se limpia automáticamente al cerrar el navegador
  useSessionStorage: true,
};

// Convertir minutos a milisegundos
export const getInactivityTimeoutMs = () =>
  authConfig.inactivityTimeout * 60 * 1000;
