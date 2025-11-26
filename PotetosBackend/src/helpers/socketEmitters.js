/**
 * Socket.io Emitters Helper
 * Funciones helper para emitir eventos a través de socket.io
 */

/**
 * Emitir evento de pago procesado a la sala de cajero
 * @param {Object} paymentData - Datos del pago
 */
exports.emitPaymentProcessed = (paymentData) => {
  console.log("[emitPaymentProcessed] Emitiendo pago procesado:", paymentData);
  if (global.io) {
    console.log("global.io existe, emitiendo a sala 'cashier'");
    const event = {
      orderId: paymentData.orderId,
      orderNumber: paymentData.orderNumber,
      amount: paymentData.amount,
      cashier: paymentData.cashier,
      tableId: paymentData.tableId,
      status: "paid",
      timestamp: new Date(),
    };
    console.log("Evento a emitir:", event);
    global.io.to("cashier").emit("cashier:paymentProcessed", event);
    console.log(`Payment processed notification sent to cashier room`);
  } else {
    console.error("global.io no existe!");
  }
};

/**
 * Emitir evento de nueva orden entregada
 * @param {Object} orderData - Datos de la orden
 */
exports.emitOrderDelivered = (orderData) => {
  if (global.io) {
    global.io.to("cashier").emit("cashier:newOrderDelivered", {
      orderId: orderData.id,
      orderNumber: orderData.order_number,
      totalAmount: orderData.total_amount,
      tableId: orderData.table_id,
      timestamp: new Date(),
    });
    console.log(`New delivered order notification sent to cashier room`);
  }
};

/**
 * Emitir evento de actualización de órdenes disponibles
 */
exports.emitOrdersUpdated = () => {
  if (global.io) {
    global.io.to("cashier").emit("cashier:ordersUpdated", {
      timestamp: new Date(),
    });
    console.log(`Orders updated notification sent to cashier room`);
  }
};

/**
 * Emitir actualización de estadísticas en tiempo real
 * @param {Object} stats - Estadísticas actualizadas
 */
exports.emitStatsUpdated = (stats) => {
  if (global.io) {
    global.io.to("cashier").emit("cashier:statsUpdated", {
      stats,
      timestamp: new Date(),
    });
    console.log(`Stats updated notification sent to cashier room`);
  }
};
