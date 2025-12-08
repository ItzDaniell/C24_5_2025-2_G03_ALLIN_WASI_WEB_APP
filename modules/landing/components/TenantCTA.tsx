"use client";

import { Search, Shield, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  onRegister: () => void;
};

export function TenantCTA({ onRegister }: Props) {
  const router = useRouter();

  return (
    <section id="estudiantes" className="py-16 md:py-24 bg-[#A37F6E]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl text-[#2D3638]">¿Eres Estudiante?</h2>
          <p className="text-xl text-[#2F4F4F]">
            Encuentra tu hogar ideal cerca de tu campus. Sin estafas, sin sorpresas y con una comunidad que te respalda.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={onRegister}
              className="h-14 px-8 text-lg rounded-md bg-[#2D3638] hover:bg-[#232a2c] text-white transition-all hover:shadow-lg hover:scale-105"
            >
              Crear Cuenta Gratis
            </button>
            <button
              onClick={() => router.push("/search")}
              className="h-14 px-8 text-lg rounded-md border-2 border-[#2D3638] text-[#2D3638] hover:bg-[#2D3638] hover:text-white transition-all hover:shadow-lg hover:scale-105"
            >
              Explorar Habitaciones
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-[#A37F6E]/20 mt-8">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-[#2D3638]/10 rounded-lg flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-[#2D3638]" />
              </div>
              <p className="text-lg font-medium text-[#2D3638]">Búsqueda Inteligente</p>
              <p className="text-sm text-[#2F4F4F]">Filtra por precio, ubicación y servicios. Encuentra lo que realmente necesitas.</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-[#2D3638]/10 rounded-lg flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-[#2D3638]" />
              </div>
              <p className="text-lg font-medium text-[#2D3638]">Verificación Total</p>
              <p className="text-sm text-[#2F4F4F]">Arrendadores verificados y fotos reales. Tu seguridad es nuestra prioridad.</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-[#2D3638]/10 rounded-lg flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-[#2D3638]" />
              </div>
              <p className="text-lg font-medium text-[#2D3638]">Favoritos y Alertas</p>
              <p className="text-sm text-[#2F4F4F]">Guarda lo que te gusta y recibe notificaciones cuando bajen de precio.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
