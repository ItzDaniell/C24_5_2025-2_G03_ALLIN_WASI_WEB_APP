"use client";

import { ArrowRight, Eye, Home as HomeIcon } from "lucide-react";

type Props = {
  onRegister: () => void;
  onLogin: () => void;
};

export function Hero({ onRegister, onLogin }: Props) {
  return (
    <section className="relative bg-white py-16 md:py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#D0D7C8]/20 via-white to-[#A37F6E]/5 -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 lg:pr-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D0D7C8]/50 rounded-full">
              <div className="w-2 h-2 bg-[#A37F6E] rounded-full animate-pulse" />
              <span className="text-sm text-[#2D3638]">Plataforma exclusiva para estudiantes TECSUP</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-[#2D3638] leading-[1.1]">Encuentra tu Hogar Seguro en Lima.</h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-[#A37F6E] leading-[1.1]">Conócelo en 360°.</h1>
            </div>

            <p className="text-lg md:text-xl text-[#2F4F4F] leading-relaxed max-w-xl">
              La plataforma para estudiantes de TECSUP que elimina las sorpresas y la desconfianza en el alquiler.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onRegister}
                className="inline-flex items-center justify-center h-14 px-8 text-base rounded-md bg-[#A37F6E] hover:bg-[#8B6B5A] text-white transition-colors shadow-lg shadow-[#A37F6E]/20 group"
              >
                ¡Empieza a Buscar Alojamiento!
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={onLogin}
                className="h-14 px-8 text-base rounded-md border-2 border-[#2F4F4F] text-[#2F4F4F] hover:bg-[#2F4F4F] hover:text-white transition-all"
              >
                Ya tengo cuenta
              </button>
            </div>

            <div className="pt-8">
              <p className="text-xs text-[#2F4F4F]/60 mb-4 uppercase tracking-wider">Confían en nosotros</p>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-[#A37F6E]" />
                    <p className="text-2xl text-[#2D3638]">100%</p>
                  </div>
                  <p className="text-xs text-[#2F4F4F]">Verificado</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <HomeIcon className="w-5 h-5 text-[#A37F6E]" />
                    <p className="text-2xl text-[#2D3638]">500+</p>
                  </div>
                  <p className="text-xs text-[#2F4F4F]">Propiedades</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 text-[#A37F6E]">👥</span>
                    <p className="text-2xl text-[#2D3638]">1.2K+</p>
                  </div>
                  <p className="text-xs text-[#2F4F4F]">Estudiantes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative lg:pl-8">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1605647268295-28bb5440643c?auto=format&fit=crop&w=1080&q=80"
                alt="Vista 360° de propiedad"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl border border-[#D0D7C8]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#A37F6E]/10 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-[#A37F6E]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#2D3638]">Tour Virtual</p>
                    <p className="text-sm text-[#2D3638]">360°</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-[#D0D7C8]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#2D3638]">Cuarto Moderno</p>
                    <p className="text-xs text-[#2F4F4F]">S/ 650/mes</p>
                  </div>
                  <button className="px-4 py-2 rounded-md bg-[#A37F6E] hover:bg-[#8B6B5A] text-white text-sm">Ver más</button>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#A37F6E]/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#D0D7C8]/50 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
