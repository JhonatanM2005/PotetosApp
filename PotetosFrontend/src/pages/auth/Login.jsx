import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "admin@potetos.com",
    password: "admin123",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success("¡Bienvenido!");
      navigate("/dashboard");
    } else {
      toast.error(result.error || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
        }}
      />

      {/* Logo Corner */}
      <div className="absolute top-8 right-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full shadow-lg">
          <span className="text-3xl">🥔</span>
        </div>
      </div>

      {/* Header Top Left */}
      <div className="absolute top-8 left-8">
        <h1 className="text-white text-3xl font-bold">Potetos</h1>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Title */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-2">INICIAR SESIÓN</h2>
          <div className="h-1 w-24 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* Form Card */}
        <div className="bg-linear-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-700 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-3.5 text-orange-400"
                  size={20}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-600 bg-slate-700 text-white placeholder-gray-400 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-3.5 text-orange-400"
                  size={20}
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-600 bg-slate-700 text-white placeholder-gray-400 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <LogIn size={20} />
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-600">
            <p className="text-xs font-semibold text-gray-400 mb-4 text-center">
              CREDENCIALES DE PRUEBA
            </p>
            <div className="space-y-3">
              <div className="bg-blue-950 bg-opacity-50 p-3 rounded-lg border border-blue-700">
                <p className="text-xs font-semibold text-blue-200">
                  👤 Administrador
                </p>
                <p className="text-xs text-blue-300 font-mono">
                  admin@potetos.com
                </p>
                <p className="text-xs text-blue-300 font-mono">admin123</p>
              </div>
              <div className="bg-green-950 bg-opacity-50 p-3 rounded-lg border border-green-700">
                <p className="text-xs font-semibold text-green-200">
                  🍽️ Mesero
                </p>
                <p className="text-xs text-green-300 font-mono">
                  mesero@potetos.com
                </p>
                <p className="text-xs text-green-300 font-mono">mesero123</p>
              </div>
              <div className="bg-red-950 bg-opacity-50 p-3 rounded-lg border border-red-700">
                <p className="text-xs font-semibold text-red-200">👨‍🍳 Chef</p>
                <p className="text-xs text-red-300 font-mono">
                  chef@potetos.com
                </p>
                <p className="text-xs text-red-300 font-mono">chef123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2025 POTETOS. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
