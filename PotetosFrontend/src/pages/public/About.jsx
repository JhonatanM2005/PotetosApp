import imgHero from "@/assets/images/papas-fritas-crujientes-mano.png";
import imgMisionVision from "@/assets/images/mv.png";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-primary">
            NOSOTROS
          </h1>
        </div>
      </section>

      {/* Featured Image */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full h-48 sm:h-64 md:h-96 max-w-4xl overflow-hidden shadow-lg justify-center mx-auto rounded-lg">
            <img
              src={imgHero}
              alt="PoTeTos - Sabor Criollo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Historia Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8 text-primary">
            HISTORIA
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed text-center">
              El restaurante POTETOS es un establecimiento gastronómico
              especializado en ofrecer comidas rápidas y platos tradicionales
              con un enfoque innovador, destacándose por la calidad de sus
              productos, la atención al cliente y un ambiente acogedor. Su
              propuesta de valor combina un menú variado con ingredientes
              frescos y un servicio ágil que busca satisfacer tanto a clientes
              locales como a visitantes. 
              <br />
              Actualmente, el restaurante cuenta con
              una sola sede física, ubicada en una zona de alta concurrencia, lo
              que le permite recibir un flujo constante de clientes.
            </p>
          </div>
        </div>
      </section>

      {/* Misión y Visión Sections */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Misión with image left */}
          <div className="relative grid grid-cols-1 md:grid-cols-12 gap-0 items-center mb-12 sm:mb-16">
            <div className="overflow-hidden shadow-lg h-64 sm:h-80 md:h-96 md:col-span-7 rounded-lg md:rounded-none">
              <img
                src={imgMisionVision}
                alt="Sabor Criollo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-secondary text-primary p-6 sm:p-8 rounded-2xl shadow-lg md:-ml-12 md:z-10 relative mt-6 md:mt-0 md:col-span-5 text-center">
              <h3 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-primary">MISIÓN</h3>
              <p className="text-sm sm:text-base leading-relaxed">
                En POTETOS se ofrecen experiencias gastronómicas de calidad,
                combinadas con opciones tradicionales e innovadoras y modernas
                en la presentación del servicio. Iniciamos con la misión de
                brindar un ambiente acogedor. El restaurante se edificó en torno
                a la idea de satisfacer los requisitos de cualquier cliente, con
                el objetivo de establecer un sitio seguro y de confianza.
              </p>
            </div>
          </div>

          {/* Visión with image right */}
          <div className="relative grid grid-cols-1 md:grid-cols-12 gap-0 items-center">
            <div className="bg-secondary text-primary p-6 sm:p-8 rounded-2xl shadow-lg order-2 md:order-1 md:-mr-12 md:z-10 relative mt-6 md:mt-0 md:col-span-5 text-center">
              <h3 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-primary">VISIÓN</h3>
              <p className="text-sm sm:text-base leading-relaxed">
                En los próximos 5 años, POTETOS busca ser un restaurante
                reconocido a nivel regional por la excelencia en la atención al
                cliente, la innovación en sus procesos y la incorporación de
                soluciones tecnológicas que fortalezcan su operación,
                permitiéndole expandir su marca y consolidarse como un referente
                en el sector gastronómico.
              </p>
            </div>
            <div className="h-64 sm:h-80 md:h-96 overflow-hidden shadow-lg order-1 md:order-2 md:col-span-7 rounded-lg md:rounded-none">
              <img
                src={imgMisionVision}
                alt="Sabor Criollo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-8 sm:py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 text-primary">
            NUESTROS VALORES
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "CALIDAD",
                description:
                  "Ofrecemos productos frescos de la mejor calidad, preparados con ingredientes seleccionados.",
              },
              {
                title: "SABOR CRIOLLO",
                description:
                  "Mantenemos la esencia de la gastronomía tradicional colombiana en cada plato.",
              },
              {
                title: "SERVICIO AL CLIENTE",
                description:
                  "Nos comprometemos a brindar una experiencia memorable a cada visitante.",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-secondary p-6 sm:p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-lg sm:text-xl font-bold text-primary mb-2 sm:mb-3">
                  {value.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
