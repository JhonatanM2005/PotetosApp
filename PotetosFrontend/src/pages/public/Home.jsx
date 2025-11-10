import ProductCard from "@/components/common/ProductCard"
import HeroSection from "@/components/home/HeroSection"
import rancheraImg from "@/assets/images/dishes/poteto-ranchera.png"

export default function Home() {
  const topProducts = [
    {
      id: 1,
      name: "POTETO RANCHERA",
      price: "26.000",
      rating: 5,
      image: rancheraImg,
    },
    {
      id: 2,
      name: "POTETO RANCHERA",
      price: "26.000",
      rating: 5,
      image: rancheraImg,
    },
    {
      id: 3,
      name: "POTETO RANCHERA",
      price: "26.000",
      rating: 5,
      image: rancheraImg,
    },
  ];

  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Top 3 Products */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            TOP 3 PLATOS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
