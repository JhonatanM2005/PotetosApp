import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ConfirmModal from "../../components/common/ConfirmModal";
import { reservationService } from "../../services";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

export default function ReservationsManagement() {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState("all");
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    today: 0,
    upcoming: 0,
  });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  useEffect(() => {
    fetchReservations();
    fetchStats();
  }, [dateFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      let data;

      if (dateFilter === "today") {
        data = await reservationService.getToday();
      } else if (dateFilter === "upcoming") {
        data = await reservationService.getUpcoming();
      } else {
        data = await reservationService.getAll();
      }

      setReservations(data.data || []);
    } catch (error) {
      toast.error("Error al cargar reservas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await reservationService.getStats();
      setStats(data.data || {});
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await reservationService.updateStatus(id, newStatus);
      toast.success("Estado actualizado correctamente");
      fetchReservations();
      fetchStats();
    } catch (error) {
      toast.error("Error al actualizar estado");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await reservationService.delete(id);
      toast.success("Reserva eliminada correctamente");
      fetchReservations();
      fetchStats();
    } catch (error) {
      toast.error("Error al eliminar reserva");
      console.error(error);
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const matchesStatus = !statusFilter || reservation.status === statusFilter;
    const matchesSearch =
      reservation.customer_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reservation.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusInfo = (status) => {
    const statuses = {
      pending: {
        name: "Pendiente",
        icon: AlertCircle,
        color: "bg-yellow-100 text-yellow-800",
        badge: "bg-yellow-500",
      },
      confirmed: {
        name: "Confirmada",
        icon: CheckCircle,
        color: "bg-green-100 text-green-800",
        badge: "bg-green-500",
      },
      cancelled: {
        name: "Cancelada",
        icon: XCircle,
        color: "bg-red-100 text-red-800",
        badge: "bg-red-500",
      },
      completed: {
        name: "Completada",
        icon: UserCheck,
        color: "bg-blue-100 text-blue-800",
        badge: "bg-blue-500",
      },
      no_show: {
        name: "No asistió",
        icon: UserX,
        color: "bg-gray-100 text-gray-800",
        badge: "bg-gray-500",
      },
    };
    return (
      statuses[status] || {
        name: status,
        icon: AlertCircle,
        color: "bg-gray-100 text-gray-800",
        badge: "bg-gray-500",
      }
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            GESTIÓN DE RESERVAS
          </h1>
          <p className="text-gray-600 mt-2">
            Administra las reservas del restaurante
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-semibold">
                  Pendientes
                </p>
                <p className="text-2xl font-bold text-yellow-800">
                  {stats.pending}
                </p>
              </div>
              <AlertCircle className="text-yellow-500" size={32} />
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold">
                  Confirmadas
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {stats.confirmed}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold">Hoy</p>
                <p className="text-2xl font-bold text-blue-800">
                  {stats.today}
                </p>
              </div>
              <Calendar className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold">
                  Próximas
                </p>
                <p className="text-2xl font-bold text-purple-800">
                  {stats.upcoming}
                </p>
              </div>
              <Clock className="text-purple-500" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-6 md:mb-8">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary outline-none text-sm md:text-base"
            />
          </div>

          {/* Date Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setDateFilter("all")}
              className={`px-3 md:px-4 py-2 rounded-full font-semibold transition text-sm md:text-base ${
                dateFilter === "all"
                  ? "bg-secondary text-primary"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setDateFilter("today")}
              className={`px-3 md:px-4 py-2 rounded-full font-semibold transition text-sm md:text-base flex items-center gap-2 ${
                dateFilter === "today"
                  ? "bg-secondary text-primary"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <Calendar size={16} />
              Hoy
            </button>
            <button
              onClick={() => setDateFilter("upcoming")}
              className={`px-3 md:px-4 py-2 rounded-full font-semibold transition text-sm md:text-base flex items-center gap-2 ${
                dateFilter === "upcoming"
                  ? "bg-secondary text-primary"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <Clock size={16} />
              Próximas
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter(null)}
              className={`px-3 md:px-4 py-2 rounded-full font-semibold transition text-sm md:text-base ${
                statusFilter === null
                  ? "bg-primary text-secondary"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Todos los estados
            </button>
            {["pending", "confirmed", "cancelled", "completed", "no_show"].map(
              (status) => {
                const statusInfo = getStatusInfo(status);
                const Icon = statusInfo.icon;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 md:px-4 py-2 rounded-full font-semibold transition text-sm md:text-base flex items-center gap-2 ${
                      statusFilter === status
                        ? "bg-primary text-secondary"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    <Icon size={16} />
                    {statusInfo.name}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base">
                    Cliente
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base">
                    Contacto
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base">
                    Fecha y Hora
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base">
                    Personas
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base">
                    Estado
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-8 text-gray-500 text-sm md:text-base"
                    >
                      Cargando...
                    </td>
                  </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-8 text-gray-500 text-sm md:text-base"
                    >
                      No hay reservas disponibles
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => {
                    const statusInfo = getStatusInfo(reservation.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={reservation.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-2">
                            <User size={18} className="text-gray-400" />
                            <div>
                              <p className="font-semibold text-sm md:text-base">
                                {reservation.customer_name}
                              </p>
                              {reservation.notes && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {reservation.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail size={14} className="text-gray-400" />
                              <span className="text-gray-600">
                                {reservation.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone size={14} className="text-gray-400" />
                              <span className="text-gray-600">
                                {reservation.phone}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="font-semibold">
                                {formatDate(reservation.reservation_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={14} className="text-gray-400" />
                              <span className="text-gray-600">
                                {formatTime(reservation.reservation_time)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-gray-400" />
                            <span className="font-semibold">
                              {reservation.number_of_people}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <select
                            value={reservation.status}
                            onChange={(e) =>
                              handleStatusChange(reservation.id, e.target.value)
                            }
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit cursor-pointer ${statusInfo.color} border-2 border-transparent hover:border-gray-300 transition`}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="confirmed">Confirmada</option>
                            <option value="cancelled">Cancelada</option>
                            <option value="completed">Completada</option>
                            <option value="no_show">No asistió</option>
                          </select>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex justify-center gap-2">
                            {user?.role === "admin" && (
                              <button
                                onClick={() =>
                                  setConfirmDelete({
                                    show: true,
                                    id: reservation.id,
                                  })
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirm Delete Modal */}
        <ConfirmModal
          isOpen={confirmDelete.show}
          onClose={() => setConfirmDelete({ show: false, id: null })}
          onConfirm={() => handleDelete(confirmDelete.id)}
          title="Confirmar eliminación"
          message="¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer."
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
          type="danger"
        />
      </div>
    </DashboardLayout>
  );
}
