"use client";

import { Eye, MapPin, MessageSquare } from "lucide-react";

export function Benefits() {
  return (
    <section id="como-funciona" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl text-[#2D3638] mb-4">¿Por qué elegir TECSUP Housing?</h2>
          <p className="text-lg text-[#2F4F4F] max-w-2xl mx-auto">Transparencia, seguridad y confianza en cada paso de tu búsqueda</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="border border-[#D0D7C8] rounded-xl p-8 hover:border-[#A37F6E] transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-[#A37F6E]/10 rounded-xl flex items-center justify-center mb-6">
              <Eye className="w-7 h-7 text-[#A37F6E]" />
            </div>
            <h3 className="text-xl text-[#2D3638] mb-3">Visitas 360°</h3>
            <p className="text-[#2F4F4F] leading-relaxed"><strong>Transparencia Total.</strong> Elimina la diferencia entre el anuncio y la realidad con recorridos virtuales 360°.</p>
          </div>

          <div id="seguridad" className="border border-[#D0D7C8] rounded-xl p-8 hover:border-[#A37F6E] transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-[#A37F6E]/10 rounded-xl flex items-center justify-center mb-6">
              <MapPin className="w-7 h-7 text-[#A37F6E]" />
            </div>
            <h3 className="text-xl text-[#2D3638] mb-3">Seguridad y Mapa</h3>
            <p className="text-[#2F4F4F] leading-relaxed"><strong>Seguridad Verificada.</strong> Conoce servicios cercanos y alertas de zonas de riesgo antes de decidir.</p>
          </div>

          <div id="comunidad" className="border border-[#D0D7C8] rounded-xl p-8 hover:border-[#A37F6E] transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-[#A37F6E]/10 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-[#A37F6E]" />
            </div>
            <h3 className="text-xl text-[#2D3638] mb-3">Comunidad y Confianza</h3>
            <p className="text-[#2F4F4F] leading-relaxed"><strong>Comunidad Colaborativa.</strong> Foro de estudiantes para compartir experiencias y advertencias de estafas.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
