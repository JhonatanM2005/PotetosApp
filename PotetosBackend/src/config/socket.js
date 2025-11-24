const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

// Mapa para rastrear token -> socketId
const tokenToSocketMap = new Map();

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Middleware de autenticación para Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      socket.token = token; // Guardar token en el socket
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `✅ User connected: ${socket.user.email} (Role: ${socket.user.role})`
    );

    // Registrar token -> socketId
    tokenToSocketMap.set(socket.token, socket.id);

    // Unir a sala según rol
    if (socket.user.role === "chef") {
      socket.join("kitchen");
      console.log(`👨‍🍳 Chef joined kitchen room`);
    }

    if (socket.user.role === "mesero") {
      socket.join("waiters");
      console.log(`🍽️ Waiter joined waiters room`);
    }

    if (socket.user.role === "cajero" || socket.user.role === "admin") {
      socket.join("cashier");
      console.log(`💳 Cashier joined cashier room`);
    }

    // Evento: Nuevo pedido creado
    socket.on("order:created", (orderData) => {
      // Enviar a cocina
      io.to("kitchen").emit("kitchen:newOrder", orderData);
      console.log(`📋 New order sent to kitchen: #${orderData.orderNumber}`);
    });

    // Evento: Cambio de estado de item
    socket.on("orderItem:statusChanged", (data) => {
      // Notificar a meseros
      io.to("waiters").emit("order:itemStatusChanged", data);
      console.log(`🔄 Order item status changed: ${data.status}`);
    });

    // Evento: Pedido listo
    socket.on("order:ready", (orderData) => {
      // Notificar a meseros
      io.to("waiters").emit("order:ready", orderData);
      console.log(
        `✅ Order ready notification sent: #${orderData.orderNumber}`
      );
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user.email}`);
      // Limpiar del mapa
      tokenToSocketMap.delete(socket.token);
    });
  });

  // Función helper para cerrar sesión remota por token
  io.closeSessionByToken = (oldToken, message) => {
    const socketId = tokenToSocketMap.get(oldToken);
    if (socketId) {
      io.to(socketId).emit("session:closed", {
        reason: "new_login",
        message:
          message ||
          "Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo",
      });
      console.log(`🔒 Session closed remotely for socket: ${socketId}`);
    }
  };

  // Hacer io accesible globalmente
  global.io = io;

  return io;
};
