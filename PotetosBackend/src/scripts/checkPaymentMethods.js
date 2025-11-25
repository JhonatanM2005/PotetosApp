/**
 * Script de diagnóstico para verificar el estado de payment_method en las órdenes
 * 
 * Ejecutar con: node src/scripts/checkPaymentMethods.js
 */

const { Order } = require('../models');

async function checkPaymentMethods() {
  try {
    console.log('🔍 Verificando payment_method en órdenes pagadas...\n');

    // Obtener todas las órdenes pagadas
    const paidOrders = await Order.findAll({
      where: { status: 'paid' },
      order: [['completed_at', 'DESC']],
      limit: 20, // Últimas 20 órdenes pagadas
    });

    console.log(`📊 Total de órdenes pagadas encontradas: ${paidOrders.length}\n`);

    let ordersWithoutPaymentMethod = 0;
    let ordersByPaymentMethod = {
      cash: 0,
      card: 0,
      transfer: 0,
      split: 0,
      null: 0,
    };

    paidOrders.forEach((order) => {
      const pm = order.payment_method;
      
      if (!pm) {
        ordersWithoutPaymentMethod++;
        ordersByPaymentMethod.null++;
        console.log(`❌ Orden ${order.order_number} - SIN payment_method (completada: ${order.completed_at})`);
      } else {
        ordersByPaymentMethod[pm]++;
        console.log(`✅ Orden ${order.order_number} - payment_method: ${pm} (completada: ${order.completed_at})`);
      }
    });

    console.log('\n📈 Resumen:');
    console.log(`   Efectivo: ${ordersByPaymentMethod.cash}`);
    console.log(`   Tarjeta: ${ordersByPaymentMethod.card}`);
    console.log(`   Transferencia: ${ordersByPaymentMethod.transfer}`);
    console.log(`   Dividido: ${ordersByPaymentMethod.split}`);
    console.log(`   Sin método: ${ordersByPaymentMethod.null}`);
    
    if (ordersWithoutPaymentMethod > 0) {
      console.log(`\n⚠️  PROBLEMA DETECTADO: ${ordersWithoutPaymentMethod} órdenes pagadas sin payment_method`);
    } else {
      console.log('\n✅ Todas las órdenes pagadas tienen payment_method');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al verificar payment_methods:', error);
    process.exit(1);
  }
}

checkPaymentMethods();
