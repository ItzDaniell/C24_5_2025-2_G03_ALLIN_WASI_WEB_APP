"use client";

import { Eye, MapPin, MessageSquare } from "lucide-react";

export function Benefits() {
  return (
    <section id="beneficios" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl text-[#2D3638] mb-4">¿Por qué elegir Allin Wasi?</h2>
          <p className="text-lg text-[#2F4F4F] max-w-2xl mx-auto">Transparencia, seguridad y confianza para estudiantes y arrendadores.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="border border-[#D0D7C8] rounded-xl p-8 hover:border-[#A37F6E] transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-[#A37F6E]/10 rounded-xl flex items-center justify-center mb-6">
              <Eye className="w-7 h-7 text-[#A37F6E]" />
            </div>
            <h3 className="text-xl text-[#2D3638] mb-3">Visitas 360°</h3>
            <p className="text-[#2F4F4F] leading-relaxed"><strong>Transparencia Total.</strong> Arrendadores muestran sus espacios tal como son, estudiantes ven exactamente lo que van a encontrar. Sin sorpresas.</p>
          </div>

          <div id="seguridad" className="border border-[#D0D7C8] rounded-xl p-8 hover:border-[#A37F6E] transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-[#A37F6E]/10 rounded-xl flex items-center justify-center mb-6">
              <MapPin className="w-7 h-7 text-[#A37F6E]" />
            </div>
            <h3 className="text-xl text-[#2D3638] mb-3">Seguridad y Mapa</h3>
            <p className="text-[#2F4F4F] leading-relaxed"><strong>Decisiones Informadas.</strong> Conoce servicios cercanos y alertas de zonas de riesgo en nuestro mapa interactivo antes de decidir.</p>
          </div>

          <div id="comunidad" className="border border-[#D0D7C8] rounded-xl p-8 hover:border-[#A37F6E] transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-[#A37F6E]/10 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-[#A37F6E]" />
            </div>
            <h3 className="text-xl text-[#2D3638] mb-3">Comunidad y Confianza</h3>
            <p className="text-[#2F4F4F] leading-relaxed"><strong>Comunidad Colaborativa.</strong> Estudiantes comparten experiencias reales, arrendadores construyen reputación. Todos se benefician de la transparencia.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
