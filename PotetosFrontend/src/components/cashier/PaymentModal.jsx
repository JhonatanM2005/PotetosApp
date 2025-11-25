import { useState } from "react";
import { X, DollarSign, CreditCard, TrendingUp, Users, User, Plus, Trash2 } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function PaymentModal({ order, onClose, onSuccess }) {
  const [paymentData, setPaymentData] = useState({
    payment_method: "cash",
    amount_paid: order?.total_amount || "",
    tip: "0",
    customer_name: order?.customer_name || "",
  });

  // Split payment state
  const [splitMode, setSplitMode] = useState(false);
  const [splitType, setSplitType] = useState("manual"); // "manual" o "equal"
  const [splits, setSplits] = useState([]);
  
  // Manual split form
  const [personName, setPersonName] = useState("");
  const [personAmount, setPersonAmount] = useState("");
  const [personPaymentMethod, setPersonPaymentMethod] = useState("cash");
  
  // Auto split form
  const [numPeople, setNumPeople] = useState("");
  
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    const total = parseFloat(order?.total_amount || 0);
    const tip = parseFloat(paymentData.tip || 0);
    return (total + tip).toFixed(2);
  };

  const calculateChange = () => {
    const total = parseFloat(calculateTotal());
    const paid = parseFloat(paymentData.amount_paid || 0);
    const change = paid - total;
    return change >= 0 ? change.toFixed(2) : "0.00";
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Split payment functions
  const totalPaid = splits.reduce((sum, split) => sum + parseFloat(split.amount), 0);
  const remainingAmount = parseFloat(order?.total_amount || 0) - totalPaid;

  const handleAddSplit = () => {
    if (!personName.trim()) {
      toast.error("El nombre de la persona es requerido");
      return;
    }

    const amount = parseFloat(personAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    if (amount > remainingAmount) {
      toast.error(`El monto no puede exceder ${formatCurrency(remainingAmount)}`);
      return;
    }

    setSplits([
      ...splits,
      {
        id: Date.now(),
        person_name: personName,
        amount: amount,
        payment_method: personPaymentMethod,
      },
    ]);

    setPersonName("");
    setPersonAmount("");
    setPersonPaymentMethod("cash");
  };

  const handleAutoDivide = () => {
    if (!numPeople || numPeople <= 0) {
      toast.error("Ingresa una cantidad válida de personas");
      return;
    }

    const num = parseInt(numPeople);
    const amountPerPerson = parseFloat(order.total_amount) / num;

    const newSplits = Array.from({ length: num }, (_, i) => ({
      id: Date.now() + i,
      person_name: `Persona ${i + 1}`,
      amount: Math.round(amountPerPerson * 100) / 100,
      payment_method: paymentData.payment_method,
    }));

    // Ajustar redondeo en la última persona
    const totalWithoutLast = newSplits.slice(0, -1).reduce((sum, s) => sum + s.amount, 0);
    newSplits[newSplits.length - 1].amount = parseFloat(order.total_amount) - totalWithoutLast;

    setSplits(newSplits);
    setNumPeople("");
    setSplitMode(true);
  };

  const handleRemoveSplit = (id) => {
    setSplits(splits.filter((split) => split.id !== id));
  };

  const handleEnableSplitMode = () => {
    setSplitMode(true);
  };

  const handleDisableSplitMode = () => {
    setSplitMode(false);
    setSplits([]);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Preparar datos del pago
      const paymentPayload = {
        payment_method: splitMode ? "split" : paymentData.payment_method,
        amount_paid: parseFloat(paymentData.amount_paid),
        tip: parseFloat(paymentData.tip || 0),
        customer_name: paymentData.customer_name,
      };

      // Si hay splits, validar y agregar
      if (splitMode && splits.length > 0) {
        const splitsTotal = splits.reduce((sum, split) => sum + parseFloat(split.amount), 0);
        const difference = Math.abs(splitsTotal - parseFloat(order.total_amount));
        
        if (difference > 0.01) {
          toast.error(`El total debe ser exacto: ${formatCurrency(order.total_amount)}`);
          setLoading(false);
          return;
        }

        paymentPayload.splits = splits.map(s => ({
          person_name: s.person_name,
          amount: parseFloat(s.amount),
          payment_method: s.payment_method,
        }));
      }

      await api.post(`/cashier/process-payment/${order.id}`, paymentPayload);

      toast.success("¡Pago procesado exitosamente!", { duration: 4000 });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(error.response?.data?.message || "Error al procesar el pago", {
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-linear-to-br from-primary to-primary/90 text-white px-8 py-6 rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Procesar Pago</h3>
              <p className="text-white/80">Orden: {order.order_number}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleProcessPayment} className="p-6 sm:p-8">
          {/* Order Details */}
          <div className="bg-primary/5 border-2 border-primary/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-lg text-primary">Detalle de la Orden</h4>
            </div>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center text-sm font-bold text-primary">
                      {item.quantity}×
                    </span>
                    <span className="text-gray-700 font-medium">{item.dish_name}</span>
                  </div>
                  <span className="font-bold text-primary">
                    ${parseFloat(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t-2 border-primary/20 mt-4 pt-4 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-700">Subtotal:</span>
              <span className="text-2xl font-bold text-primary">
                ${parseFloat(order.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Split Mode Toggle */}
            {!splitMode && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h4 className="font-bold text-lg text-blue-900">Dividir Cuenta</h4>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  ¿Desea dividir la cuenta entre varias personas?
                </p>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 border-b border-blue-300">
                  <button
                    type="button"
                    onClick={() => setSplitType("equal")}
                    className={`px-4 py-2 font-semibold text-sm transition ${
                      splitType === "equal"
                        ? "text-blue-700 border-b-2 border-blue-600"
                        : "text-blue-500 hover:text-blue-700"
                    }`}
                  >
                    <Users className="w-4 h-4 inline mr-1" />
                    Automático
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitType("manual")}
                    className={`px-4 py-2 font-semibold text-sm transition ${
                      splitType === "manual"
                        ? "text-blue-700 border-b-2 border-blue-600"
                        : "text-blue-500 hover:text-blue-700"
                    }`}
                  >
                    <User className="w-4 h-4 inline mr-1" />
                    Manual
                  </button>
                </div>

                {/* Automatic Division */}
                {splitType === "equal" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Número de personas
                        </label>
                        <input
                          type="number"
                          min="2"
                          max="20"
                          value={numPeople}
                          onChange={(e) => setNumPeople(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ej: 3"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoDivide}
                        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg flex items-center gap-2"
                      >
                        <Users className="w-5 h-5" />
                        Dividir
                      </button>
                    </div>
                    {numPeople && (
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">
                          Cada persona pagará:{" "}
                          <span className="font-bold text-blue-700">
                            ${(parseFloat(order.total_amount) / parseInt(numPeople)).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Division */}
                {splitType === "manual" && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-3">
                      Agrega personas una por una con sus montos y métodos de pago
                    </p>
                    <button
                      type="button"
                      onClick={() => setSplitMode(true)}
                      className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Activar División Manual
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Split Mode Active */}
            {splitMode && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg text-primary">Cuenta Dividida</h4>
                  <button
                    type="button"
                    onClick={handleDisableSplitMode}
                    className="text-red-600 hover:text-red-700 text-sm font-semibold"
                  >
                    Cancelar División
                  </button>
                </div>

                {/* Add Split Form */}
                <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre de la persona"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Monto a pagar"
                    value={personAmount}
                    onChange={(e) => setPersonAmount(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <select
                    value={personPaymentMethod}
                    onChange={(e) => setPersonPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSplit}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Agregar Persona
                  </button>
                </div>

                {/* Splits List */}
                {splits.length > 0 && (
                  <div className="space-y-2">
                    {splits.map((split) => (
                      <div
                        key={split.id}
                        className="flex items-center justify-between bg-gray-50 p-4 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-semibold text-gray-900">{split.person_name}</p>
                            <p className="text-xs text-gray-600 capitalize">
                              {split.payment_method === "cash" && "Efectivo"}
                              {split.payment_method === "card" && "Tarjeta"}
                              {split.payment_method === "transfer" && "Transferencia"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-primary">
                            {formatCurrency(split.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSplit(split.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Split Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Pagado:</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(totalPaid)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Falta Pagar:</span>
                        <span
                          className={`font-semibold ${
                            remainingAmount === 0
                              ? "text-green-600"
                              : remainingAmount < 0
                              ? "text-red-600"
                              : "text-orange-600"
                          }`}
                        >
                          {formatCurrency(Math.abs(remainingAmount))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Simple Payment Mode */}
            {!splitMode && (
              <>
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Método de Pago
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "cash", label: "Efectivo", icon: DollarSign },
                      { value: "card", label: "Tarjeta", icon: CreditCard },
                      { value: "transfer", label: "Transferencia", icon: TrendingUp },
                    ].map((method) => {
                      const IconComponent = method.icon;
                      return (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() =>
                            setPaymentData({ ...paymentData, payment_method: method.value })
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

                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Nombre del Cliente (Opcional)
                  </label>
                  <input
                    type="text"
                    value={paymentData.customer_name}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, customer_name: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Ingrese el nombre del cliente"
                  />
                </div>

                {/* Tip */}
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
                      onChange={(e) => setPaymentData({ ...paymentData, tip: e.target.value })}
                      onFocus={(e) =>
                        e.target.value === "0" && setPaymentData({ ...paymentData, tip: "" })
                      }
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Total to Pay */}
                <div className="bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-700">Total a Pagar:</span>
                    <span className="text-3xl font-bold text-blue-600">${calculateTotal()}</span>
                  </div>
                </div>

                {/* Amount Paid */}
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
                        setPaymentData({ ...paymentData, amount_paid: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Change */}
                {paymentData.amount_paid && parseFloat(calculateChange()) > 0 && (
                  <div className="bg-linear-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-700">Cambio:</span>
                      </div>
                      <span className="text-3xl font-bold text-green-600">
                        ${calculateChange()}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all duration-200 hover:shadow-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || (splitMode && remainingAmount !== 0)}
              className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 ${
                loading || (splitMode && remainingAmount !== 0)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-linear-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              }`}
            >
              <DollarSign className="w-5 h-5" />
              {loading ? "Procesando..." : "Procesar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
