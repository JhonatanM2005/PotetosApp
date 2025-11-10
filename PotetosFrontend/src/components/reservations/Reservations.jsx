import { useState } from "react";
import { Calendar, Clock, Users, Phone, Mail, User } from "lucide-react";
import imgHero from "@/assets/images/papas-fritas-crujientes-mano.png";

const dateTimeInputStyles = `
  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator {
    display: none;
  }
  
  input[type="date"],
  input[type="time"] {
    color-scheme: dark;
  }
`;

// Componente reutilizable para campos del formulario
const FormField = ({
  icon: Icon,
  label,
  type,
  id,
  name,
  value,
  onChange,
  placeholder,
  min,
  max,
}) => (
  <div className="bg-[#272159] rounded-full p-4">
    <label htmlFor={id} className="block text-sm font-medium text-white mb-0">
      {label}
    </label>
    <div className="relative">
      <Icon
        className="absolute left-3 top-3.5 text-secondary pointer-events-none"
        size={20}
      />
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        placeholder={placeholder}
        required
        className="w-full pl-10 pr-4 py-2 bg-transparent text-white focus:outline-none"
      />
    </div>
  </div>
);

export default function Reservations() {
  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    personas: "",
    telefono: "",
    nombre: "",
    correo: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Reserva confirmada:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        fecha: "",
        hora: "",
        personas: "",
        telefono: "",
        nombre: "",
        correo: "",
      });
    }, 3000);
  };

  return (
    <>
      <style>{dateTimeInputStyles}</style>
      <section className="relative min-h-screen bg-linear-to-r from-gray-50 via-gray-50 to-gray-100 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={imgHero}
            alt="Papas fritas"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-linear-to-r from-primary to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex items-center min-h-screen">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              RESERVAS
            </h1>
            <p className="text-white text-lg mb-8">
              Asegura tu lugar en Potatos,
              <br />
              haz tu reserva ahora
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  icon={Calendar}
                  label="Fecha"
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                />
                <FormField
                  icon={Clock}
                  label="Hora"
                  type="time"
                  id="hora"
                  name="hora"
                  value={formData.hora}
                  onChange={handleChange}
                />
              </div>

              {/* Nº Personas y Teléfono */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  icon={Users}
                  label="Nº Personas"
                  type="number"
                  id="personas"
                  name="personas"
                  value={formData.personas}
                  onChange={handleChange}
                  placeholder="4"
                  min="1"
                  max="20"
                />
                <FormField
                  icon={Phone}
                  label="Teléfono"
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+57 300"
                />
              </div>

              {/* Nombre */}
              <FormField
                icon={User}
                label="Nombre"
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
              />

              {/* Correo */}
              <FormField
                icon={Mail}
                label="Correo electrónico"
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="tu@correo.com"
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-secondary text-primary font-bold rounded-full hover:opacity-90 transition-opacity mt-6"
              >
                {submitted ? "✓ Reserva confirmada" : "Confirmar reserva"}
              </button>

              {submitted && (
                <p className="text-center text-secondary text-sm">
                  ¡Tu reserva ha sido registrada! Nos pondremos en contacto
                  pronto.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
