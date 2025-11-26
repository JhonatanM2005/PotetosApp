const { Sequelize } = require("sequelize");

// Verificar que la URL de la base de datos está configurada
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL no está definida en .env");
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  // Opciones de logging:
  // false: Sin logs
  // console.log: Todos los logs (actual en dev)
  // (msg) => console.log(msg): Solo mostrar ciertos mensajes
  logging: false, // Desactivar logs SQL para producción y desarrollo limpio
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
