import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import imgChef from "@/assets/images/chef-manos.png";
import toast from "react-hot-toast";
import { authService } from "@/services";
import PasswordStrengthIndicator from "@/components/common/PasswordStrengthIndicator";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = location.state?.resetToken;
  const email = location.state?.email;

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  // Redirigir si no hay token
  if (!resetToken) {
    navigate("/forgot-password");
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    // Validación de contraseña segura
    const passwordRegex = {
      length: formData.newPassword.length >= 8,
      uppercase: /[A-Z]/.test(formData.newPassword),
      lowercase: /[a-z]/.test(formData.newPassword),
      number: /[0-9]/.test(formData.newPassword),
      special: /[!@#$%^&*(),.?":{}|<>_\-]/.test(formData.newPassword),
    };

    const isValid = Object.values(passwordRegex).every((v) => v);
    if (!isValid) {
      toast.error("La contraseña no cumple con los requisitos de seguridad");
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(resetToken, formData.newPassword);
      toast.success("Contraseña cambiada exitosamente");

      // Redirigir al login después de cambiar la contraseña
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al cambiar la contraseña";
      const errors = error.response?.data?.errors;
      
      if (errors && errors.length > 0) {
        errors.forEach((err) => toast.error(err));
      } else {
        toast.error(errorMessage);
      }
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
              NUEVA CONTRASEÑA
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nueva contraseña Input */}
            <div className="bg-[#272159] rounded-full px-6 py-4">
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Nueva contraseña"
                required
                className="w-full px-2 py-2 bg-transparent text-white text-center placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Confirmar contraseña Input */}
            <div className="bg-[#272159] rounded-full px-6 py-4">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmar contraseña"
                required
                className="w-full px-2 py-2 bg-transparent text-white text-center placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="bg-white/95 rounded-2xl p-4">
                <PasswordStrengthIndicator
                  password={formData.newPassword}
                  showRequirements={true}
                />
              </div>
            )}

            {/* Match indicator */}
            {formData.confirmPassword && (
              <div className="text-center">
                {formData.newPassword === formData.confirmPassword ? (
                  <p className="text-green-400 text-sm font-semibold">
                    ✓ Las contraseñas coinciden
                  </p>
                ) : (
                  <p className="text-red-400 text-sm font-semibold">
                    ✗ Las contraseñas no coinciden
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full max-w-xs px-8 py-3 bg-secondary text-primary font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Cambiando..." : "Cambiar contraseña"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
