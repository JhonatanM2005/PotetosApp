import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { cashierService } from "../../services";
import {
  Search,
  Calendar,
  DollarSign,
  CreditCard,
  ChevronDown,
  Download,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

export default function PaymentHistoryPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
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

  const handleDownloadPDF = () => {
    try {
      toast.loading("Generando PDF...", { id: "pdf-generation" });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const darkGray = [50, 50, 50];
      const lightGray = [200, 200, 200];
      const grayText = [85, 85, 85];
      const primaryColor = [59, 130, 246]; // primary blue

      let yPosition = 15;

      // Header - POTETOS
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("POTETOS", 105, yPosition, { align: "center" });

      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(grayText[0], grayText[1], grayText[2]);
      pdf.text("Restaurante & Bar", 105, yPosition, { align: "center" });

      yPosition += 6;
      pdf.setFontSize(9);
      pdf.text("Historial de Pagos", 105, yPosition, { align: "center" });

      yPosition += 10;

      // Línea separadora
      pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.line(15, yPosition, 195, yPosition);

      yPosition += 8;

      // Fecha de generación
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(grayText[0], grayText[1], grayText[2]);
      pdf.text(
        `Generado: ${new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        15,
        yPosition
      );

      yPosition += 12;

      // Tabla de pagos
      const tableData = filteredPayments.map((payment) => [
        `#${payment.order?.order_number || "N/A"}`,
        formatDate(payment.created_at).split(" ")[0],
        getPaymentMethodLabel(payment.payment_method),
        formatCurrency(payment.amount),
        payment.cashier?.name || "N/A",
      ]);

      autoTable(pdf, {
        head: [["Orden", "Fecha", "Método", "Monto", "Cajero"]],
        body: tableData,
        startY: yPosition,
        theme: "grid",

        headerStyles: {
          darkGray: [255, 255, 255],
          fillColor: [200, 200, 200],
          textColor: [50, 50, 50],
          fontStyle: "bold",
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
          textColor: grayText,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          3: { halign: "right" },
        },
        margin: { left: 15, right: 15 },
      });

      yPosition = pdf.lastAutoTable.finalY + 10;

      // Totales
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

      const totalAmount = filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const totalCount = filteredPayments.length;

      pdf.text(`Total de Transacciones: ${totalCount}`, 15, yPosition);
      yPosition += 8;
      pdf.text(`Monto Total: ${formatCurrency(totalAmount)}`, 15, yPosition);

      yPosition += 12;

      // Línea separadora final
      pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.line(15, yPosition, 195, yPosition);

      yPosition += 8;

      // Footer
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(grayText[0], grayText[1], grayText[2]);
      pdf.text("¡Gracias por usar POTETOS!", 105, yPosition, { align: "center" });

      // Guardar PDF
      const fileName = `Historial-Pagos-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      toast.success("PDF descargado correctamente", { id: "pdf-generation" });
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Error al descargar el PDF", { id: "pdf-generation" });
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              HISTORIAL DE PAGOS
            </h2>
            <p className="text-gray-600">
              Visualiza todos los pagos procesados con detalles completos.
            </p>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition font-semibold whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
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

        {/* Payments List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin mx-auto mb-4 w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-gray-600">Cargando historial...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No hay pagos registrados</p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-600 text-sm">Total de Transacciones</p>
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
                  <p className="text-gray-600 text-sm">Promedio por Transacción</p>
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

              {/* Payments Table */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-200 text-gray-900">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Orden
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Mesa
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Cajero
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Método
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Monto
                      </th>
                      <th className="px-6 py-4 text-center font-semibold">
                        Detalles
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                      {filteredPayments.map((payment) => (
                        <>
                          <tr key={payment.id} className="border-b hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                              {formatDate(payment.paid_at)}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                              {payment.order?.order_number}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                              {payment.order?.table?.table_number || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                              {payment.cashier?.name}
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentMethodColor(
                                  payment.payment_method
                                )}`}
                              >
                                {getPaymentMethodLabel(payment.payment_method)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-secondary whitespace-nowrap">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <button
                                onClick={() =>
                                  setExpandedId(
                                    expandedId === payment.id ? null : payment.id
                                  )
                                }
                                className="text-primary hover:text-primary/80 transition inline-flex items-center justify-center"
                              >
                                <ChevronDown
                                  className={`w-5 h-5 transition ${
                                    expandedId === payment.id ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Details */}
                          {expandedId === payment.id && (
                            <tr className="bg-gray-50">
                              <td colSpan="7" className="px-6 py-4">
                                <div className="space-y-4">
                                  {/* Invoice Button */}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        navigate(`/dashboard/invoice/${payment.id}`)
                                      }
                                      className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition font-semibold"
                                    >
                                      <FileText className="w-4 h-4" />
                                      Ver Factura Completa
                                    </button>
                                  </div>
                                  {/* Order Info */}
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">
                                      Información de la Orden
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div className="bg-white p-3 rounded-lg">
                                        <p className="text-gray-600 text-xs font-semibold">Mesero</p>
                                        <p className="font-semibold text-gray-900">
                                          {payment.order?.waiter?.name || "N/A"}
                                        </p>
                                      </div>
                                      <div className="bg-white p-3 rounded-lg">
                                        <p className="text-gray-600 text-xs font-semibold">Mesa</p>
                                        <p className="font-semibold text-gray-900">
                                          {payment.order?.table?.table_number || "N/A"}
                                        </p>
                                      </div>
                                      <div className="bg-white p-3 rounded-lg">
                                        <p className="text-gray-600 text-xs font-semibold">Total de Orden</p>
                                        <p className="font-semibold text-secondary">
                                          {formatCurrency(payment.order?.total_amount)}
                                        </p>
                                      </div>
                                      <div className="bg-white p-3 rounded-lg">
                                        <p className="text-gray-600 text-xs font-semibold">Cajero</p>
                                        <p className="font-semibold text-gray-900">
                                          {payment.cashier?.name}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Items */}
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">
                                      Items de la Orden
                                    </h4>
                                    <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                                      {payment.order?.items?.map((item) => (
                                        <div
                                          key={item.id}
                                          className="flex justify-between items-center pb-2 border-b last:border-b-0"
                                        >
                                          <span className="text-gray-600">
                                            {item.quantity}x {item.dish_name}
                                          </span>
                                          <span className="font-semibold text-gray-900">
                                            {formatCurrency(item.subtotal)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Payment Splits */}
                                  {payment.splits && payment.splits.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-3">
                                        División de Pago
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        {payment.splits.map((split) => (
                                          <div
                                            key={split.id}
                                            className="bg-white rounded-lg p-4 flex justify-between items-center"
                                          >
                                            <div>
                                              <p className="font-semibold text-gray-900">
                                                {split.person_name}
                                              </p>
                                              <p className="text-xs text-gray-600">
                                                {getPaymentMethodLabel(split.payment_method)}
                                              </p>
                                            </div>
                                            <span className="font-bold text-secondary">
                                              {formatCurrency(split.amount)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Payment Summary */}
                                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-primary">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-700 font-semibold">Total Pagado:</span>
                                      <span className="font-bold text-secondary text-lg">
                                        {formatCurrency(payment.amount)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
