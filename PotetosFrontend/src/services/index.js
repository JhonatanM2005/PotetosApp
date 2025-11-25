import api from "./api";
import socketService from "./socket";

// ========== CATEGORIES ==========

export const categoryService = {
  // Obtener todas las categorías (autenticado)
  getAll: async (includeDishes = false) => {
    const params = includeDishes ? { include_dishes: true } : {};
    const response = await api.get("/categories", { params });
    return response.data;
  },

  // Obtener categorías activas (público)
  getActive: async () => {
    const response = await api.get("/categories/active");
    return response.data;
  },

  // Obtener categoría por ID
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Crear categoría (admin)
  create: async (data) => {
    const response = await api.post("/categories", data);
    return response.data;
  },

  // Actualizar categoría (admin)
  update: async (id, data) => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  // Eliminar categoría (admin)
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Activar/Desactivar categoría (admin)
  toggleStatus: async (id) => {
    const response = await api.patch(`/categories/${id}/toggle-status`);
    return response.data;
  },
};

// ========== DISHES ==========

export const dishService = {
  // Obtener todos los platos (autenticado)
  getAll: async (filters = {}) => {
    const response = await api.get("/dishes", { params: filters });
    return response.data;
  },

  // Obtener platos disponibles (público)
  getAvailable: async () => {
    const response = await api.get("/dishes/available");
    return response.data;
  },

  // Obtener plato por ID
  getById: async (id) => {
    const response = await api.get(`/dishes/${id}`);
    return response.data;
  },

  // Crear plato (admin)
  create: async (data) => {
    const response = await api.post("/dishes", data);
    return response.data;
  },

  // Actualizar plato (admin)
  update: async (id, data) => {
    const response = await api.patch(`/dishes/${id}`, data);
    return response.data;
  },

  // Eliminar plato (admin)
  delete: async (id) => {
    const response = await api.delete(`/dishes/${id}`);
    return response.data;
  },

  // Cambiar disponibilidad (admin)
  toggleAvailability: async (id) => {
    const response = await api.patch(`/dishes/${id}/toggle-availability`);
    return response.data;
  },

  // Activar/Desactivar plato (admin)
  toggleStatus: async (id) => {
    const response = await api.patch(`/dishes/${id}/toggle-status`);
    return response.data;
  },
};

// ========== TABLES ==========

export const tableService = {
  // Obtener todas las mesas
  getAll: async (params = {}) => {
    const response = await api.get("/tables", { params });
    return response.data;
  },

  // Obtener mesas disponibles
  getAvailable: async () => {
    const response = await api.get("/tables/available");
    return response.data;
  },

  // Obtener mesa por ID
  getById: async (id) => {
    const response = await api.get(`/tables/${id}`);
    return response.data;
  },

  // Crear mesa (admin)
  create: async (data) => {
    const response = await api.post("/tables", data);
    return response.data;
  },

  // Actualizar mesa (admin)
  update: async (id, data) => {
    const response = await api.patch(`/tables/${id}`, data);
    return response.data;
  },

  // Eliminar mesa (admin)
  delete: async (id) => {
    const response = await api.delete(`/tables/${id}`);
    return response.data;
  },

  // Cambiar estado de mesa (admin)
  updateStatus: async (id, status) => {
    const response = await api.patch(`/tables/${id}/status`, { status });
    return response.data;
  },

  // Activar/Desactivar mesa (admin)
  toggleStatus: async (id) => {
    const response = await api.patch(`/tables/${id}/toggle-status`);
    return response.data;
  },
};

// ========== ORDERS ==========

export const orderService = {
  // Obtener todas las órdenes
  getAll: async () => {
    const response = await api.get("/orders");
    return response.data;
  },

  // Obtener órdenes activas
  getActive: async () => {
    const response = await api.get("/orders/active");
    return response.data;
  },

  // Obtener orden por ID
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Crear orden
  create: async (data) => {
    const response = await api.post("/orders", data);
    return response.data;
  },

  // Actualizar estado de orden
  updateStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Eliminar orden
  delete: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await api.get("/orders/stats");
    return response.data;
  },
};

// ========== KITCHEN ==========

export const kitchenService = {
  // Obtener órdenes de cocina
  getOrders: async () => {
    const response = await api.get("/kitchen/orders");
    return response.data;
  },

  // Actualizar estado de item
  updateItemStatus: async (id, status) => {
    const response = await api.patch(`/kitchen/items/${id}/status`, { status });
    return response.data;
  },
};

