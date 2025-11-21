import { useState } from "react";
import ProductCard from "@/components/common/ProductCard";
import { Flame, Zap, Wind, Utensils } from "lucide-react";
import rancheraImg from "@/assets/images/dishes/poteto-ranchera.png";

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("papitas");

  const categories = [
    { id: "papitas", label: "PAPITAS", icon: Flame },
    { id: "salsas", label: "SALSAS", icon: Zap },
    { id: "bebidas", label: "BEBIDAS", icon: Wind },
    { id: "postres", label: "POSTRES", icon: Utensils },
  ];

  const products = {
    papitas: [
      {
        id: 1,
        name: "POTETO RANCHERA",
        description:
          "Crujientes y doradas papas con queso mozzarella, salchicha ranchera, tocineta, mozzarella y sour cream",
        price: "26.000",
        rating: 5,
        image: rancheraImg,
      },
      {
        id: 2,
        name: "POTETO MEXICANA",
        description:
          "Crujientes y doradas papas con queso mozzarella, salchicha mexicana, jalapeños, pico de gallo y sour cream",
        price: "26.000",
        rating: 5,
        image: rancheraImg,
      },
      {
        id: 3,
        name: "POTETO CLÁSICA",
        description:
          "Crujientes y doradas papas con queso mozzarella, salchicha manguera, mozzarella, salsa de la casa y huevo de codorniz",
        price: "15.000",
        rating: 5,
        image: rancheraImg,
      },
    ],
    salsas: [
      {
        id: 4,
        name: "SALSA PICANTE",
        description: "Salsa casera con ají, tomate y especias",
        price: "5.000",
        rating: 4,
        image: rancheraImg,
      },
      {
        id: 5,
        name: "SALSA QUESO",
        description: "Salsa cremosa de queso cheddar",
        price: "5.000",
        rating: 5,
        image: rancheraImg,
      },
      {
        id: 6,
        name: "SALSA DE LA CASA",
        description: "Secreta salsa especial de Potetos",
        price: "4.000",
        rating: 4,
        image: rancheraImg,
      },
    ],
    bebidas: [
      {
        id: 7,
        name: "COCA COLA",
        description: "Bebida refrescante 350ml",
        price: "3.000",
        rating: 5,
        image: rancheraImg,
      },
      {
        id: 8,
        name: "LIMONADA CASERA",
        description: "Limonada fresca natural 500ml",
        price: "4.000",
        rating: 5,
        image: rancheraImg,
      },
      {
        id: 9,
        name: "CERVEZA ARTESANAL",
        description: "Cerveza premium 330ml",
        price: "6.000",
        rating: 4,
        image: rancheraImg,
      },
    ],
    postres: [
      {
        id: 10,
        name: "BROWNIE CALIENTE",
        description: "Brownie recién horneado con helado",
        price: "8.000",
        rating: 5,
        image: rancheraImg,
      },
      {
        id: 11,
        name: "HELADO ARTESANAL",
        description: "Helado casero en varios sabores",
        price: "6.000",
        rating: 5,
        image: rancheraImg,
      },
      {
        id: 12,
        name: "CHEESECAKE",
        description: "Cheesecake de frutos rojos",
        price: "7.000",
        rating: 4,
        image: rancheraImg,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-full font-semibold transition-all ${
                  activeCategory === category.id
                    ? "bg-primary text-secondary scale-105 shadow-lg"
                    : "bg-secondary text-primary hover:bg-secondary/90"
                }`}
              >
                <Icon size={20} />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            {categories.find((c) => c.id === activeCategory)?.label}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products[activeCategory].map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
