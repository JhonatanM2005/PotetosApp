import { useAuthStore } from "../../store/authStore";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import ModuleCard from "../../components/common/ModuleCard";
import InfoCard from "../../components/common/InfoCard";
import { useState, useEffect } from "react";
import { dashboardService } from "../../services";
import {
  BarChart3,
  ShoppingCart,
  UtensilsCrossed,
  Users,
  ChefHat,
  LayoutGrid,
  ClipboardList,
  Settings,
  DollarSign,
  Clock,
  FileText,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayStats = async () => {
      if (user?.role === "admin") {
        try {
          const data = await dashboardService.getTodayStats();
          setTodayStats(data);
        } catch (error) {
          console.error("Error fetching today stats:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTodayStats();
  }, [user?.role]);

  // Configuración de cards según el rol
  const getAvailableCards = () => {
    const allCards = [
      {
        id: "stats",
        title: "Estadísticas",
        description: "Análisis de ventas y rendimiento",
        icon: BarChart3,
        path: "/dashboard/stats",
        iconBg: "bg-primary",
        roles: ["admin"],
      },
      {
        id: "orders",
        title: "Órdenes",
        description: "Gestiona los pedidos del restaurante",
        icon: ShoppingCart,
        path: "/dashboard/orders",
        iconBg: "bg-primary",
        roles: ["admin", "mesero"],
      },
      {
        id: "menu",
        title: "Menú",
        description: "Gestiona los platos del restaurante",
        icon: UtensilsCrossed,
        path: "/dashboard/menu",
        iconBg: "bg-primary",
        roles: ["admin"],
      },
      {
        id: "categories",
        title: "Categorías",
        description: "Organiza las categorías de platos",
        icon: LayoutGrid,
        path: "/dashboard/categories",
        iconBg: "bg-primary",
        roles: ["admin"],
      },
      {
        id: "kitchen",
        title: "Cocina",
        description: "Gestiona los pedidos en preparación",
        icon: ChefHat,
        path: "/dashboard/kitchen",
        iconBg: "bg-primary",
        roles: ["chef"],
      },
      {
        id: "cashier",
        title: "Caja",
        description: "Procesa pagos y gestiona cobros",
        icon: DollarSign,
        path: "/dashboard/cashier",
        iconBg: "bg-primary",
        roles: ["cajero", "admin"],
      },
      {
        id: "reports",
        title: "Reportes",
        description: "Reportes de caja y cierre diario",
        icon: FileText,
        path: "/dashboard/cashier/reports",
        iconBg: "bg-primary",
        roles: ["cajero", "admin"],
      },
      {
        id: "tables",
        title: "Mesas",
        description: "Administra las mesas del restaurante",
        icon: ClipboardList,
        path: "/dashboard/tables",
        iconBg: "bg-primary",
        roles: ["admin", "mesero"],
      },
      {
        id: "users",
        title: "Usuarios",
        description: "Gestiona los usuarios del sistema",
        icon: Users,
        path: "/dashboard/users",
        iconBg: "bg-primary",
        roles: ["admin"],
      },
      {
        id: "settings",
        title: "Configuración",
        description: "Ajustes del sistema y perfil",
        icon: Settings,
        path: "/dashboard/settings",
        iconBg: "bg-primary",
        roles: ["admin", "mesero", "chef", "cajero"],
      },
    ];

    // Filtrar cards según el rol del usuario
    return allCards.filter((card) =>
      card.roles.includes(user?.role || "mesero")
    );
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: "Administrador",
      mesero: "Mesero",
      chef: "Chef",
      cajero: "Cajero",
    };
    return roleNames[role] || role;
  };

  const getWelcomeMessage = () => {
    const messages = {
      admin: "¡Bienvenido al panel de administración!",
      mesero: "¡Bienvenido! Listo para tomar pedidos",
      chef: "¡Bienvenido a la cocina! A preparar platos deliciosos",
      cajero: "¡Bienvenido a la caja! Gestiona los pagos del día",
    };
    return messages[user?.role] || "¡Bienvenido al sistema POTETOS!";
  };

  const availableCards = getAvailableCards();

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            BIENVENIDOS AL SISTEMA POTETOS
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            {getWelcomeMessage()}
          </p>
        </div>

        {/* User Info Section */}
        <div className="bg-primary rounded-2xl shadow-lg p-6 sm:p-8 mb-8 sm:mb-10 md:mb-12">
          <h3 className="text-lg sm:text-xl font-bold text-secondary mb-4 sm:mb-6">
            Información del Usuario
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <InfoCard label="Rol" value={getRoleDisplayName(user?.role)} />
            <InfoCard label="Nombre" value={user?.name || "Usuario"} />
            <InfoCard
              label="Email"
              value={user?.email || "usuario@potetos.com"}
            />
          </div>
        </div>

        {/* Quick Stats - Solo para admin*/}
        {user?.role === "admin" && (
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-4 sm:mb-6">
              Resumen Rápido
            </h3>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-200 animate-pulse rounded-2xl h-32"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                  icon={DollarSign}
                  title="Ventas Hoy"
                  value={
                    todayStats
                      ? `$${todayStats.totalSales.toLocaleString()}`
                      : "$0"
                  }
                  subtitle={`${todayStats?.ordersCount || 0} órdenes`}
                  gradient="from-primary to-primary/80"
                />
                <StatCard
                  icon={ShoppingCart}
                  title="Órdenes Activas"
                  value={todayStats?.activeOrders?.toString() || "0"}
                  subtitle="En proceso"
                  gradient="from-secondary to-yellow-500"
                />
                <StatCard
                  icon={UtensilsCrossed}
                  title="Platos Vendidos"
                  value={todayStats?.dishesServed?.toString() || "0"}
                  subtitle="Platos de hoy"
                  gradient="from-primary to-primary/80"
                />
                <StatCard
                  icon={Clock}
                  title="Ticket Promedio"
                  value={
                    todayStats
                      ? `$${Math.round(
                          todayStats.averageOrderValue
                        ).toLocaleString()}`
                      : "$0"
                  }
                  subtitle="Por orden"
                  gradient="from-secondary to-yellow-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Module Cards Grid */}
        <div className="mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-primary mb-4 sm:mb-6">
            Módulos Disponibles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {availableCards.map((card) => (
              <ModuleCard
                key={card.id}
                icon={card.icon}
                title={card.title}
                description={card.description}
                path={card.path}
                iconBg={card.iconBg}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
