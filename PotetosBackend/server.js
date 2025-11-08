require("dotenv").config();
const app = require("./src/app");
const { sequelize } = require("./src/models");
const http = require("http");
const socketConfig = require("./src/config/socket");

const PORT = process.env.PORT || 5000;

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar Socket.io
const io = socketConfig(server);

// Sincronizar base de datos y levantar servidor
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully");
    return sequelize.sync({ alter: false }); // Cambiar a 'true' solo en desarrollo
  })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io ready for real-time connections`);
    });
  })
  .catch((err) => {
    console.error("❌ Unable to connect to database:", err);
    process.exit(1);
  });
