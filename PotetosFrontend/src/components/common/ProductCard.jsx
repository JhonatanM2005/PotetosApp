import { Star } from "lucide-react";

export default function ProductCard({ product }) {
  return (
    <div className="group">
      {/* Image Container */}
      <div className="relative mb-4 rounded-2xl overflow-hidden h-64 bg-linear-to-br flex items-center justify-center">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Card Content - alternating backgrounds */}
      <div
        className={`p-6 rounded-xl ${
          product.id % 2 === 0
            ? "bg-linear-to-br from-orange-500 to-orange-600 text-white"
            : "bg-linear-to-br from-gray-50 to-gray-100 text-gray-900"
        }`}
      >
        <h3 className="font-bold text-lg mb-2">{product.name}</h3>

        <p
          className={`text-sm mb-4 leading-relaxed ${
            product.id % 2 === 0 ? "text-white/90" : "text-gray-600"
          }`}
        >
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span
            className={`text-2xl font-bold ${
              product.id % 2 === 0 ? "text-white" : "text-orange-500"
            }`}
          >
            ${product.price}
          </span>

          {/* Rating Stars */}
          <div className="flex gap-1">
            {Array.from({ length: product.rating }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  product.id % 2 === 0
                    ? "fill-white text-white"
                    : "fill-orange-500 text-orange-500"
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
