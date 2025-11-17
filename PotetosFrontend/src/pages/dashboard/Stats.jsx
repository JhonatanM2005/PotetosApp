import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import api from "../../services/api";
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
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Panel de Estadísticas
          </h2>
          <p className="text-gray-600">
            Análisis de rendimiento del restaurante POTETOS
          </p>
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
    </DashboardLayout>
  );
}
