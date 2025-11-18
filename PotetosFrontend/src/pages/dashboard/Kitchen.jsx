import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  ChefHat,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { kitchenService } from "../../services";
import socketService from "../../services/socket";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchKitchenOrders();

    // Conectar Socket.io para actualizaciones en tiempo real
    if (token) {
      socketService.connect(token);

      // Escuchar nuevas órdenes
      socketService.on("kitchen:newOrder", handleNewOrder);

      // Escuchar cambios de estado
      socketService.on("order:statusChanged", handleOrderStatusChanged);
    }

    return () => {
      socketService.off("kitchen:newOrder", handleNewOrder);
      socketService.off("order:statusChanged", handleOrderStatusChanged);
    };
  }, [token]);

  const handleNewOrder = (data) => {
    toast.success(`¡Nueva orden #${data.orderNumber} recibida!`, {
      duration: 4000,
      icon: "🔔",
    });
    fetchKitchenOrders();
  };

  const handleOrderStatusChanged = () => {
    // Actualizar cuando cambia el estado de una orden
    fetchKitchenOrders();
  };

  const fetchKitchenOrders = async () => {
    try {
      const data = await kitchenService.getOrders();
      setOrders(data.orders || []);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener órdenes:", error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await kitchenService.updateItemStatus(itemId, newStatus);
      toast.success("Estado actualizado correctamente");
      fetchKitchenOrders();
    } catch (error) {
      toast.error("Error al actualizar estado");
      console.error(error);
    }
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pendiente",
        icon: AlertCircle,
      },
      preparing: {
        color: "bg-orange-100 text-orange-800",
        label: "Preparando",
        icon: Clock,
      },
      ready: {
        color: "bg-green-100 text-green-800",
        label: "Listo",
        icon: CheckCircle,
      },
    };
    return statuses[status] || statuses.pending;
  };

  // Filtrar solo órdenes con items pendientes o en preparación
  const activeOrders = orders.filter((order) =>
    order.items?.some(
      (item) => item.status === "pending" || item.status === "preparing"
    )
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
              <ChefHat size={28} className="md:w-8 md:h-8" />
              <span className="hidden sm:inline">ESTACIÓN DE COCINA</span>
              <span className="sm:hidden">COCINA</span>
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Gestiona las órdenes en preparación
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full lg:w-auto">
            <button
              onClick={fetchKitchenOrders}
              className="bg-primary text-secondary px-4 md:px-6 py-2 md:py-3 rounded-full font-bold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} className="md:w-5 md:h-5" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Órdenes Activas</p>
                <p className="text-3xl font-bold text-primary">
                  {activeOrders.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ChefHat size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En Preparación</p>
                <p className="text-3xl font-bold text-orange-600">
                  {orders.reduce(
                    (sum, order) =>
                      sum +
                      (order.items?.filter(
                        (item) => item.status === "preparing"
                      ).length || 0),
                    0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {orders.reduce(
                    (sum, order) =>
                      sum +
                      (order.items?.filter((item) => item.status === "pending")
                        .length || 0),
                    0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">Cargando órdenes...</p>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-800 mb-2">¡Todo listo!</p>
            <p className="text-gray-500">No hay órdenes pendientes en cocina</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden border-l-4 border-orange-500"
              >
                {/* Order Header */}
                <div className="bg-primary text-white p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-secondary">
                        Orden #{order.order_number}
                      </p>
                      <p className="text-xl font-bold">
                        Mesa {order.table?.table_number || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-secondary">Tiempo</p>
                      <p className="text-sm font-semibold">
                        {new Date(order.created_at).toLocaleTimeString(
                          "es-ES",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 space-y-3">
                  {/* Notas generales de la orden */}
                  {order.notes && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded">
                      <p className="text-xs font-semibold text-blue-800 mb-1">
                        📋 NOTAS DE LA ORDEN:
                      </p>
                      <p className="text-sm text-blue-900 font-medium">
                        {order.notes}
                      </p>
                    </div>
                  )}

                  {order.items
                    ?.filter(
                      (item) =>
                        item.status === "pending" || item.status === "preparing"
                    )
                    .map((item) => {
                      const statusInfo = getStatusInfo(item.status);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <div
                          key={item.id}
                          className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="font-bold text-gray-800 mb-1">
                                {item.dish_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Cantidad:{" "}
                                <span className="font-bold text-primary">
                                  {item.quantity}x
                                </span>
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}
                            >
                              <StatusIcon size={14} />
                              {statusInfo.label}
                            </span>
                          </div>

                          {/* Notas específicas del item (si las hay) */}
                          {item.notes && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-3 rounded">
                              <p className="text-xs text-yellow-800 font-semibold">
                                📝 Nota del plato: {item.notes}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {item.status === "pending" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(item.id, "preparing")
                                }
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                              >
                                <Clock size={16} />
                                Comenzar
                              </button>
                            )}

                            {item.status === "preparing" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(item.id, "ready")
                                }
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                              >
                                <CheckCircle size={16} />
                                Marcar Listo
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
