"use client";

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-inkwell mb-4">Lo que dicen nuestros estudiantes</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-au-lait rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-creme-brulee">★</span>
                ))}
              </div>
              <p className="text-lunar-eclipse mb-4 italic">
                {i === 1 && "Los tours 360° me salvaron de rentar un lugar que en fotos se veía bien, pero en realidad era muy pequeño. ¡Súper útil!"}
                {i === 2 && "El mapa de seguridad me ayudó a elegir una zona tranquila cerca del campus. Mis padres están más tranquilos."}
                {i === 3 && "En el foro, otros estudiantes me advirtieron sobre un arrendador problemático. ¡Evité un gran dolor de cabeza!"}
              </p>
              <p className="text-sm text-inkwell">
                {i === 1 && "María G. - Tecnologías de la Información"}
                {i === 2 && "Carlos R. - Mecatrónica Industrial"}
                {i === 3 && "Ana P. - Diseño Industrial"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
