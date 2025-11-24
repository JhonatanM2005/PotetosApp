import { create } from "zustand";
import api from "../services/api";
import socketService from "../services/socket";
import { getInactivityTimeoutMs } from "../config/auth.config";
import toast from "react-hot-toast";

// Tiempo de inactividad en milisegundos
const INACTIVITY_TIMEOUT = getInactivityTimeoutMs();
let inactivityTimer = null;

// Función para obtener el estado inicial del sessionStorage
// Solo se ejecuta una vez cuando se crea el store
const getInitialAuthState = () => {
  try {
    const token = sessionStorage.getItem("token");
    const userStr = sessionStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    
    return {
      user,
      token,
      isAuthenticated: !!(token && user),
    };
  } catch (error) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }
};

const initialState = getInitialAuthState();

const useAuthStore = create((set, get) => ({
  user: initialState.user,
  token: initialState.token,
  isAuthenticated: initialState.isAuthenticated,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user, info } = response.data;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));

      // Conectar socket
      socketService.connect(token);

      // Iniciar timer de inactividad
      get().resetInactivityTimer();

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });

      // Info sobre sesión anterior (si existe)
      if (info) {
        // Sesión anterior cerrada
      }

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    // Llamar al endpoint de logout para limpiar session_token
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Continuar con el logout local aunque falle el servidor
    }

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    socketService.disconnect();

    // Limpiar timer de inactividad
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  initializeAuth: async () => {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user") || "null");

    if (token && user) {
      set({
        token,
        user,
        isAuthenticated: true,
      });
      socketService.connect(token);

      // Iniciar timer de inactividad
      get().resetInactivityTimer();
    }
  },

  checkAuth: async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return false;
    }

    try {
      const response = await api.get("/auth/me");
      set({ user: response.data.user, isAuthenticated: true });

      // Conectar socket si no está conectado
      socketService.connect(token);

      return true;
    } catch (error) {
      get().logout();
      return false;
    }
  },

  // Resetear el timer de inactividad
  resetInactivityTimer: () => {
    // Limpiar timer anterior
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    // Crear nuevo timer
    inactivityTimer = setTimeout(() => {

      // Mostrar toast antes de cerrar sesión
      toast.error("Tu sesión ha expirado por inactividad", {
        duration: 4000,
        icon: "⏱️",
        position: "top-center",
        style: {
          background: "#f59e0b",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
        },
      });

      get().logout();

      // Pequeño delay para que se vea el toast antes de redirigir
      setTimeout(() => {
        window.location.href = "/login?timeout=true";
      }, 500);
    }, INACTIVITY_TIMEOUT);
  },
}));

export { useAuthStore };
