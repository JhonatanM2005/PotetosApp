import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { cashierService } from "../../services";
import { useAuthStore } from "../../store/authStore";
import { CreditCard, DollarSign, Users, Clock, MapPin, ChefHat, History } from "lucide-react";
import PaymentModal from "./PaymentModal";

export default function CashierPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDeliveredOrders();
    fetchStats();
  }, []);

  const fetchDeliveredOrders = async () => {
    try {
      setLoading(true);
      const data = await cashierService.getDeliveredOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await cashierService.getStats();
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handlePayment = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedOrder(null);
    fetchDeliveredOrders();
    fetchStats();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "COP",
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              MÓDULO DE CAJERO
            </h2>
            <p className="text-gray-600">
              Bienvenido, {user?.name}. Procesa pagos de órdenes entregadas.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/payment-history")}
            className="bg-secondary hover:bg-secondary/90 text-white px-4 py-3 rounded-lg transition font-semibold flex items-center gap-2"
          >
            <History className="w-5 h-5" />
            Ver Historial
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Ventas Hoy</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(stats.totalSales || 0)}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-primary" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Transacciones</p>
                  <p className="text-2xl font-bold text-secondary">
                    {stats.totalTransactions || 0}
                  </p>
                </div>
                <CreditCard className="w-10 h-10 text-secondary" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Promedio por Transacción</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalTransactions > 0
                      ? formatCurrency((stats.totalSales || 0) / stats.totalTransactions)
                      : "$0"}
                  </p>
                </div>
                <Users className="w-10 h-10 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900">
              Órdenes Disponibles para Pagar
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {loading ? "Cargando..." : `${orders.length} órdenes pendientes`}
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin mx-auto mb-4 w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-gray-600">Cargando órdenes...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No hay órdenes disponibles para pagar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Orden
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Mesa
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Mesero
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-gray-900">
                            {order.order_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">
                            {order.table?.table_number || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ChefHat className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">
                            {order.waiter?.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Clock className="w-4 h-4" />
                          {formatDate(order.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handlePayment(order)}
                          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition font-semibold"
                        >
                          Pagar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
    </DashboardLayout>
  );
}
