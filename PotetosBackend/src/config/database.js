const { Sequelize } = require("sequelize");

// Configuración para soportar DATABASE_URL (Neon/producción) o variables individuales (desarrollo local)
let sequelize;

if (process.env.DATABASE_URL) {
  // Usar DATABASE_URL para producción (Neon, Render, etc.)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Necesario para Neon
      },
    },
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // Usar variables individuales para desarrollo local
  if (!process.env.DB_PASSWORD) {
    console.error("❌ DB_PASSWORD no está definida en .env");
    process.exit(1);
  }

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    String(process.env.DB_PASSWORD),
    {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 5432,
      dialect: "postgres",
      logging: process.env.NODE_ENV === "development" ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

module.exports = sequelize;
