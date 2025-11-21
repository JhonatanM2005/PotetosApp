import { useEffect, useState } from "react";
import { AlertCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SessionClosedModal({ isOpen, reason, onClose }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          navigate("/login?remote_logout=true", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, navigate, onClose]);

  if (!isOpen) return null;

  const getMessage = () => {
    switch (reason) {
      case "new_login":
        return {
          title: "🔒 Sesión Cerrada",
          message:
            "Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo o navegador.",
          icon: <LogOut className="w-16 h-16 text-yellow-500" />,
        };
      case "session_replaced":
        return {
          title: "🔄 Sesión Reemplazada",
          message: "Alguien más inició sesión con tu cuenta desde otro lugar.",
          icon: <AlertCircle className="w-16 h-16 text-orange-500" />,
        };
      default:
        return {
          title: "⚠️ Sesión Terminada",
          message:
            "Tu sesión ha finalizado. Por favor, inicia sesión nuevamente.",
          icon: <AlertCircle className="w-16 h-16 text-red-500" />,
        };
    }
  };

  const { title, message, icon } = getMessage();

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in">
        {/* Header con gradiente */}
        <div className="bg-linear-to-r from-primary to-secondary p-6">
          <div className="flex justify-center mb-4">
            <div className="bg-white/10 backdrop-blur-md rounded-full p-4">
              {icon}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center">{title}</h2>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <p className="text-gray-700 text-center mb-6 text-lg">{message}</p>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 text-center">
              Redirigiendo al inicio de sesión en{" "}
              <span className="font-bold text-primary text-xl">
                {countdown}
              </span>{" "}
              segundo{countdown !== 1 ? "s" : ""}...
            </p>
          </div>

          <button
            onClick={() => {
              onClose();
              navigate("/login?remote_logout=true", { replace: true });
            }}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <LogOut className="w-5 h-5" />
            Ir a Iniciar Sesión Ahora
          </button>
        </div>
      </div>
    </div>
  );
}
