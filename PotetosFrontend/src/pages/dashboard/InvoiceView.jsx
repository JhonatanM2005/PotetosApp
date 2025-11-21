import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { cashierService } from "../../services";
import { ArrowLeft, Printer, Download, FileText } from "lucide-react";

const InvoiceView = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentDetail();
  }, [paymentId]);

  const fetchPaymentDetail = async () => {
    try {
      setLoading(true);
      const data = await cashierService.getPaymentHistory();
      const foundPayment = data.payments?.find(
        (p) => p.id === parseInt(paymentId)
      );
      if (foundPayment) {
        console.log("✅ Payment found:", foundPayment);
        console.log("📦 Order items:", foundPayment.order?.items);
        setPayment(foundPayment);
      } else {
        console.warn("❌ Payment not found with ID:", paymentId);
      }
    } catch (error) {
      console.error("Error fetching payment:", error);
    } finally {
      setLoading(false);
    }
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      const element = document.getElementById("invoice-content");
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      const fileName = `Factura_Orden_${payment.order?.order_number}_${new Date(
        payment.paid_at
      )
        .toISOString()
        .split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!payment) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Factura no encontrada</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition font-semibold"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition font-semibold"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
          </div>
        </div>

        {/* Invoice */}
        <div
          id="invoice-content"
          className="bg-white rounded-lg shadow-lg p-12 max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="border-b-2 border-gray-300 pb-6 mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">POTETOS</h1>
            <p className="text-gray-600">Restaurante & Bar</p>
            <p className="text-gray-600 text-sm">Factura de Pago</p>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-600 text-sm mb-4">
                <span className="font-bold">Factura #:</span> {payment.id}
              </p>
              <p className="text-gray-600 text-sm mb-4">
                <span className="font-bold">Orden #:</span>{" "}
                {payment.order?.order_number}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-bold">Fecha:</span>{" "}
                {formatDate(payment.paid_at)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm mb-4">
                <span className="font-bold">Mesa:</span>{" "}
                {payment.order?.table?.table_number || "N/A"}
              </p>
              <p className="text-gray-600 text-sm mb-4">
                <span className="font-bold">Mesero:</span>{" "}
                {payment.order?.waiter?.name || "N/A"}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-bold">Cajero:</span>{" "}
                {payment.cashier?.name}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="font-bold mb-3 text-gray-900">ITEMS DEL PEDIDO</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 px-2 font-bold text-gray-900">
                    Producto
                  </th>
                  <th className="text-center py-2 px-2 font-bold text-gray-900 w-16">
                    Cant.
                  </th>
                  <th className="text-right py-2 px-2 font-bold text-gray-900 w-24">
                    Precio Unit.
                  </th>
                  <th className="text-right py-2 px-2 font-bold text-gray-900 w-24">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {payment.order?.items && payment.order.items.length > 0 ? (
                  payment.order.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-3 px-2 text-gray-700">{item.dish_name}</td>
                      <td className="text-center py-3 px-2 text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="text-right py-3 px-2 text-gray-700">
                        {formatCurrency(
                          item.unit_price || item.subtotal / item.quantity
                        )}
                      </td>
                      <td className="text-right py-3 px-2 font-semibold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-3 px-2 text-center text-gray-600">
                      No hay items registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mb-6 border-t-2 border-gray-300 pt-4">
            <div className="flex justify-end mb-3">
              <div className="w-64">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-gray-700">
                    {formatCurrency(payment.order?.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between mb-3 pb-3 border-b border-gray-300">
                  <span className="text-gray-600 text-sm">
                    IVA (incluido)
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total:</span>
                  <span>{formatCurrency(payment.amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <p className="font-bold text-gray-900 mb-2">Método de Pago:</p>
            {payment.splits && payment.splits.length > 0 ? (
              <div className="text-sm text-gray-700 space-y-1">
                {payment.splits.map((split) => (
                  <p key={split.id}>
                    • {getPaymentMethodLabel(split.payment_method)}:{" "}
                    {formatCurrency(split.amount)}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                {getPaymentMethodLabel(payment.payment_method)}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-300 pt-6 text-center text-gray-600 text-sm">
            <p>¡Gracias por su compra!</p>
            <p>Vuelve pronto a POTETOS</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background: white;
          }
          .p-8 {
            padding: 0;
          }
          #invoice-content {
            box-shadow: none;
            border: none;
            max-width: 100%;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default InvoiceView;
