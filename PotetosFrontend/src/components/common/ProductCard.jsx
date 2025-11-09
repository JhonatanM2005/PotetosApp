import { Star } from "lucide-react";

export default function ProductCard({ product }) {
  return (
    <div className="group">
      {/* Unified Card container: image + content look like a single card */}
      <div
        className={`mx-auto rounded-2xl overflow-hidden transform transition-shadow duration-200 ${
          product.id === 2 ? "-translate-y-6 z-20 shadow-2xl" : "shadow-lg"
        }`}
        style={{ maxWidth: 360 }}
      >
        {/* Image Container (top, rounded top corners preserved by parent) */}
        <div className={`h-64 flex items-center justify-center bg-gray-100`}>
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
          className={`p-6 ${
            product.id === 2
              ? "bg-linear-to-br from-secondary to-secondary text-primary"
              : "bg-linear-to-br from-primary to-primary text-secondary"
          }`}
        >
          <h3 className={`font-bold text-lg mb-2`}>{product.name}</h3>

          <p className={`text-sm mb-4 leading-relaxed text-white/90`}>
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold text-white`}>
              ${product.price}
            </span>

            {/* Rating Stars */}
            <div className="flex gap-1">
              {Array.from({ length: product.rating }).map((_, i) => (
                <Star key={i} size={16} className={"fill-white text-white"} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
