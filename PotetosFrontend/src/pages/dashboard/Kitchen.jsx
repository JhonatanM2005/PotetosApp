import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { ArrowLeft, Clock, CheckCircle } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function KitchenPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKitchenOrders();
    // Actualizar cada 5 segundos
    const interval = setInterval(fetchKitchenOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchKitchenOrders = async () => {
    try {
      const response = await api.get("/kitchen/orders");
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error al obtener órdenes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await api.patch(`/kitchen/items/${itemId}/status`, { status: newStatus });
      toast.success("Estado actualizado");
      fetchKitchenOrders();
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-red-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            👨‍🍳 Estación de Cocina
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white text-red-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-300">Cargando órdenes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-xl text-gray-300">
              ✅ No hay órdenes pendientes
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border-l-4 border-orange-500"
              >
                <div className="p-4 bg-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-400">
                        Orden #{order.order_number}
                      </p>
                      <p className="text-lg font-bold">
                        Mesa {order.table_id || "N/A"}
                      </p>
                    </div>
                    <span className="bg-orange-600 text-white px-3 py-1 rounded text-sm font-semibold">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-700 p-3 rounded border border-gray-600"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-white">
                            {item.dish_name}
                          </p>
                          <p className="text-sm text-gray-400">
                            Cantidad: <strong>{item.quantity}</strong>
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.status === "ready"
                              ? "bg-green-600"
                              : "bg-yellow-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-gray-300 italic mb-2">
                          📝 {item.notes}
                        </p>
                      )}

                      {item.status === "pending" && (
                        <button
                          onClick={() =>
                            handleStatusChange(item.id, "preparing")
                          }
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-2 rounded text-sm transition"
                        >
                          <Clock size={16} className="inline mr-1" />
                          En preparación
                        </button>
                      )}

                      {item.status === "preparing" && (
                        <button
                          onClick={() => handleStatusChange(item.id, "ready")}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-sm transition"
                        >
                          <CheckCircle size={16} className="inline mr-1" />
                          Listo para servir
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
