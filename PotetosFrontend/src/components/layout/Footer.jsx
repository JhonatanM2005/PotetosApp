import { Link } from "react-router-dom";
import logo from "@/assets/images/logo.png";
import facebookSvg from "@/assets/images/Facebook.svg";
import instagramSvg from "@/assets/images/Instagram.svg";
import tiktokSvg from "@/assets/images/TikTok.svg";

export default function Footer() {
  return (
    <footer className="bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="mb-3">
              <img src={logo} alt="Potetos" className="h-12 w-auto" />
            </div>
            <p className="text-sm text-white mb-2">
              "Crujientes por fuera, irresistibles por dentro"
            </p>
            <p className="text-xs text-white mb-2">Medellín, Colombia</p>
            <p className="text-xs text-white mb-2">+57 300 658 7200</p>
            <p className="text-xs text-white">info@potatos.co</p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-secondary mb-4">Explora</h3>
            <ul className="space-y-2 text-sm">
              {["Inicio", "Menú", "Reservas", "Nosotros"].map((item) => (
                <li key={item}>
                  <Link
                    to="/"
                    className="text-white hover:text-secondary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-secondary mb-4">Soporte</h3>
            <ul className="space-y-2 text-sm">
              {[
                "Preguntas frecuentes",
                "Términos y condiciones",
                "Política de privacidad",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="/"
                    className="text-white hover:text-secondary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-secondary mb-4">Síguenos en</h3>
            <div className="flex gap-4">
              {[
                {
                  src: facebookSvg,
                  href: "https://www.facebook.com",
                  alt: "Facebook",
                },
                {
                  src: instagramSvg,
                  href: "https://www.instagram.com",
                  alt: "Instagram",
                },
                {
                  src: tiktokSvg,
                  href: "https://www.tiktok.com",
                  alt: "TikTok",
                },
              ].map(({ src, href, alt }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-8 h-8 items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <img src={src} alt={alt} className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
