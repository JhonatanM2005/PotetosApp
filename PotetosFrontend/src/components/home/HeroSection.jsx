import { Link } from "react-router-dom";
import imgHero from "@/assets/images/papas-fritas-crujientes-mano.png";

export default function HeroSection() {
  return (
    <section className="relative h-96 md:h-[500px] bg-linear-to-r from-gray-50 via-gray-50 to-gray-100 overflow-hidden">
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="max-w-xl flex flex-col">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight text-pretty">
            Crujientes por fuera,
            <br />
            irresistibles por dentro
          </h1>
          <Link
            to="/menu"
            className="w-fit px-10 py-3 bg-secondary text-primary font-bold text-2xl rounded-full hover:bg-orange-600 transition-colors text-center"
          >
            Nuestro Menú
          </Link>
        </div>
      </div>
    </section>
  );
}
