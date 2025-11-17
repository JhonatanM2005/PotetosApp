import { useState, useRef } from "react";
import imgChef from "@/assets/images/chef-manos.png";
import toast from "react-hot-toast";

export default function VerifyCode() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    // Solo permite números
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Retroceder al input anterior con Backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      toast.error("Por favor ingresa el código completo");
      return;
    }
    // Aquí iría la lógica para verificar el código
    toast.success("Código verificado correctamente");
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
              VERIFICAR CÓDIGO
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Input - 6 circles */}
            <div className="flex justify-center gap-2 md:gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 md:w-14 md:h-14 bg-[#272159] rounded-full text-center text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                  required
                />
              ))}
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
                Continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
