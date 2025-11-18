import { Check, X } from "lucide-react";

const PasswordStrengthIndicator = ({ password, showRequirements = true }) => {
  const requirements = [
    {
      id: "length",
      label: "Mínimo 8 caracteres",
      test: (pwd) => pwd.length >= 8,
    },
    {
      id: "uppercase",
      label: "Al menos una letra mayúscula (A-Z)",
      test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
      id: "lowercase",
      label: "Al menos una letra minúscula (a-z)",
      test: (pwd) => /[a-z]/.test(pwd),
    },
    {
      id: "number",
      label: "Al menos un número (0-9)",
      test: (pwd) => /[0-9]/.test(pwd),
    },
    {
      id: "special",
      label: "Al menos un carácter especial (!@#$%^&*...)",
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>_\-]/.test(pwd),
    },
  ];

  const metRequirements = requirements.filter((req) => req.test(password));
  const strength = (metRequirements.length / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strength === 0) return "bg-gray-200";
    if (strength < 40) return "bg-red-500";
    if (strength < 60) return "bg-orange-500";
    if (strength < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strength === 0) return "";
    if (strength < 40) return "Muy débil";
    if (strength < 60) return "Débil";
    if (strength < 80) return "Media";
    return "Fuerte";
  };

  const isValid = metRequirements.length === requirements.length;

  return (
    <div className="space-y-3">
      {/* Barra de progreso */}
      {password && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-600">
              Seguridad de la contraseña
            </span>
            <span
              className={`text-xs font-bold ${
                strength < 40
                  ? "text-red-600"
                  : strength < 60
                  ? "text-orange-600"
                  : strength < 80
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {getStrengthLabel()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>
      )}

      {/* Lista de requisitos */}
      {showRequirements && password && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="text-xs font-bold text-gray-700 mb-3">
            Requisitos de la contraseña:
          </p>
          {requirements.map((req) => {
            const isMet = req.test(password);
            return (
              <div key={req.id} className="flex items-center gap-2">
                <div
                  className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                    isMet
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isMet ? <Check size={14} /> : <X size={14} />}
                </div>
                <span
                  className={`text-sm ${
                    isMet ? "text-green-700 font-medium" : "text-gray-600"
                  }`}
                >
                  {req.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
