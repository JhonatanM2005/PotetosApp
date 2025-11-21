import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import imgChef from "@/assets/images/chef-manos.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loading } = useAuthStore();
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Mostrar mensaje si la sesión expiró por inactividad o fue cerrada remotamente
  useEffect(() => {
    if (searchParams.get("timeout") === "true") {
      toast.error("Tu sesión ha expirado por inactividad", {
        duration: 5000,
        icon: "⏱️",
      });
    } else if (searchParams.get("remote_logout") === "true") {
      toast.error(
        "Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo",
        {
          duration: 6000,
          icon: "🔒",
        }
      );
    }
  }, [searchParams]);

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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center sm:justify-end p-4 sm:pr-8 md:pr-16 lg:pr-24">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={imgChef}
          alt="Chef profesional"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-linear-to-r from-primary to-transparent to" />
      </div>

      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl relative z-10">
        {/* Form Card */}
        <div className="p-6 sm:p-8">
          <div className="text-center sm:text-left mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary mb-2">
              INICIAR SESIÓN
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="bg-primary rounded-full px-4 py-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-1 pl-2"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                className="w-full px-4 py-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Password Input */}
            <div className="bg-primary rounded-full px-4 py-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-1 pl-2"
              >
                Contraseña
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="•••••••••••"
                  required
                  className="w-full px-4 py-1 bg-transparent text-white placeholder-gray-400 focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 text-white/70 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-left px-2">
              <Link
                to="/forgot-password"
                className="text-sm text-white hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-lg sm:text-xl bg-secondary text-primary font-bold rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity mt-4 sm:mt-6 flex items-center justify-center gap-2"
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
