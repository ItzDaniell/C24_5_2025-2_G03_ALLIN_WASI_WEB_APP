"use client";

type Props = {
  onRegister: () => void;
};

export function LandlordCTA({ onRegister }: Props) {
  return (
    <section className="py-16 md:py-24 bg-[#2D3638] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl">¿Eres arrendador? Publica con Visitas 360° y llega directamente a miles de estudiantes de TECSUP.</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={onRegister}
              className="h-14 px-8 text-lg rounded-md border border-[#A37F6E] text-[#A37F6E] hover:bg-[#A37F6E] hover:text-white transition-colors"
            >
              Publicar Propiedad Ahora
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-white/20">
            <div>
              <p className="text-3xl text-[#A37F6E] mb-2">Gratis</p>
              <p className="text-sm text-white/80">Publica sin costo</p>
            </div>
            <div>
              <p className="text-3xl text-[#A37F6E] mb-2">24/7</p>
              <p className="text-sm text-white/80">Visibilidad continua</p>
            </div>
            <div>
              <p className="text-3xl text-[#A37F6E] mb-2">1,200+</p>
              <p className="text-sm text-white/80">Estudiantes activos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
