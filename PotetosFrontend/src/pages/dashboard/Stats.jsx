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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Sales Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Balance de Ventas
                </h3>
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
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "total" ? formatCurrency(value) : value,
                        name === "total" ? "Ventas" : "Órdenes",
                      ]}
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString("es-CO")
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#1E0342"
                      strokeWidth={2}
                      name="Ventas"
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#F5E050"
                      strokeWidth={2}
                      name="Órdenes"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Peak Hours Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Horas Más Concurridas
                </h3>
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
              </div>
            </div>

            {/* Top Dishes */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Platos Más Vendidos
              </h3>
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
                        name === "totalRevenue" ? formatCurrency(value) : value,
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
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
