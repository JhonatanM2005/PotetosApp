import { useState } from "react";
import { cashierService } from "../../services";
import { X, Plus, Trash2, DollarSign, User, Users } from "lucide-react";

export default function PaymentModal({ order, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [splits, setSplits] = useState([]);
  const [showSplitForm, setShowSplitForm] = useState(false);
  const [splitType, setSplitType] = useState("manual"); // "manual" o "equal"
  const [personName, setPersonName] = useState("");
  const [personAmount, setPersonAmount] = useState("");
  const [personPaymentMethod, setPersonPaymentMethod] = useState("cash");
  const [numPeople, setNumPeople] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "COP",
    }).format(amount);
  };

  const totalPaid = splits.reduce((sum, split) => sum + parseFloat(split.amount), 0);
  const remainingAmount = parseFloat(order.total_amount) - totalPaid;

  const handleAddSplit = () => {
    if (!personName.trim()) {
      setError("El nombre de la persona es requerido");
      return;
    }

    const amount = parseFloat(personAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }

    if (amount > remainingAmount) {
      setError(`El monto no puede exceder ${formatCurrency(remainingAmount)}`);
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
    setError("");
    setShowSplitForm(false);
  };

  const handleAutoDivide = () => {
    if (!numPeople || numPeople <= 0) {
      setError("Ingresa una cantidad válida de personas");
      return;
    }

    const num = parseInt(numPeople);
    const amountPerPerson = parseFloat(order.total_amount) / num;

    const newSplits = Array.from({ length: num }, (_, i) => ({
      id: Date.now() + i,
      person_name: `Persona ${i + 1}`,
      amount: Math.round(amountPerPerson * 100) / 100,
      payment_method: paymentMethod,
    }));

    // Ajustar redondeo en la última persona
    const totalWithoutLast = newSplits.slice(0, -1).reduce((sum, s) => sum + s.amount, 0);
    newSplits[newSplits.length - 1].amount = parseFloat(order.total_amount) - totalWithoutLast;

    setSplits(newSplits);
    setNumPeople("");
    setError("");
    setShowSplitForm(false);
    setSplitType("manual");
  };

  const handleRemoveSplit = (id) => {
    setSplits(splits.filter((split) => split.id !== id));
  };

  const handleProcessPayment = async () => {
    try {
      setLoading(true);
      setError("");

      if (splits.length === 0) {
        // Pago simple sin división
        await cashierService.processPayment(order.id, {
          amount: order.total_amount,
          paymentMethod,
          splits: [],
        });
      } else {
        // Validar que el total de splits sea igual al monto total
        if (totalPaid !== parseFloat(order.total_amount)) {
          setError(
            `El total debe ser exacto: ${formatCurrency(order.total_amount)}`
          );
          setLoading(false);
          return;
        }

        await cashierService.processPayment(order.id, {
          amount: order.total_amount,
          paymentMethod: "mixed", // mixed cuando hay división
          splits,
        });
      }

      onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al procesar el pago"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Procesar Pago</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Número de Orden:</span>
              <span className="font-semibold">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mesa:</span>
              <span className="font-semibold">{order.table?.table_number || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mesero:</span>
              <span className="font-semibold">{order.waiter?.name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha y Hora:</span>
              <span className="font-semibold">
                {new Date(order.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-900 font-semibold">Monto Total:</span>
              <span className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "COP",
                }).format(order.total_amount)}
              </span>
            </div>
          </div>

          {/* Payment Items */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Items de la Orden:</h3>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item.dish_name}
                  </span>
                  <span className="text-gray-900">
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "COP",
                    }).format(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          {splits.length === 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "cash", label: "Efectivo" },
                  { value: "card", label: "Tarjeta" },
                  { value: "transfer", label: "Transferencia" },
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`px-4 py-3 rounded-lg font-semibold transition ${
                      paymentMethod === method.value
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Split Payment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-900">
                Dividir Cuenta
              </label>
              <button
                onClick={() => setShowSplitForm(!showSplitForm)}
                className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                {showSplitForm ? "Cerrar" : "Agregar"}
              </button>
            </div>

            {/* Split Form - Tabs */}
            {showSplitForm && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                {/* Tabs para seleccionar tipo de división */}
                <div className="flex gap-2 border-b">
                  <button
                    onClick={() => setSplitType("manual")}
                    className={`px-3 py-2 font-semibold text-sm transition ${
                      splitType === "manual"
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <User className="w-4 h-4 inline mr-1" />
                    Manual
                  </button>
                  <button
                    onClick={() => setSplitType("equal")}
                    className={`px-3 py-2 font-semibold text-sm transition ${
                      splitType === "equal"
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Users className="w-4 h-4 inline mr-1" />
                    Automático
                  </button>
                </div>

                {/* Manual Division */}
                {splitType === "manual" && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nombre de la persona"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <input
                      type="number"
                      placeholder="Monto a pagar"
                      value={personAmount}
                      onChange={(e) => setPersonAmount(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <select
                      value={personPaymentMethod}
                      onChange={(e) => setPersonPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="transfer">Transferencia</option>
                    </select>

                    <button
                      onClick={handleAddSplit}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition"
                    >
                      Agregar Persona
                    </button>
                  </div>
                )}

                {/* Automatic Division */}
                {splitType === "equal" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        Cantidad de Personas
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Ej: 3"
                        value={numPeople}
                        onChange={(e) => setNumPeople(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {numPeople && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">
                          Cada persona pagará:
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(parseFloat(order.total_amount) / parseInt(numPeople))}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleAutoDivide}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                      Dividir en Partes Iguales
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Split List */}
            {splits.length > 0 && (
              <div className="space-y-2">
                {splits.map((split, idx) => (
                  <div
                    key={split.id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {split.person_name}
                        </p>
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
                        onClick={() => handleRemoveSplit(split.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Split Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-900 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleProcessPayment}
              disabled={
                loading ||
                (splits.length > 0 && remainingAmount !== 0) ||
                (splits.length === 0 && !paymentMethod)
              }
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition text-white flex items-center justify-center gap-2 ${
                loading ||
                (splits.length > 0 && remainingAmount !== 0) ||
                (splits.length === 0 && !paymentMethod)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <DollarSign className="w-5 h-5" />
              {loading ? "Procesando..." : "Confirmar Pago"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
