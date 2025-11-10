import { Star } from "lucide-react";

export default function ProductCard({ product }) {
  return (
    <div className="group">
      {/* Unified Card container: image + content look like a single card */}
      <div
        className={`mx-auto rounded-2xl overflow-hidden transform transition-shadow duration-200 ${
          product.id === 2
            ? "md:-translate-y-6 z-20 md:shadow-2xl shadow-lg"
            : "shadow-lg"
        }`}
        style={{
          maxWidth: "360px",
          width: "100%",
        }}
      >
        {/* Image Container (top, rounded top corners preserved by parent) */}
        <div
          className={`h-40 sm:h-48 md:h-64 flex items-center justify-center bg-gray-100`}
        >
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${
              product.id === 2 ? "scale-100" : ""
            }`}
          />
        </div>

        {/* Card Content - primary/secondary based on id. Bottom corners preserved by parent */}
        <div
          className={`p-4 sm:p-5 md:p-6 ${
            product.id === 2
              ? "bg-linear-to-br from-secondary to-secondary text-primary"
              : "bg-linear-to-br from-primary to-primary text-secondary"
          }`}
        >
          {/* Name and Price Row */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <h3 className={`font-bold text-base sm:text-lg md:text-lg flex-1`}>
              {product.name}
            </h3>
            <button
              className={`px-8 sm:px-10 md:px-12 py-0.5 font-bold text-sm sm:text-base rounded-4xl hover:opacity-90 transition-opacity whitespace-nowrap shadow-md hover:shadow-lg ${
                product.id === 2
                  ? "bg-primary text-secondary"
                  : "bg-secondary text-primary"
              }`}
            >
              ${product.price}
            </button>
          </div>

          {/* Rating Section */}
          <div className="flex items-center justify-between text-sm sm:text-base">
            <p className="font-medium">Calificación</p>
            <div className="flex gap-0.5 sm:gap-1">
              {Array.from({ length: product.rating }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={`sm:w-4 sm:h-4 md:w-4 md:h-4 ${
                    product.id === 2
                      ? "fill-primary text-primary"
                      : "fill-secondary text-secondary"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
