import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            BIENVENIDOS AL SISTEMA POTETOS
          </h2>
        </div>

        {/* Info Section */}
        <div className="bg-primary rounded-2xl shadow-lg p-8 mb-12">
          <h3 className="text-xl font-bold text-secondary mb-6">
            INFORMACIÓN DEL SISTEMA
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#272159] rounded-2xl p-6">
              <p className="text-sm text-gray-300 mb-2">Rol:</p>
              <p className="text-lg font-semibold text-white capitalize">
                {user?.role || "Admin"}
              </p>
            </div>
            <div className="bg-[#272159] rounded-2xl p-6">
              <p className="text-sm text-gray-300 mb-2">Email:</p>
              <p className="text-lg font-semibold text-white break-all">
                {user?.email || "admin@potetos.com"}
              </p>
            </div>
            <div className="bg-[#272159] rounded-2xl p-6">
              <p className="text-sm text-gray-300 mb-2">Usuario ID:</p>
              <p className="text-lg font-semibold text-white">
                {user?.id || "001"}
              </p>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card: Órdenes */}
          <div className="bg-secondary rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-2">ÓRDENES</h3>
            <p className="text-primary text-sm mb-6">
              Gestiona los pedidos del restaurante
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="w-full bg-primary text-secondary px-6 py-3 rounded-full font-bold hover:opacity-90 transition"
            >
              Ir a órdenes
            </button>
          </div>

          {/* Card: Menú */}
          <div className="bg-secondary rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-2">MENÚ</h3>
            <p className="text-primary text-sm mb-6">
              Gestiona los platos del restaurante
            </p>
            <button
              onClick={() => navigate("/dashboard/menu")}
              className="w-full bg-primary text-secondary px-6 py-3 rounded-full font-bold hover:opacity-90 transition"
            >
              Ir a menú
            </button>
          </div>

          {/* Card: Usuarios - Solo para Admin */}
          {user?.role === "admin" && (
            <div className="bg-secondary rounded-2xl shadow-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-primary mb-2">USUARIOS</h3>
              <p className="text-primary text-sm mb-6">
                Gestiona los pedidos del restaurante
              </p>
              <button
                onClick={() => navigate("/users")}
                className="w-full bg-primary text-secondary px-6 py-3 rounded-full font-bold hover:opacity-90 transition"
              >
                Ir a órdenes
              </button>
            </div>
          )}

          {/* Card: Cocina - Solo para Chef */}
          {user?.role === "chef" && (
            <div className="bg-secondary rounded-2xl shadow-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-primary mb-2">COCINA</h3>
              <p className="text-primary text-sm mb-6">
                Gestiona los pedidos en preparación
              </p>
              <button
                onClick={() => navigate("/kitchen")}
                className="w-full bg-primary text-secondary px-6 py-3 rounded-full font-bold hover:opacity-90 transition"
              >
                Ir a cocina
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
