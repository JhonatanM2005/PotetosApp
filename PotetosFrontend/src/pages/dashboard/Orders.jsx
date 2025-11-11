import { useEffect, useState } from "react";
import { Plus, Search, Eye, Trash2, Edit2 } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { orderService, dishService, tableService } from "../../services";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [formData, setFormData] = useState({
    table_id: "",
    notes: "",
    items: [],
  });
  const [selectedDish, setSelectedDish] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log("Iniciando carga de datos...");
      const [ordersData, dishesData, tablesData] = await Promise.all([
        orderService.getAll(),
        dishService.getAvailable(),
        tableService.getAvailable(),
      ]);
      console.log("Datos recibidos:", { ordersData, dishesData, tablesData });
      setOrders(ordersData.orders || []);
      setDishes(dishesData.dishes || []);
      setTables(tablesData.tables || []);
      console.log("Estados actualizados correctamente");
    } catch (error) {
      toast.error("Error al cargar datos");
      console.error("Error en fetchData:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta orden?")) return;
    try {
      console.log("Eliminando orden con ID:", id);
      const result = await orderService.delete(id);
      console.log("Resultado de eliminación:", result);
      toast.success("Orden eliminada correctamente");
      fetchData();
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Error al eliminar la orden");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      console.log("Actualizando estado de orden:", id, "a:", newStatus);
      const result = await orderService.updateStatus(id, newStatus);
      console.log("Resultado de actualización:", result);
      toast.success("Estado actualizado correctamente");
      fetchData();
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Error al actualizar el estado");
    }
  };

  const openViewModal = (order) => {
    setViewingOrder(order);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingOrder(null);
  };

  const openCreateModal = () => {
    console.log("Abriendo modal de nueva orden");
    console.log("Platos disponibles:", dishes);
    console.log("Mesas disponibles:", tables);
    setFormData({
      table_id: "",
      notes: "",
      items: [],
    });
    setSelectedDish("");
    setQuantity(1);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setFormData({
      table_id: "",
      notes: "",
      items: [],
    });
    setSelectedDish("");
    setQuantity(1);
  };

  const addItemToOrder = () => {
    if (!selectedDish) {
      toast.error("Selecciona un plato");
      return;
    }
    if (quantity < 1) {
      toast.error("La cantidad debe ser al menos 1");
      return;
    }

    const dish = dishes.find((d) => d.id === parseInt(selectedDish));
    if (!dish) return;

    const existingItemIndex = formData.items.findIndex(
      (item) => item.dish_id === dish.id
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += quantity;
      setFormData({ ...formData, items: updatedItems });
    } else {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            dish_id: dish.id,
            name: dish.name,
            price: parseFloat(dish.price || 0),
            quantity: quantity,
          },
        ],
      });
    }

    setSelectedDish("");
    setQuantity(1);
  };

  const removeItemFromOrder = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!formData.table_id) {
      toast.error("Selecciona una mesa");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Agrega al menos un plato a la orden");
      return;
    }

    try {
      const orderData = {
        table_id: parseInt(formData.table_id),
        notes: formData.notes,
        items: formData.items.map((item) => ({
          dish_id: item.dish_id,
          quantity: item.quantity,
        })),
      };

      await orderService.create(orderData);
      toast.success("Orden creada correctamente");
      fetchData();
      closeCreateModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al crear la orden");
      console.error(error);
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesSearch =
      order.order_number?.toString().includes(searchTerm) ||
      order.table?.table_number?.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    preparing: "bg-orange-100 text-orange-800",
    ready: "bg-green-100 text-green-800",
    delivered: "bg-blue-100 text-blue-800",
    paid: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    pending: "Pendiente",
    preparing: "Preparando",
    ready: "Lista",
    delivered: "Entregada",
    paid: "Pagada",
    cancelled: "Cancelada",
  };

  const statuses = Object.keys(statusLabels);

  // Debug log
  console.log("Estado del componente:", {
    showCreateModal,
    dishesCount: dishes.length,
    tablesCount: tables.length,
    ordersCount: orders.length,
  });

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">ÓRDENES</h1>
          <button
            onClick={openCreateModal}
            className="bg-primary text-secondary px-6 py-3 rounded-full font-bold hover:opacity-90 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Nueva Orden
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número de orden o mesa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter(null)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                statusFilter === null
                  ? "bg-secondary text-primary"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Todas
            </button>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full font-semibold transition ${
                  statusFilter === status
                    ? "bg-secondary text-primary"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-6 py-4 text-left"># Orden</th>
                <th className="px-6 py-4 text-left">Mesa</th>
                <th className="px-6 py-4 text-left">Items</th>
                <th className="px-6 py-4 text-left">Total</th>
                <th className="px-6 py-4 text-left">Estado</th>
                <th className="px-6 py-4 text-left">Fecha</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No hay órdenes disponibles
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-primary">
                      #{order.order_number}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      Mesa {order.table?.table_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.items?.length || 0} item(s)
                    </td>
                    <td className="px-6 py-4 font-bold text-secondary">
                      ${parseFloat(order.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold outline-none cursor-pointer ${
                          statusColors[order.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openViewModal(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create Order Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto relative">
              <h2 className="text-2xl font-bold text-primary mb-6">
                Nueva Orden
              </h2>

              <form onSubmit={handleCreateOrder} className="space-y-6">
                {/* Table Selection and Notes */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mesa *
                    </label>
                    <select
                      value={formData.table_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          table_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                      required
                    >
                      <option value="">Seleccionar mesa</option>
                      {tables.map((table) => (
                        <option key={table.id} value={table.id}>
                          Mesa #{table.table_number} - {table.capacity} personas
                          {table.location ? ` (${table.location})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notas (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                      placeholder="Ej: Sin cebolla, extra picante..."
                    />
                  </div>
                </div>

                {/* Add Items Section */}
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <h3 className="font-bold text-lg mb-4">Agregar Platos</h3>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-7">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Plato
                      </label>
                      <select
                        value={selectedDish}
                        onChange={(e) => setSelectedDish(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                      >
                        <option value="">Seleccionar plato</option>
                        {dishes.map((dish) => (
                          <option key={dish.id} value={dish.id}>
                            {dish.name} - ${parseFloat(dish.price || 0).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(parseInt(e.target.value) || 1)
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none"
                      />
                    </div>
                    <div className="col-span-2 flex items-end">
                      <button
                        type="button"
                        onClick={addItemToOrder}
                        className="w-full bg-secondary text-primary px-4 py-2 rounded-lg font-bold hover:opacity-90 transition"
                      >
                        <Plus size={20} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <h3 className="font-bold text-lg mb-4">
                    Items de la orden ({formData.items.length})
                  </h3>
                  {formData.items.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No hay items agregados
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {formData.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              ${parseFloat(item.price || 0).toFixed(2)} x {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-bold text-secondary">
                              ${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeItemFromOrder(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="bg-primary text-white p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">TOTAL:</span>
                    <span className="text-3xl font-bold text-secondary">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary text-secondary rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Crear Orden
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Order Modal */}
        {showViewModal && viewingOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto relative">
              <h2 className="text-2xl font-bold text-primary mb-6">
                Detalles de Orden #{viewingOrder.order_number}
              </h2>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mesa</p>
                    <p className="font-bold text-lg">
                      Mesa {viewingOrder.table?.table_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Estado</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[viewingOrder.status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusLabels[viewingOrder.status]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Fecha</p>
                    <p className="font-semibold">
                      {new Date(viewingOrder.created_at).toLocaleString(
                        "es-ES"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total</p>
                    <p className="font-bold text-2xl text-secondary">
                      ${parseFloat(viewingOrder.total_amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-bold text-lg mb-4">Items de la orden</h3>
                  <div className="space-y-3">
                    {viewingOrder.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-secondary">
                          ${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {viewingOrder.notes && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1 font-semibold">
                      Notas:
                    </p>
                    <p className="text-gray-800">{viewingOrder.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t">
                <button
                  onClick={closeViewModal}
                  className="flex-1 px-4 py-2 bg-primary text-secondary rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
