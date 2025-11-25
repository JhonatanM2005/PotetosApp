import { useState, useEffect } from "react";
import {
  DollarSign,
  CreditCard,
  Receipt,
  TrendingUp,
} from "lucide-react";
import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import socketService from "../../services/socket";
import PaymentModal from "../../components/cashier/PaymentModal";
import toast from "react-hot-toast";

const Cashier = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [dailyStats, setDailyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchData();

    // Escuchar eventos de Socket.io para actualizaciones en tiempo real
    const handleOrderUpdate = (data) => {
      fetchData(); // Recargar datos cuando hay cambios
    };

    const handlePaymentProcessed = (data) => {
      // Mostrar notificación toast cuando se procesa un pago
      if (data.orderNumber) {
        toast.success(`Pago procesado: ${data.orderNumber}`, {
          duration: 3000,
        });
      }

      fetchData(); // Recargar datos cuando se procesa un pago
    };

    socketService.on("order:updated", handleOrderUpdate);
    socketService.on("order:statusChanged", handleOrderUpdate);
    socketService.on("payment:processed", handlePaymentProcessed);

    // Cleanup: remover listeners cuando el componente se desmonte
    return () => {
      socketService.off("order:updated", handleOrderUpdate);
      socketService.off("order:statusChanged", handleOrderUpdate);
      socketService.off("payment:processed", handlePaymentProcessed);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        api.get("/cashier/pending-payments"),
        api.get("/cashier/stats"),
      ]);

      setPendingPayments(paymentsRes.data.orders);
      setDailyStats(statsRes.data.stats);
    } catch (error) {
      console.error("Error fetching cashier data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    fetchData();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Cargando...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Módulo de Caja
          </h1>
          <p className="text-gray-600">
            Gestiona los pagos y cobros del restaurante
          </p>
        </div>

        {/* Estadísticas del día */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-10 h-10" />
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                HOY
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">
              ${dailyStats?.totalSales?.toFixed(2) || "0.00"}
            </h3>
            <p className="text-green-100 text-sm">Ventas del Día</p>
          </div>

          <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10" />
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                TIPS
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">
              ${dailyStats?.totalTips?.toFixed(2) || "0.00"}
            </h3>
            <p className="text-blue-100 text-sm">Propinas</p>
          </div>

          <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Receipt className="w-10 h-10" />
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                TOTAL
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">
              {dailyStats?.totalOrders || 0}
            </h3>
            <p className="text-purple-100 text-sm">Órdenes Pagadas</p>
          </div>

          <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="w-10 h-10" />
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                PROMEDIO
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">
              ${dailyStats?.averageTicket?.toFixed(2) || "0.00"}
            </h3>
            <p className="text-orange-100 text-sm">Ticket Promedio</p>
          </div>
        </div>

        {/* Pagos Pendientes */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Pagos Pendientes
          </h2>

          {pendingPayments.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No hay pagos pendientes en este momento
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Orden
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Mesa
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Mesero
                    </th>
                    <th className="text-right py-3 px-4 font-bold text-gray-700">
                      Total
                    </th>
                    <th className="text-center py-3 px-4 font-bold text-gray-700">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="py-4 px-4">
                        <span className="font-semibold text-primary">
                          {order.order_number}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700">
                          Mesa {order.table?.table_number || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700">
                          {order.waiter?.name || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-bold text-lg text-primary">
                          ${parseFloat(order.total_amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleOpenPayment(order)}
                          className="bg-linear-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-xl font-bold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2 mx-auto"
                        >
                          <DollarSign className="w-5 h-5" />
                          Cobrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedOrder && (
          <PaymentModal
            order={selectedOrder}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedOrder(null);
            }}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Cashier;
