const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addMetadataField() {
  const client = await pool.connect();
  
  try {
    console.log('Agregando campo metadata a la tabla orders...');
    
    // Verificar si el campo ya existe
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name = 'metadata';
    `;
    
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('El campo metadata ya existe.');
      return;
    }
    
    // Agregar campo metadata
    const alterQuery = `
      ALTER TABLE orders 
      ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    `;
    
    await client.query(alterQuery);
    console.log('✓ Campo metadata agregado exitosamente');
    
    // Actualizar el ENUM de payment_method para incluir 'split'
    console.log('Actualizando ENUM de payment_method...');
    
    const updateEnumQuery = `
      ALTER TYPE "enum_orders_payment_method" 
      ADD VALUE IF NOT EXISTS 'split';
    `;
    
    try {
      await client.query(updateEnumQuery);
      console.log('✓ ENUM actualizado con valor "split"');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('El valor "split" ya existe en el ENUM');
      } else {
        throw error;
      }
    }
    
    console.log('\n¡Migración completada exitosamente!');
    
  } catch (error) {
    console.error('Error en la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addMetadataField()
  .then(() => {
    console.log('Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
