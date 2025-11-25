import { X, Printer, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InvoiceModal({ payment, onClose }) {
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
      case "split":
      case "mixed":
        return "Mixto";
      default:
        return method;
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-content");
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload to restore event listeners
  };

  const handleDownloadPDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const darkGray = [50, 50, 50];
      const lightGray = [200, 200, 200];
      const grayText = [85, 85, 85];

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

      yPosition += 4;
      pdf.setFontSize(9);
      pdf.text("Factura de Pago", 105, yPosition, { align: "center" });

      yPosition += 10;

      // Línea separadora
      pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.line(15, yPosition, 195, yPosition);

      yPosition += 8;

      // Info de la factura - 2 columnas
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.setFontSize(9);

      // Columna izquierda
      pdf.setFont("helvetica", "bold");
      pdf.text("Factura #:", 15, yPosition);
      pdf.setFont("helvetica", "normal");
      pdf.text(String(payment.id), 45, yPosition);

      pdf.setFont("helvetica", "bold");
      pdf.text("Orden #:", 15, yPosition + 6);
      pdf.setFont("helvetica", "normal");
      pdf.text(payment.order?.order_number || "N/A", 45, yPosition + 6);

      pdf.setFont("helvetica", "bold");
      pdf.text("Fecha:", 15, yPosition + 12);
      pdf.setFont("helvetica", "normal");
      pdf.text(formatDate(payment.paid_at || payment.created_at), 45, yPosition + 12);

      // Columna derecha
      pdf.setFont("helvetica", "bold");
      pdf.text("Mesa:", 120, yPosition);
      pdf.setFont("helvetica", "normal");
      pdf.text(String(payment.order?.table?.table_number || "N/A"), 150, yPosition);

      pdf.setFont("helvetica", "bold");
      pdf.text("Mesero:", 120, yPosition + 6);
      pdf.setFont("helvetica", "normal");
      pdf.text(payment.order?.waiter?.name || "N/A", 150, yPosition + 6);

      pdf.setFont("helvetica", "bold");
      pdf.text("Cajero:", 120, yPosition + 12);
      pdf.setFont("helvetica", "normal");
      pdf.text(payment.cashier?.name || "N/A", 150, yPosition + 12);

      yPosition += 25;

      // Título Items
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.setFontSize(10);
      pdf.text("ITEMS DEL PEDIDO", 15, yPosition);

      yPosition += 8;

      // Tabla de items
      const tableData =
        payment.order?.items && payment.order.items.length > 0
          ? payment.order.items.map((item) => [
              item.dish_name,
              String(item.quantity),
              formatCurrency(item.unit_price || item.subtotal / item.quantity),
              formatCurrency(item.subtotal),
            ])
          : [["No hay items registrados", "", "", ""]];

      autoTable(pdf, {
        startY: yPosition,
        head: [["Producto", "Cant.", "Precio Unit.", "Total"]],
        body: tableData,
        headStyles: {
          fillColor: [50, 50, 50],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
          halign: "left",
        },
        bodyStyles: {
          fontSize: 9,
          textColor: darkGray,
        },
        columnStyles: {
          1: { halign: "center" },
          2: { halign: "right" },
          3: { halign: "right", fontStyle: "bold" },
        },
        margin: { left: 15, right: 15 },
      });

      yPosition = pdf.lastAutoTable.finalY + 10;

      // Línea separadora
      pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.line(15, yPosition, 195, yPosition);

      yPosition += 8;

      // Totales - Alineados a la derecha
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(grayText[0], grayText[1], grayText[2]);

      pdf.text("Subtotal:", 150, yPosition);
      pdf.text(formatCurrency(payment.order?.total_amount || 0), 185, yPosition, {
        align: "right",
      });

      yPosition += 6;
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.text("IVA (incluido)", 150, yPosition);

      yPosition += 8;

      // Línea antes del total
      pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.line(150, yPosition - 1, 190, yPosition - 1);

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.setFontSize(11);
      pdf.text("Total:", 140, yPosition + 3);
      pdf.text(formatCurrency(payment.amount), 185, yPosition + 3, {
        align: "right",
      });

      yPosition += 15;

      // Método de pago
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.text("Método de Pago:", 15, yPosition);

      yPosition += 6;
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(grayText[0], grayText[1], grayText[2]);

      if (payment.splits && payment.splits.length > 0) {
        payment.splits.forEach((split) => {
          pdf.text(
            `• ${getPaymentMethodLabel(split.payment_method)}: ${formatCurrency(
              split.amount
            )}`,
            20,
            yPosition
          );
          yPosition += 5;
        });
      } else {
        pdf.text(`• ${getPaymentMethodLabel(payment.payment_method)}`, 20, yPosition);
      }

      // Footer
      yPosition = pdf.internal.pageSize.getHeight() - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text("¡Gracias por su compra!", 105, yPosition, { align: "center" });
      pdf.text("Vuelve pronto a POTETOS", 105, yPosition + 5, { align: "center" });

      // Guardar el PDF
      const fileName = `Factura_Orden_${payment.order?.order_number}_${
        new Date(payment.paid_at || payment.created_at).toISOString().split("T")[0]
      }.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error("Error descargando PDF:", error);
      alert("Error al descargar el PDF: " + error.message);
    }
  };

  if (!payment) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-linear-to-br from-primary to-primary/90 text-white px-8 py-6 rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Factura de Pago</h3>
              <p className="text-white/80">Factura #{payment.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition"
                title="Imprimir"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownloadPDF}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition"
                title="Descargar PDF"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div id="invoice-content" className="p-8">
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
                <span className="font-bold">Orden #:</span> {payment.order?.order_number}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-bold">Fecha:</span>{" "}
                {formatDate(payment.paid_at || payment.created_at)}
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
                <span className="font-bold">Cajero:</span> {payment.cashier?.name || "N/A"}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="font-bold mb-3 text-gray-900">ITEMS DEL PEDIDO</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 px-2 font-bold text-gray-900">Producto</th>
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
                      <td className="text-center py-3 px-2 text-gray-700">{item.quantity}</td>
                      <td className="text-right py-3 px-2 text-gray-700">
                        {formatCurrency(item.unit_price || item.subtotal / item.quantity)}
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
                    {formatCurrency(payment.order?.total_amount || 0)}
                  </span>
                </div>
                <div className="flex justify-between mb-3 pb-3 border-b border-gray-300">
                  <span className="text-gray-600 text-sm">IVA (incluido)</span>
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
                {payment.splits.map((split, idx) => (
                  <p key={idx}>
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
          #invoice-content {
            padding: 0;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
