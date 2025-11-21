import { useState, useEffect } from "react";
import {
  DollarSign,
  CreditCard,
  Receipt,
  TrendingUp,
  Users,
  User,
} from "lucide-react";
import api from "../../services/api";
import StatCard from "../../components/common/StatCard";
import DashboardLayout from "../../components/layout/DashboardLayout";
import socketService from "../../services/socket";
import toast from "react-hot-toast";

const Cashier = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [dailyStats, setDailyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_method: "cash",
    amount_paid: "",
    tip: "0",
  });
  const [splitMode, setSplitMode] = useState(false);
  const [splitData, setSplitData] = useState({
    numberOfPeople: 2,
    amountPerPerson: 0,
    currentPerson: 1,
    payments: [],
  });

  useEffect(() => {
    fetchData();

    // Escuchar eventos de Socket.io para actualizaciones en tiempo real
    const handleOrderUpdate = (data) => {
      console.log("Order updated:", data);
      fetchData(); // Recargar datos cuando hay cambios
    };

    const handlePaymentProcessed = (data) => {
      console.log("Payment processed:", data);

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
    setPaymentData({
      payment_method: "cash",
      amount_paid: order.total_amount,
      tip: "0",
    });
    setSplitMode(false);
    setSplitData({
      numberOfPeople: 2,
      amountPerPerson: 0,
      currentPerson: 1,
      payments: [],
    });
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        `/cashier/process-payment/${selectedOrder.id}`,
        paymentData
      );

      toast.success("¡Pago procesado exitosamente!", {
        duration: 4000,
      });
      setShowPaymentModal(false);
      setSelectedOrder(null);
      fetchData();
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(
        error.response?.data?.message || "Error al procesar el pago",
        {
          duration: 4000,
        }
      );
    }
  };

  const calculateTotal = () => {
    const total = parseFloat(selectedOrder?.total_amount || 0);
    const tip = parseFloat(paymentData.tip || 0);
    return (total + tip).toFixed(2);
  };

  const calculateChange = () => {
    const total = parseFloat(calculateTotal());
    const paid = parseFloat(paymentData.amount_paid || 0);
    const change = paid - total;
    return change >= 0 ? change.toFixed(2) : "0.00";
  };

  const handleEnableSplitMode = async () => {
    try {
      const response = await api.post(
        `/cashier/split-bill/${selectedOrder.id}`,
        {
          numberOfPeople: splitData.numberOfPeople,
        }
      );

      setSplitData({
        ...splitData,
        amountPerPerson: response.data.amountPerPerson,
        currentPerson: 1,
        payments: [],
      });

      setPaymentData({
        payment_method: "cash",
        amount_paid: response.data.amountPerPerson.toFixed(2),
        tip: "0",
      });

      setSplitMode(true);
      toast.success(
        `Cuenta dividida entre ${splitData.numberOfPeople} personas`
      );
    } catch (error) {
      console.error("Error splitting bill:", error);
      toast.error(
        error.response?.data?.message || "Error al dividir la cuenta"
      );
    }
  };

  const handleProcessSplitPayment = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/cashier/process-partial-payment/${selectedOrder.id}`, {
        payment_method: paymentData.payment_method,
        amount_paid: parseFloat(paymentData.amount_paid),
        tip: parseFloat(paymentData.tip || 0),
        personNumber: splitData.currentPerson,
        totalPeople: splitData.numberOfPeople,
      });

      const newPayments = [
        ...splitData.payments,
        {
          person: splitData.currentPerson,
          amount: parseFloat(paymentData.amount_paid),
          tip: parseFloat(paymentData.tip || 0),
          method: paymentData.payment_method,
        },
      ];

      if (splitData.currentPerson >= splitData.numberOfPeople) {
        toast.success("¡Todos los pagos procesados exitosamente!");
        setShowPaymentModal(false);
        setSelectedOrder(null);
        setSplitMode(false);
        fetchData();
      } else {
        toast.success(
          `Pago ${splitData.currentPerson}/${splitData.numberOfPeople} procesado`
        );
        setSplitData({
          ...splitData,
          currentPerson: splitData.currentPerson + 1,
          payments: newPayments,
        });
        setPaymentData({
          payment_method: "cash",
          amount_paid: splitData.amountPerPerson.toFixed(2),
          tip: "0",
        });
      }
    } catch (error) {
      console.error("Error processing split payment:", error);
      toast.error(
        error.response?.data?.message || "Error al procesar el pago parcial"
      );
    }
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
                AVG
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">
              ${dailyStats?.averageOrder?.toFixed(2) || "0.00"}
            </h3>
            <p className="text-orange-100 text-sm">Ticket Promedio</p>
          </div>
        </div>

        {/* Órdenes pendientes de pago */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">
                Órdenes Pendientes de Pago
              </h2>
              <p className="text-sm text-gray-500">
                {pendingPayments.length}{" "}
                {pendingPayments.length === 1 ? "orden" : "órdenes"} en espera
              </p>
            </div>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">
                No hay órdenes pendientes de pago
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Las órdenes listas aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-primary/5">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">
                      Nro. Orden
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">
                      Mesa
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">
                      Mesero
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {pendingPayments.map((order, index) => (
                    <tr
                      key={order.id}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-primary">
                          {order.order_number}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {order.table?.table_number || "-"}
                            </span>
                          </div>
                          <span className="text-sm text-gray-700">
                            Mesa {order.table?.table_number || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {order.waiter?.name || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-secondary/20 text-secondary border border-secondary/30"
                          }`}
                        >
                          {order.status === "delivered" ? "Entregado" : "Listo"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-primary">
                          ${parseFloat(order.total_amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleOpenPayment(order)}
                          className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2"
                        >
                          <DollarSign className="w-4 h-4" />
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

        {/* Modal de pago */}
        {showPaymentModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del modal */}
              <div className="bg-linear-to-br from-primary to-primary/90 text-white px-8 py-6 rounded-t-3xl">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Procesar Pago
                </h3>
                <p className="text-white/80">
                  Orden: {selectedOrder.order_number}
                </p>
              </div>

              <div className="p-6 sm:p-8">
                {/* Detalles de la orden */}
                <div className="bg-primary/5 border-2 border-primary/10 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-lg text-primary">
                      Detalle de la Orden
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center text-sm font-bold text-primary">
                            {item.quantity}×
                          </span>
                          <span className="text-gray-700 font-medium">
                            {item.dish_name}
                          </span>
                        </div>
                        <span className="font-bold text-primary">
                          ${parseFloat(item.subtotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t-2 border-primary/20 mt-4 pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-700">
                      Subtotal:
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      ${parseFloat(selectedOrder.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Formulario de pago */}
                <form
                  onSubmit={
                    splitMode ? handleProcessSplitPayment : handleProcessPayment
                  }
                >
                  <div className="space-y-6">
                    {/* Modo de división de cuenta */}
                    {!splitMode && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Users className="w-6 h-6 text-blue-600" />
                          <h4 className="font-bold text-lg text-blue-900">
                            Dividir Cuenta
                          </h4>
                        </div>
                        <p className="text-sm text-blue-700 mb-4">
                          ¿Desea dividir la cuenta entre varias personas?
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Número de personas
                            </label>
                            <input
                              type="number"
                              min="2"
                              max="20"
                              value={splitData.numberOfPeople}
                              onChange={(e) =>
                                setSplitData({
                                  ...splitData,
                                  numberOfPeople: e.target.value
                                    ? parseInt(e.target.value)
                                    : "",
                                })
                              }
                              onBlur={(e) =>
                                !e.target.value &&
                                setSplitData({
                                  ...splitData,
                                  numberOfPeople: 2,
                                })
                              }
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleEnableSplitMode}
                            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg flex items-center gap-2"
                          >
                            <Users className="w-5 h-5" />
                            Activar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Indicador de pago actual en modo división */}
                    {splitMode && (
                      <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <User className="w-6 h-6" />
                            <h4 className="font-bold text-lg">
                              Procesando Pago {splitData.currentPerson}/
                              {splitData.numberOfPeople}
                            </h4>
                          </div>
                          <span className="bg-white/20 px-4 py-2 rounded-xl font-bold">
                            ${splitData.amountPerPerson.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-blue-100 text-sm">
                          Monto por persona (sin propina)
                        </p>

                        {splitData.payments.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-sm text-blue-100 mb-2 font-semibold">
                              Pagos procesados:
                            </p>
                            <div className="space-y-2">
                              {splitData.payments.map((payment, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center text-sm bg-white/10 rounded-lg px-3 py-2"
                                >
                                  <span>Persona {payment.person}</span>
                                  <span className="font-semibold">
                                    ${(payment.amount + payment.tip).toFixed(2)}{" "}
                                    ({payment.method})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Método de pago */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Método de Pago
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          {
                            value: "cash",
                            label: "Efectivo",
                            icon: DollarSign,
                          },
                          { value: "card", label: "Tarjeta", icon: CreditCard },
                          {
                            value: "transfer",
                            label: "Transferencia",
                            icon: TrendingUp,
                          },
                        ].map((method) => {
                          const IconComponent = method.icon;
                          return (
                            <button
                              key={method.value}
                              type="button"
                              onClick={() =>
                                setPaymentData({
                                  ...paymentData,
                                  payment_method: method.value,
                                })
                              }
                              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                                paymentData.payment_method === method.value
                                  ? "border-primary bg-primary text-white shadow-lg scale-105"
                                  : "border-gray-200 hover:border-primary/50 bg-white hover:shadow-md"
                              }`}
                            >
                              <IconComponent
                                className={`w-6 h-6 ${
                                  paymentData.payment_method === method.value
                                    ? "text-white"
                                    : "text-primary"
                                }`}
                              />
                              <div
                                className={`text-sm font-semibold ${
                                  paymentData.payment_method === method.value
                                    ? "text-white"
                                    : "text-gray-700"
                                }`}
                              >
                                {method.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Propina */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Propina (Opcional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={paymentData.tip}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              tip: e.target.value,
                            })
                          }
                          onFocus={(e) =>
                            e.target.value === "0" &&
                            setPaymentData({ ...paymentData, tip: "" })
                          }
                          className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Total a pagar */}
                    <div className="bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-700">
                          Total a Pagar:
                        </span>
                        <span className="text-3xl font-bold text-blue-600">
                          ${calculateTotal()}
                        </span>
                      </div>
                    </div>

                    {/* Monto recibido */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Monto Recibido
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={paymentData.amount_paid}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              amount_paid: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Cambio */}
                    {paymentData.amount_paid &&
                      parseFloat(calculateChange()) > 0 && (
                        <div className="bg-linear-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 animate-fade-in">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-lg font-bold text-gray-700">
                                Cambio:
                              </span>
                            </div>
                            <span className="text-3xl font-bold text-green-600">
                              ${calculateChange()}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentModal(false);
                        setSelectedOrder(null);
                      }}
                      className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all duration-200 hover:shadow-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-4 bg-linear-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-5 h-5" />
                      Procesar Pago
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Cashier;
