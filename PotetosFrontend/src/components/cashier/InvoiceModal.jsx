import { X, Download, Receipt } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/images/logo.png";

export default function InvoiceModal({ payment, onClose }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0, // Sin decimales para ahorrar espacio en POS
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



  const getImageBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = url;
    });
  };

  const handleDownloadPOS = async () => {
    try {
      // 1. Calcular la altura necesaria
      let calculatedHeight = 10; // Margen inicial
      const margin = 5;
      const pageWidth = 80;
      
      // Logo
      calculatedHeight += 30 + 5; // Altura logo + espacio
      
      // Encabezado (Restaurante, Nit, Dir, Tel)
      calculatedHeight += 4 + 4 + 4 + 4 + 8;
      
      // Separador
      calculatedHeight += 5;
      
      // Info Orden (Orden, Fecha, Mesa, Mesero, Cajero)
      calculatedHeight += 5 + 5 + 5 + 5 + 5 + 8;
      
      // Separador
      calculatedHeight += 5;
      
      // Títulos Items
      calculatedHeight += 5;
      
      // Items (Cálculo dinámico)
      if (payment.order?.items) {
        // Creamos un doc temporal para calcular alturas de texto
        const tempPdf = new jsPDF();
        tempPdf.setFont("courier", "normal");
        tempPdf.setFontSize(9);
        
        payment.order.items.forEach((item) => {
          const quantity = item.quantity;
          const productName = item.dish_name;
          
          // Calculamos altura del texto del nombre con ancho máx de 45mm
          // jsPDF usa puntos por defecto, convertimos mm a puntos aprox para splitTextToSize si fuera necesario,
          // pero splitTextToSize toma unidades del documento.
          // Mejor estimación:
          const splitTitle = tempPdf.splitTextToSize(`${quantity}x ${productName}`, 45);
          const titleHeight = splitTitle.length * 4; // 4mm por línea aprox
          
          calculatedHeight += Math.max(titleHeight, 5);
        });
      }
      
      calculatedHeight += 3; // Espacio antes de línea
      calculatedHeight += 5; // Separador
      
      // Totales
      calculatedHeight += 5; // Subtotal
      
      const tip = parseFloat(payment.tip || 0);
      if (tip > 0) {
        calculatedHeight += 5; // Propina
      }
      
      calculatedHeight += 8; // Total
      
      // Método de Pago
      calculatedHeight += 5; // Título
      if (payment.splits && payment.splits.length > 0) {
        calculatedHeight += payment.splits.length * 5;
      } else {
        calculatedHeight += 5;
      }
      
      calculatedHeight += 10; // Espacio antes de footer
      
      // Footer
      calculatedHeight += 4 + 4; // Gracias + Software
      calculatedHeight += 10; // Margen final
      
      // 2. Generar PDF con altura calculada
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, calculatedHeight],
      });

      let yPosition = 10;

      // Estilos
      pdf.setFont("courier", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);

      // Logo
      try {
        const logoBase64 = await getImageBase64(logo);
        const logoWidth = 30;
        const logoX = (pageWidth - logoWidth) / 2;
        pdf.addImage(logoBase64, "PNG", logoX, yPosition, logoWidth, logoWidth);
        yPosition += logoWidth + 5;
      } catch (error) {
        console.error("Error loading logo for POS:", error);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("POTETOS", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 8;
      }

      // Encabezado
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text("Restaurante & Bar", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 4;
      pdf.text("Nit: 900.123.456-7", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 4;
      pdf.text("Calle 123 # 45-67, Ciudad", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 4;
      pdf.text("Tel: 300 123 4567", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 8;

      // Separador
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Info Orden
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Orden: #${payment.order?.order_number || "N/A"}`, margin, yPosition);
      yPosition += 5;
      pdf.setFont("helvetica", "normal");
      pdf.text(`Fecha: ${formatDate(payment.paid_at || payment.created_at)}`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Mesa: ${payment.order?.table?.table_number || "N/A"}`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Mesero: ${payment.order?.waiter?.name || "N/A"}`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Cajero: ${payment.cashier?.name || "N/A"}`, margin, yPosition);
      yPosition += 8;

      // Separador
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Items
      pdf.setFont("helvetica", "bold");
      pdf.text("Cant. Producto", margin, yPosition);
      pdf.text("Total", pageWidth - margin, yPosition, { align: "right" });
      yPosition += 5;
      pdf.setFont("helvetica", "normal");

      if (payment.order?.items) {
        payment.order.items.forEach((item) => {
          const productName = item.dish_name;
          const quantity = item.quantity;
          const total = formatCurrency(item.subtotal);

          // Primera línea: Cantidad y Nombre
          pdf.text(`${quantity}x ${productName}`, margin, yPosition, { maxWidth: 45 });
          
          const splitTitle = pdf.splitTextToSize(`${quantity}x ${productName}`, 45);
          const titleHeight = splitTitle.length * 4;
          
          pdf.text(total, pageWidth - margin, yPosition, { align: "right" });
          
          yPosition += Math.max(titleHeight, 5);
        });
      }

      yPosition += 3;
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Totales
      pdf.setFont("helvetica", "bold");
      
      // Subtotal
      pdf.text("Subtotal:", margin, yPosition);
      pdf.text(formatCurrency(payment.order?.total_amount || 0), pageWidth - margin, yPosition, { align: "right" });
      yPosition += 5;

      // Propina (si hay)
      if (tip > 0) {
        pdf.text("Propina:", margin, yPosition);
        pdf.text(formatCurrency(tip), pageWidth - margin, yPosition, { align: "right" });
        yPosition += 5;
      }

      // Total
      pdf.setFontSize(11);
      pdf.text("TOTAL:", margin, yPosition);
      pdf.text(formatCurrency(payment.amount), pageWidth - margin, yPosition, { align: "right" });
      yPosition += 8;

      // Método de Pago
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("Forma de Pago:", margin, yPosition);
      yPosition += 5;

      if (payment.splits && payment.splits.length > 0) {
        payment.splits.forEach((split) => {
          pdf.text(
            `${getPaymentMethodLabel(split.payment_method)}: ${formatCurrency(split.amount)}`,
            margin + 5,
            yPosition
          );
          yPosition += 5;
        });
      } else {
        pdf.text(
          `${getPaymentMethodLabel(payment.payment_method)}: ${formatCurrency(payment.amount)}`,
          margin + 5,
          yPosition
        );
      }

      yPosition += 10;
      
      // Footer
      pdf.setFontSize(8);
      pdf.text("¡Gracias por su compra!", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 4;
      pdf.text("Software: PotetosApp", pageWidth / 2, yPosition, { align: "center" });

      // Guardar PDF
      const fileName = `Ticket_${payment.order?.order_number}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error("Error generating POS ticket:", error);
      alert("Error al generar ticket POS");
    }
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

      // Header - LOGO
      try {
        const logoBase64 = await getImageBase64(logo);
        // Centrar logo: A4 width es 210mm.
        // Asumimos un ancho de logo de 40mm.
        // x = (210 - 40) / 2 = 85
        pdf.addImage(logoBase64, "PNG", 85, yPosition, 40, 40); // x, y, w, h
        yPosition += 45; // Espacio para el logo
      } catch (error) {
        console.error("Error loading logo for PDF:", error);
        // Fallback text si falla el logo
        pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        pdf.setFontSize(24);
        pdf.setFont("helvetica", "bold");
        pdf.text("POTETOS", 105, yPosition + 10, { align: "center" });
        yPosition += 20;
      }

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
                onClick={handleDownloadPOS}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition flex items-center gap-1"
                title="Ticket POS"
              >
                <Receipt className="w-5 h-5" />
                <span className="text-xs font-bold hidden sm:inline">POS</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition"
                title="Descargar PDF A4"
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
            <img src={logo} alt="Potetos Logo" className="h-24 mx-auto mb-4 object-contain" />
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
