import { useState, useEffect } from "react";
import { FileText, Download, Calendar, Receipt, Users } from "lucide-react";
import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import socketService from "../../services/socket";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CashierReports = () => {
  const [dailyPayments, setDailyPayments] = useState([]);
  const [cashClosing, setCashClosing] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();

    // Escuchar eventos de Socket.io para actualizaciones en tiempo real
    const handlePaymentProcessed = (data) => {
      // Solo actualizar si estamos viendo el día de hoy
      const today = new Date().toISOString().split("T")[0];
      if (selectedDate === today) {
        toast.success(`Nuevo pago registrado: ${data.orderNumber}`, {
          duration: 3000,
          icon: "💰",
        });
        fetchReports();
      }
    };

    socketService.on("payment:processed", handlePaymentProcessed);

    // Cleanup: remover listener cuando el componente se desmonte
    return () => {
      socketService.off("payment:processed", handlePaymentProcessed);
    };
  }, [selectedDate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [paymentsRes, closingRes] = await Promise.all([
        api.get(`/cashier/daily-payments?date=${selectedDate}`),
        api.get(`/cashier/cash-closing?date=${selectedDate}`),
      ]);

      setDailyPayments(paymentsRes.data.orders);
      setCashClosing(closingRes.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error(
        "Error al cargar los reportes. Por favor, intenta de nuevo.",
        {
          duration: 4000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const printReport = () => {
    if (!cashClosing) {
      toast.error("No hay datos para generar el reporte");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Título
    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("Reporte de Caja", pageWidth / 2, 20, { align: "center" });

    // Fecha
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    const formattedDate = new Date(cashClosing.date).toLocaleDateString(
      "es-ES",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    doc.text(`Fecha: ${formattedDate}`, pageWidth / 2, 30, { align: "center" });

    // Resumen
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Resumen del Día", 14, 45);

    const summaryData = [
      [
        "Total del Día",
        `$${(cashClosing.summary?.totalSales || 0).toFixed(2)}`,
      ],
      ["Propinas", `$${(cashClosing.summary?.totalTips || 0).toFixed(2)}`],
      [
        "Órdenes Procesadas",
        (cashClosing.summary?.totalOrders || 0).toString(),
      ],
      [
        "Ticket Promedio",
        `$${(
          (cashClosing.summary?.totalSales || 0) /
          (cashClosing.summary?.totalOrders || 1)
        ).toFixed(2)}`,
      ],
    ];

    autoTable(doc, {
      startY: 50,
      head: [["Concepto", "Valor"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [6, 1, 51], textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 },
    });

    // Desglose por cajero
    if (cashClosing.byCashier && cashClosing.byCashier.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("Desglose por Cajero", 14, doc.lastAutoTable.finalY + 15);

      const cashierData = cashClosing.byCashier.map((c) => [
        c.cashierName || "N/A",
        (c.orders || 0).toString(),
        `$${(c.cash || 0).toFixed(2)}`,
        `$${(c.card || 0).toFixed(2)}`,
        `$${(c.transfer || 0).toFixed(2)}`,
        `$${(c.tips || 0).toFixed(2)}`,
        `$${(c.total || 0).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [
          [
            "Cajero",
            "Órdenes",
            "Efectivo",
            "Tarjeta",
            "Transfer.",
            "Propinas",
            "Total",
          ],
        ],
        body: cashierData,
        theme: "striped",
        headStyles: { fillColor: [6, 1, 51], textColor: [255, 255, 255] },
        margin: { left: 14, right: 14 },
      });
    }

    // Historial de pagos
    if (dailyPayments && dailyPayments.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("Historial de Pagos", 14, 20);

      const paymentsData = dailyPayments.map((order) => [
        order.order_number || "N/A",
        order.table?.table_number || "N/A",
        order.payment_method === "cash"
          ? "Efectivo"
          : order.payment_method === "card"
          ? "Tarjeta"
          : "Transfer.",
        order.waiter?.name || "N/A",
        order.cashier?.name || "N/A",
        `$${parseFloat(order.total_amount || 0).toFixed(2)}`,
        `$${parseFloat(order.tip_amount || 0).toFixed(2)}`,
        formatDate(order.completed_at),
      ]);

      autoTable(doc, {
        startY: 25,
        head: [
          [
            "Orden",
            "Mesa",
            "Método",
            "Mesero",
            "Cajero",
            "Total",
            "Propina",
            "Fecha",
          ],
        ],
        body: paymentsData,
        theme: "striped",
        headStyles: { fillColor: [6, 1, 51], textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });
    }

    // Guardar PDF
    doc.save(`reporte-caja-${selectedDate}.pdf`);

    toast.success("Reporte generado exitosamente", {
      duration: 3000,
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Cargando reportes...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              Reportes de Caja
            </h1>
            <p className="text-gray-600">
              Historial y cierre diario de operaciones
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-md px-4 py-3 border-2 border-gray-100">
              <Calendar className="w-5 h-5 text-primary" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="focus:outline-none text-gray-700 font-medium"
              />
            </div>
            <button
              onClick={printReport}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-xl hover:scale-105 print:hidden"
            >
              <Download className="w-5 h-5" />
              Imprimir Reporte
            </button>
          </div>
        </div>

        {/* Resumen de cierre de caja */}
        {cashClosing && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 print:shadow-none print:border print:border-gray-300">
            {/* Header del reporte */}
            <div className="flex items-center gap-3 mb-6 print:mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center print:hidden">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary">
                  Cierre de Caja
                </h2>
                <p className="text-gray-600">
                  Fecha:{" "}
                  {new Date(cashClosing.date).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Cards de resumen */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 print:border print:border-gray-300 print:bg-white">
                <div className="text-sm text-gray-600 mb-2 font-semibold">
                  Total Órdenes
                </div>
                <div className="text-3xl font-bold text-blue-600 print:text-black">
                  {cashClosing.summary.totalOrders}
                </div>
              </div>
              <div className="bg-linear-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 print:border print:border-gray-300 print:bg-white">
                <div className="text-sm text-gray-600 mb-2 font-semibold">
                  Ventas Totales
                </div>
                <div className="text-3xl font-bold text-green-600 print:text-black">
                  ${cashClosing.summary.totalSales.toFixed(2)}
                </div>
              </div>
              <div className="bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-6 print:border print:border-gray-300 print:bg-white">
                <div className="text-sm text-gray-600 mb-2 font-semibold">
                  Propinas
                </div>
                <div className="text-3xl font-bold text-purple-600 print:text-black">
                  ${cashClosing.summary.totalTips.toFixed(2)}
                </div>
              </div>
              <div className="bg-linear-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6 print:border print:border-gray-300 print:bg-white">
                <div className="text-sm text-gray-600 mb-2 font-semibold">
                  Total General
                </div>
                <div className="text-3xl font-bold text-orange-600 print:text-black">
                  ${cashClosing.summary.grandTotal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Desglose por cajero */}
            <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2 print:text-black">
              <Users className="w-5 h-5" />
              Desglose por Cajero
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 print:border">
              <table className="min-w-full divide-y divide-gray-200 print:text-sm">
                <thead className="bg-primary/5 print:bg-gray-100">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Cajero
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Órdenes
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Efectivo
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Tarjeta
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Transferencia
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Propinas
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {cashClosing.byCashier.map((cashier) => (
                    <tr
                      key={cashier.cashierId}
                      className="hover:bg-primary/5 transition-colors duration-150"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 print:text-black">
                        {cashier.cashierName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 print:text-black">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-medium print:bg-white print:border print:border-gray-300">
                          {cashier.orders}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 print:text-black">
                        ${cashier.cash.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 print:text-black">
                        ${cashier.card.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 print:text-black">
                        ${cashier.transfer.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 print:text-black">
                        ${cashier.tips.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-primary print:text-black">
                        ${cashier.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Historial de pagos del día */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 print:shadow-none print:border">
          <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <Receipt className="h-6 w-6" />
            Historial de Pagos
          </h2>

          {dailyPayments.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No hay pagos registrados para esta fecha
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 print:border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Nro. Orden
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Mesa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Método
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Mesero
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Cajero
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Propina
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider print:text-black">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {dailyPayments.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-primary/5 transition-colors duration-150 print:hover:bg-white"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-primary print:text-black">
                        #{order.order_number}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 print:text-black">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium print:bg-white print:border print:border-gray-300">
                          Mesa {order.table?.table_number || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                            order.payment_method === "cash"
                              ? "bg-linear-to-r from-green-100 to-green-200 text-green-800 border border-green-300"
                              : order.payment_method === "card"
                              ? "bg-linear-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300"
                              : "bg-linear-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300"
                          } print:bg-white print:border print:border-gray-400 print:text-black`}
                        >
                          {order.payment_method === "cash"
                            ? "Efectivo"
                            : order.payment_method === "card"
                            ? "Tarjeta"
                            : "Transferencia"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 print:text-black">
                        {order.waiter?.name || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 print:text-black">
                        {order.cashier?.name || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-primary print:text-black">
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 print:text-black">
                        ${parseFloat(order.tip_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 print:text-black">
                        {formatDate(order.completed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CashierReports;
