"use client";

export function LoginHero() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-lunar-eclipse via-creme-brulee to-au-lait items-center justify-center p-12 relative">
      <div className="text-center text-white space-y-8">
        <div>
          <h2 className="text-5xl mb-4">Encuentra tu espacio ideal</h2>
          <p className="text-xl opacity-90">
            La mejor plataforma para estudiantes de TECSUP<br />
            que buscan alojamiento cerca del campus
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-12">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
            <div className="text-4xl mb-2">500+</div>
            <div className="text-sm opacity-90">Cuartos</div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
            <div className="text-4xl mb-2">1,200+</div>
            <div className="text-sm opacity-90">Estudiantes</div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
            <div className="text-4xl mb-2">98%</div>
            <div className="text-sm opacity-90">Satisfacción</div>
          </div>
        </div>
      </div>

      <button className="absolute bottom-8 right-8 w-12 h-12 bg-inkwell rounded-full flex items-center justify-center text-white hover:bg-opacity-90 transition-all shadow-lg">
        <span className="text-xl">?</span>
      </button>
    </div>
  );
}
