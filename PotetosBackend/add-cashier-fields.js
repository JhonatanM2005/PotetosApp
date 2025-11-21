/*
 * Script de migración para agregar campos de cajero al modelo Order
 * Agrega: cashier_id, tip_amount, payment_method
 */

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log("🚀 Iniciando migración de campos de cajero...");

    // Agregar cashier_id
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS cashier_id INTEGER REFERENCES users(id);
    `);
    console.log("✅ Campo cashier_id agregado");

    // Agregar tip_amount
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS tip_amount DECIMAL(10, 2) DEFAULT 0;
    `);
    console.log("✅ Campo tip_amount agregado");

    // Crear tipo ENUM para payment_method si no existe
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'transfer');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("✅ Tipo ENUM payment_method_enum creado");

    // Agregar payment_method
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS payment_method payment_method_enum;
    `);
    console.log("✅ Campo payment_method agregado");

    console.log("🎉 Migración completada exitosamente!");
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
