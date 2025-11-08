import { Link } from "react-router-dom";
import { Facebook, Instagram, Music } from "lucide-react";
import logo from "@/assets/images/logo.png";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="mb-3">
              <img src={logo} alt="PoTaTos" className="h-12 w-auto" />
            </div>
            <p className="text-sm text-gray-400 mb-3">
              "Crujientes por fuera, irresistibles por dentro"
            </p>
            <p className="text-xs text-gray-500">
              Medellín, Colombia
              <br />
              +57 300 658 7200
              <br />
              info@potatos.co
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-white mb-4">Explora</h3>
            <ul className="space-y-2 text-sm">
              {["Inicio", "Menú", "Reservas", "Nosotros"].map((item) => (
                <li key={item}>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Soporte</h3>
            <ul className="space-y-2 text-sm">
              {[
                "Preguntas frecuentes",
                "Términos y condiciones",
                "Política de privacidad",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-white mb-4">Síguenos en</h3>
            <div className="flex gap-4">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Music, href: "#" },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2025 PoTaTos. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
