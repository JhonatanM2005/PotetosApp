import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { cashierService } from "../../services";
import {
  Search,
  FileText,
  CreditCard,
  ChevronRight,
} from "lucide-react";

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    searchTerm: "",
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async (startDate = "", endDate = "") => {
    try {
      setLoading(true);
      const data = await cashierService.getPaymentHistory({
        startDate,
        endDate,
      });
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleApplyFilters = () => {
    fetchPayments(filters.startDate, filters.endDate);
  };

  const handleResetFilters = () => {
    setFilters({ startDate: "", endDate: "", searchTerm: "" });
    fetchPayments();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "COP",
    }).format(amount);
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

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case "cash":
        return "bg-green-100 text-green-800";
      case "card":
        return "bg-blue-100 text-blue-800";
      case "transfer":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "cash":
        return "Efectivo";
      case "card":
        return "Tarjeta";
      case "transfer":
        return "Transferencia";
      case "mixed":
        return "Mixto";
      default:
        return method;
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (!filters.searchTerm) return true;
    return (
      payment.order?.order_number
        ?.toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      payment.cashier?.name
        ?.toLowerCase()
        .includes(filters.searchTerm.toLowerCase())
    );
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            FACTURAS
          </h2>
          <p className="text-gray-600">
            Accede y descarga todas tus facturas de pago.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="searchTerm"
                  placeholder="Orden o Cajero..."
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 items-end">
              <button
                onClick={handleApplyFilters}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                Buscar
              </button>
              <button
                onClick={handleResetFilters}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-4 py-2 rounded-lg transition"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Invoices Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin mx-auto mb-4 w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-gray-600">Cargando facturas...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No hay facturas registradas</p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-600 text-sm">Total de Facturas</p>
                  <p className="text-2xl font-bold text-primary">
                    {filteredPayments.length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-600 text-sm">Total Recaudado</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(
                      filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
                    )}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-600 text-sm">Promedio por Factura</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(
                      filteredPayments.length > 0
                        ? filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0) /
                            filteredPayments.length
                        : 0
                    )}
                  </p>
                </div>
              </div>

              {/* Invoices List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer border border-gray-200"
                    onClick={() =>
                      navigate(`/dashboard/invoice/${payment.id}`)
                    }
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Orden #{payment.order?.order_number}
                            </p>
                            <p className="text-sm text-gray-500">
                              Factura #{payment.id}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>

                      {/* Details */}
                      <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Mesa:</span>
                          <span className="font-semibold text-gray-900">
                            {payment.order?.table?.table_number || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Cajero:</span>
                          <span className="font-semibold text-gray-900">
                            {payment.cashier?.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Fecha:</span>
                          <span className="font-semibold text-gray-900">
                            {formatDate(payment.paid_at).split(',')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Payment Method & Amount */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentMethodColor(
                            payment.payment_method
                          )}`}
                        >
                          {getPaymentMethodLabel(payment.payment_method)}
                        </span>
                        <p className="text-lg font-bold text-secondary">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
