import api from "./api";

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
  // Obtener órdenes activas
  getActive: async () => {
    const response = await api.get("/orders/active");
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

  // Cambiar contraseña
  changePassword: async (id, newPassword) => {
    const response = await api.patch(`/users/${id}/password`, { newPassword });
    return response.data;
  },

  // Activar/Desactivar usuario
  toggleStatus: async (id) => {
    const response = await api.patch(`/users/${id}/toggle-status`);
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
};

export default {
  category: categoryService,
  dish: dishService,
  table: tableService,
  order: orderService,
  kitchen: kitchenService,
  user: userService,
  auth: authService,
};