// ========== USERS ==========

export const userService = {
  // Obtener todos los usuarios
  getAll: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  // Obtener usuario por ID
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Crear usuario
  create: async (data) => {
    const response = await api.post("/users", data);
    return response.data;
  },

  // Actualizar usuario
  update: async (id, data) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  // Eliminar usuario
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Cambiar contraseña de un usuario específico (admin)
  changeUserPassword: async (id, newPassword) => {
    const response = await api.patch(`/users/${id}/password`, { newPassword });
    return response.data;
  },

  // Activar/Desactivar usuario
  toggleStatus: async (id) => {
    const response = await api.patch(`/users/${id}/toggle-status`);
    return response.data;
  },

  // Actualizar perfil del usuario actual
  updateProfile: async (data) => {
    const response = await api.patch("/auth/profile", data);
    return response.data;
  },

  // Cambiar contraseña del usuario actual
  changeOwnPassword: async (data) => {
    const response = await api.patch("/auth/change-password", data);
    return response.data;
  },

  // Obtener estadísticas del usuario actual
  getStats: async () => {
    const response = await api.get("/auth/stats");
    return response.data;
  },
};

// ========== AUTH ==========

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // Obtener usuario actual
  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Recuperación de contraseña - Enviar código
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Verificar código de recuperación
  verifyResetCode: async (email, code) => {
    const response = await api.post("/auth/verify-reset-code", { email, code });
    return response.data;
  },

  // Resetear contraseña
  resetPassword: async (resetToken, newPassword) => {
    const response = await api.post("/auth/reset-password", {
      resetToken,
      newPassword,
    });
    return response.data;
  },
};

// ========== DASHBOARD ==========

export const dashboardService = {
  // Obtener estadísticas del dashboard
  getStats: async (period = "week") => {
    const response = await api.get("/dashboard/stats", { params: { period } });
    return response.data;
  },

  // Obtener estadísticas del día
  getTodayStats: async () => {
    const response = await api.get("/dashboard/today");
    return response.data;
  },
};

// ========== RESERVATIONS ==========

export const reservationService = {
  // Crear reserva (público - sin autenticación)
  create: async (data) => {
    const response = await api.post("/reservations", data);
    return response.data;
  },

  // Obtener todas las reservas (autenticado)
  getAll: async (filters = {}) => {
    const response = await api.get("/reservations", { params: filters });
    return response.data;
  },

  // Obtener reservas del día (autenticado)
  getToday: async () => {
    const response = await api.get("/reservations/today");
    return response.data;
  },

  // Obtener próximas reservas (autenticado)
  getUpcoming: async () => {
    const response = await api.get("/reservations/upcoming");
    return response.data;
  },

  // Obtener reserva por ID (autenticado)
  getById: async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  // Actualizar estado de reserva (autenticado)
  updateStatus: async (id, status) => {
    const response = await api.patch(`/reservations/${id}/status`, { status });
    return response.data;
  },

  // Eliminar reserva (admin)
  delete: async (id) => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  },

  // Obtener estadísticas (autenticado)
  getStats: async () => {
    const response = await api.get("/reservations/stats");
    return response.data;
  },
};

// ========== CASHIER ==========

export const cashierService = {
  // Obtener órdenes entregadas para pagar
  getDeliveredOrders: async () => {
    const response = await api.get("/cashier/orders/delivered");
    return response.data;
  },

  // Obtener detalles de una orden para pagar
  getOrderForPayment: async (id) => {
    const response = await api.get(`/cashier/payment/${id}`);
    return response.data;
  },

  // Procesar pago de una orden
  processPayment: async (orderId, data) => {
    const response = await api.post(`/cashier/payment/${orderId}/process`, data);
    return response.data;
  },

  // Obtener historial de pagos
  getPaymentHistory: async (filters = {}) => {
    const response = await api.get("/cashier/history", { params: filters });
    return response.data;
  },

  // Obtener estadísticas del cajero
  getStats: async () => {
    const response = await api.get("/cashier/stats");
    return response.data;
  },
};

export default {
  category: categoryService,
  dish: dishService,
  table: tableService,
  order: orderService,
  kitchen: kitchenService,
  user: userService,
  auth: authService,
  dashboard: dashboardService,
  reservation: reservationService,
  cashier: cashierService,
};
