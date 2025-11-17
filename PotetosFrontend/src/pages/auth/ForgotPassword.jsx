import { useState } from "react";
import { Mail } from "lucide-react";
import imgChef from "@/assets/images/chef-manos.png";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el código
    toast.success("Código enviado a tu correo");
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
                className="text-sm text-white hover:text-secondary transition-colors"
              >
                Reenviar código
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full max-w-xs px-8 py-3 bg-secondary text-primary font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg"
              >
                Enviar código
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
