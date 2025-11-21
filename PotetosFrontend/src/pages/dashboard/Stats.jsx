import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import api from "../../services/api";
import jsPDF from "jspdf";
import { Download } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DashboardStats() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");

  const COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, [period]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/stats?period=${period}`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatHour = (hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const downloadPDF = async () => {
    try {
      if (!stats) return;

      const loadingToast = document.createElement("div");
      loadingToast.className = "fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50";
      loadingToast.style.backgroundColor = "#1E0342";
      loadingToast.style.color = "#ffffff";
      loadingToast.textContent = "Generando Reporte PDF...";
      document.body.appendChild(loadingToast);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = 0;

      const periodNames = {
        day: "Hoy",
        week: "Última Semana",
        month: "Último Mes",
        year: "Último Año",
      };

      const currentDate = new Date().toLocaleDateString("es-CO", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // HEADER CON FONDO DE COLOR POTETOS
      pdf.setFillColor(30, 3, 66); // Color primary de POTETOS (#1E0342)
      pdf.rect(0, 0, pageWidth, 45, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text("INFORME DE ESTADÍSTICAS", pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Fecha: ${currentDate}`, pageWidth / 2, 35, { align: 'center' });
      
      currentY = 55;

      // Período analizado
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Período analizado: ${periodNames[period].toUpperCase()}`, margin, currentY);
      currentY += 12;

      // Función helper para crear secciones con header dorado
      const createSectionHeader = (title, y) => {
        pdf.setFillColor(242, 186, 82); // Color dorado
        pdf.rect(margin, y - 6, pageWidth - (2 * margin), 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text(title, margin + 3, y);
        return y + 10;
      };

      // Función helper para crear filas de datos
      const createDataRow = (label, value, y, isLast = false) => {
        pdf.setTextColor(60, 60, 60);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(label, margin + 5, y);
        pdf.setFont(undefined, 'bold');
        pdf.text(value, pageWidth - margin - 5, y, { align: 'right' });
        
        if (!isLast) {
          pdf.setDrawColor(220, 220, 220);
          pdf.setLineWidth(0.1);
          pdf.line(margin + 5, y + 2, pageWidth - margin - 5, y + 2);
        }
        
        return y + 7;
      };

      // ESTADÍSTICAS GENERALES
      currentY = createSectionHeader("ESTADÍSTICAS GENERALES", currentY);
      currentY += 5;

      if (stats.summary) {
        const salesGrowth = stats.summary.salesGrowth >= 0 ? 
          `+${stats.summary.salesGrowth}%` : `${stats.summary.salesGrowth}%`;
        
        currentY = createDataRow("Ventas Total:", formatCurrency(stats.summary.totalSales), currentY);
        currentY = createDataRow("Cambio vs período anterior:", salesGrowth, currentY);
        currentY = createDataRow("Pedidos Completados:", stats.summary.totalOrders.toString(), currentY);
        currentY = createDataRow("Ticket Promedio:", formatCurrency(stats.summary.averageOrderValue), currentY, true);
      }

      currentY += 10;

      // RESUMEN DE VENTAS
      if (currentY > pageHeight - 80) {
        pdf.addPage();
        currentY = margin;
      }

      currentY = createSectionHeader("RESUMEN DE VENTAS", currentY);
      currentY += 5;

      if (stats.salesData && stats.salesData.length > 0) {
        const salesSummary = stats.salesData.reduce((acc, day) => ({
          totalSales: acc.totalSales + day.total,
          totalOrders: acc.totalOrders + day.orders
        }), { totalSales: 0, totalOrders: 0 });

        const avgDaily = salesSummary.totalSales / stats.salesData.length;
        const bestDay = stats.salesData.reduce((max, day) => 
          day.total > max.total ? day : max, stats.salesData[0]);

        currentY = createDataRow("Total:", formatCurrency(salesSummary.totalSales), currentY);
        currentY = createDataRow("Promedio por día:", formatCurrency(avgDaily), currentY);
        currentY = createDataRow("Mejor día:", formatCurrency(bestDay.total), currentY);
        currentY = createDataRow("Total pedidos:", salesSummary.totalOrders.toString(), currentY);
        currentY = createDataRow("Ticket promedio:", formatCurrency(salesSummary.totalSales / salesSummary.totalOrders), currentY, true);
      }

      currentY += 10;

      // HORAS MÁS CONCURRIDAS
      if (currentY > pageHeight - 60) {
        pdf.addPage();
        currentY = margin;
      }

      currentY = createSectionHeader("HORAS MÁS CONCURRIDAS", currentY);
      currentY += 5;

      if (stats.peakHours && stats.peakHours.length > 0) {
        const topHours = [...stats.peakHours]
          .sort((a, b) => b.ordersCount - a.ordersCount)
          .slice(0, 5);

        topHours.forEach((hour, index) => {
          const hourFormatted = formatHour(hour.hour);
          const isLast = index === topHours.length - 1;
          currentY = createDataRow(
            `${index + 1}. ${hourFormatted}`, 
            `${hour.ordersCount} órdenes`, 
            currentY, 
            isLast
          );
        });
      }

      currentY += 10;

      // PLATOS MÁS VENDIDOS
      if (currentY > pageHeight - 100) {
        pdf.addPage();
        currentY = margin;
      }

      currentY = createSectionHeader("PLATOS MÁS VENDIDOS", currentY);
      currentY += 5;

      if (stats.topDishes && stats.topDishes.length > 0) {
        const totalRevenue = stats.topDishes.reduce((sum, dish) => sum + dish.totalRevenue, 0);

        stats.topDishes.forEach((dish, index) => {
          if (currentY > pageHeight - 25) {
            pdf.addPage();
            currentY = margin + 10;
          }

          const percentage = ((dish.totalRevenue / totalRevenue) * 100).toFixed(1);
          const dishInfo = `${dish.totalQuantity} uds. | ${percentage}%`;
          const isLast = index === stats.topDishes.length - 1;
          
          currentY = createDataRow(
            `${index + 1}. ${dish.dishName}`, 
            formatCurrency(dish.totalRevenue), 
            currentY
          );
          
          pdf.setTextColor(120, 120, 120);
          pdf.setFontSize(8);
          pdf.setFont(undefined, 'normal');
          pdf.text(dishInfo, margin + 15, currentY - 2);
          
          if (!isLast) {
            pdf.setDrawColor(220, 220, 220);
            pdf.setLineWidth(0.1);
            pdf.line(margin + 5, currentY + 1, pageWidth - margin - 5, currentY + 1);
          }
          
          currentY += 5;
        });
      }

      // PIE DE PÁGINA
      const pageCount = pdf.internal.getNumberOfPages();
      pdf.setFillColor(30, 3, 66); // Color primary de POTETOS
      
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.rect(0, pageHeight - 10, pageWidth, 10, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text(
          `Restaurante POTETOS - Página ${i} de ${pageCount}`, 
          pageWidth / 2, 
          pageHeight - 4, 
          { align: 'center' }
        );
      }

      const fileName = `Informe_POTETOS_${periodNames[period].replace(/ /g, "_")}_${new Date().toLocaleDateString("es-CO").replace(/\//g, "-")}.pdf`;
      pdf.save(fileName);

      document.body.removeChild(loadingToast);

      const successToast = document.createElement("div");
      successToast.className = "fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50";
      successToast.style.backgroundColor = "#10b981";
      successToast.style.color = "#ffffff";
      successToast.textContent = "Informe descargado exitosamente";
      document.body.appendChild(successToast);
      setTimeout(() => {
        document.body.removeChild(successToast);
      }, 3000);

    } catch (error) {
      console.error("Error generating PDF:", error);
      
      const loadingToasts = document.querySelectorAll(".fixed.top-4.right-4");
      loadingToasts.forEach(toast => {
        if (toast.textContent.includes("Generando")) {
           try { document.body.removeChild(toast); } catch(e) {}
        }
      });

      alert("Error al generar el informe. Por favor, intenta de nuevo.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Panel de Estadísticas
            </h2>
            <p className="text-gray-600">
              Análisis de rendimiento del restaurante POTETOS
            </p>
          </div>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition shadow-lg"
          >
            <Download size={20} />
            Descargar PDF
          </button>
        </div>

        {/* Period Filter */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setPeriod("day")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              period === "day"
                ? "bg-primary text-secondary"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setPeriod("week")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              period === "week"
                ? "bg-primary text-secondary"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Última Semana
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              period === "month"
                ? "bg-primary text-secondary"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Último Mes
          </button>
          <button
            onClick={() => setPeriod("year")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              period === "year"
                ? "bg-primary text-secondary"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Último Año
          </button>
        </div>

        {/* Charts Grid */}
        <div id="stats-content">
        {stats && (
          <>
            {/* Summary Cards */}
            {stats.summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                  <p className="text-sm font-medium opacity-90 mb-2">
                    Ventas Totales
                  </p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(stats.summary.totalSales)}
                  </p>
                  <p className="text-sm mt-2 opacity-80">
                    {stats.summary.salesGrowth >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(stats.summary.salesGrowth)}% vs período anterior
                  </p>
                </div>
                <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                  <p className="text-sm font-medium opacity-90 mb-2">
                    Total Órdenes
                  </p>
                  <p className="text-3xl font-bold">
                    {stats.summary.totalOrders}
                  </p>
                  <p className="text-sm mt-2 opacity-80">Órdenes pagadas</p>
                </div>
                <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                  <p className="text-sm font-medium opacity-90 mb-2">
                    Ticket Promedio
                  </p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(stats.summary.averageOrderValue)}
                  </p>
                  <p className="text-sm mt-2 opacity-80">Por orden</p>
                </div>
                <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
                  <p className="text-sm font-medium opacity-90 mb-2">
                    Platos Vendidos
                  </p>
                  <p className="text-3xl font-bold">
                    {stats.topDishes.reduce(
                      (sum, dish) => sum + dish.totalQuantity,
                      0
                    )}
                  </p>
                  <p className="text-sm mt-2 opacity-80">Total de platos</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Sales Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Balance de Ventas
                </h3>
                {stats.salesData && stats.salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString("es-CO", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                      />
                      {/* Eje Y izquierdo - Ventas */}
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          `$${(value / 1000).toFixed(0)}k`
                        }
                        label={{
                          value: "Ventas (COP)",
                          angle: -90,
                          position: "insideLeft",
                          style: {
                            fontSize: 12,
                            fill: "#1E0342",
                            fontWeight: 600,
                          },
                        }}
                      />
                      {/* Eje Y derecho - Órdenes */}
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12 }}
                        label={{
                          value: "Órdenes",
                          angle: 90,
                          position: "insideRight",
                          style: {
                            fontSize: 12,
                            fill: "#F5E050",
                            fontWeight: 600,
                          },
                        }}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "Ventas" ? formatCurrency(value) : value,
                          name,
                        ]}
                        labelFormatter={(date) =>
                          new Date(date).toLocaleDateString("es-CO")
                        }
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="total"
                        stroke="#1E0342"
                        strokeWidth={2}
                        name="Ventas"
                        dot={{ fill: "#1E0342", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        stroke="#F5E050"
                        strokeWidth={2}
                        name="Órdenes"
                        dot={{ fill: "#F5E050", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <p>No hay datos de ventas para este período</p>
                  </div>
                )}
              </div>

              {/* Peak Hours Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Horas Más Concurridas
                </h3>
                {stats.peakHours && stats.peakHours.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.peakHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatHour}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "totalSales" ? formatCurrency(value) : value,
                          name === "totalSales" ? "Ventas" : "Órdenes",
                        ]}
                        labelFormatter={formatHour}
                      />
                      <Legend />
                      <Bar
                        dataKey="ordersCount"
                        fill="#1E0342"
                        name="Órdenes"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <p>No hay datos de horas concurridas para este período</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Dishes */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Platos Más Vendidos
              </h3>
              {stats.topDishes && stats.topDishes.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Chart */}
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={stats.topDishes.slice(0, 5)}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis
                        dataKey="dishName"
                        type="category"
                        tick={{ fontSize: 12 }}
                        width={100}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "totalRevenue"
                            ? formatCurrency(value)
                            : value,
                          name === "totalRevenue" ? "Ingresos" : "Cantidad",
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="totalQuantity"
                        fill="#1E0342"
                        name="Cantidad Vendida"
                        radius={[0, 8, 8, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Table */}
                  <div className="overflow-auto max-h-[300px]">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Plato
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                            Cantidad
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                            Ingresos
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stats.topDishes.map((dish, index) => (
                          <tr key={dish.dishId} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div
                                  className="w-2 h-2 rounded-full mr-3"
                                  style={{
                                    backgroundColor:
                                      COLORS[index % COLORS.length],
                                  }}
                                ></div>
                                <span className="text-sm font-medium text-gray-900">
                                  {dish.dishName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-700">
                              {dish.totalQuantity}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              {formatCurrency(dish.totalRevenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <p>No hay datos de platos vendidos para este período</p>
                </div>
              )}
            </div>
          </>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
}
