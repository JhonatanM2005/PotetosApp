import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger", // "danger" | "warning" | "info"
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          bg: "bg-red-50",
          icon: "text-red-600",
          button: "bg-red-600 hover:bg-red-700",
        };
      case "warning":
        return {
          bg: "bg-orange-50",
          icon: "text-orange-600",
          button: "bg-orange-600 hover:bg-orange-700",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          icon: "text-blue-600",
          button: "bg-blue-600 hover:bg-blue-700",
        };
      default:
        return {
          bg: "bg-red-50",
          icon: "text-red-600",
          button: "bg-red-600 hover:bg-red-700",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header con icono */}
        <div className={`${styles.bg} p-6 flex items-center gap-4`}>
          <div className={`${styles.icon} bg-white rounded-full p-3 shadow-md`}>
            <AlertTriangle size={32} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mensaje */}
        <div className="p-6">
          <p className="text-gray-700 text-base leading-relaxed">{message}</p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-6 py-3 ${styles.button} text-white rounded-xl font-bold transition shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
