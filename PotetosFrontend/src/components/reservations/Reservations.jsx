import { useState } from "react";
import { Calendar, Clock, Users, Phone, Mail, User } from "lucide-react";
import imgHero from "@/assets/images/papas-fritas-crujientes-mano.png";

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
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            {/* Fecha */}
            <div>
              <label
                htmlFor="fecha"
                className="block text-sm font-medium text-white mb-2"
              >
                Fecha
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-3.5 text-secondary pointer-events-none"
                  size={20}
                />
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-primary/50 text-white border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder-white/60"
                />
              </div>
            </div>

            {/* Hora */}
            <div>
              <label
                htmlFor="hora"
                className="block text-sm font-medium text-white mb-2"
              >
                Hora
              </label>
              <div className="relative">
                <Clock
                  className="absolute left-3 top-3.5 text-secondary pointer-events-none"
                  size={20}
                />
                <input
                  type="time"
                  id="hora"
                  name="hora"
                  value={formData.hora}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-primary/50 text-white border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder-white/60"
                />
              </div>
            </div>

            {/* Nº Personas y Teléfono */}
            <div className="grid grid-cols-2 gap-4">
              {/* Personas */}
              <div>
                <label
                  htmlFor="personas"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Nº Personas
                </label>
                <div className="relative">
                  <Users
                    className="absolute left-3 top-3.5 text-secondary pointer-events-none"
                    size={20}
                  />
                  <input
                    type="number"
                    id="personas"
                    name="personas"
                    min="1"
                    max="20"
                    value={formData.personas}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-primary/50 text-white border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder-white/60"
                    placeholder="4"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label
                  htmlFor="telefono"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Teléfono
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-3.5 text-secondary pointer-events-none"
                    size={20}
                  />
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-primary/50 text-white border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder-white/60"
                    placeholder="+57 300"
                  />
                </div>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-white mb-2"
              >
                Nombre
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3.5 text-secondary pointer-events-none"
                  size={20}
                />
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-primary/50 text-white border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder-white/60"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

            {/* Correo */}
            <div>
              <label
                htmlFor="correo"
                className="block text-sm font-medium text-white mb-2"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3.5 text-secondary pointer-events-none"
                  size={20}
                />
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-primary/50 text-white border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder-white/60"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

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
  );
}
