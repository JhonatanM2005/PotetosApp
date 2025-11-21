const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

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
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // Unir a sala según rol
    if (socket.user.role === "chef") {
      socket.join("kitchen");
    }

    if (socket.user.role === "mesero") {
      socket.join("waiters");
    }

    // Evento: Nuevo pedido creado
    socket.on("order:created", (orderData) => {
      // Enviar a cocina
      io.to("kitchen").emit("kitchen:newOrder", orderData);
    });

    // Evento: Cambio de estado de item
    socket.on("orderItem:statusChanged", (data) => {
      // Notificar a meseros
      io.to("waiters").emit("order:itemStatusChanged", data);
    });

    // Evento: Pedido listo
    socket.on("order:ready", (orderData) => {
      // Notificar a meseros
      io.to("waiters").emit("order:ready", orderData);
    });

    socket.on("disconnect", () => {
      // Usuario desconectado
    });
  });

  // Hacer io accesible globalmente
  global.io = io;

  return io;
};
