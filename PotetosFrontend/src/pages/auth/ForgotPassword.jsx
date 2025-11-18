import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import imgChef from "@/assets/images/chef-manos.png";
import toast from "react-hot-toast";
import { authService } from "@/services";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(email);
      toast.success("Código enviado a tu correo");

      // Redirigir a la página de verificación con el email
      navigate("/verify-code", { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al enviar el código");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico primero");
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(email);
      toast.success("Código reenviado a tu correo");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al reenviar el código"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={imgChef}
          alt="Chef profesional"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-linear-to-r from-primary to-transparent" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Form Card */}
        <div className="bg-primary/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-primary">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
              RECUPERAR CONTRASEÑA
            </h1>
            <p className="text-white text-sm">Correo electrónico</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="bg-[#272159] rounded-full px-6 py-4">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="w-full px-2 py-2 bg-transparent text-white text-center placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Reenviar código link */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading || !email}
                className="text-sm text-white hover:text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reenviar código
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full max-w-xs px-8 py-3 bg-secondary text-primary font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Enviar código"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
