"use client";

import { Users, Eye, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  onRegister: () => void;
};

export function LandlordCTA({ onRegister }: Props) {
  const router = useRouter();

  return (
    <section id="arrendadores" className="py-16 md:py-24 bg-[#2D3638] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl">¿Eres Arrendador?</h2>
          <p className="text-xl text-white/90">
            Conecta con estudiantes verificados y muestra tus propiedades de forma transparente con nuestros tours 360°.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => router.push("/planes")}
              className="h-14 px-8 text-lg rounded-md bg-[#A37F6E] hover:bg-[#8B6B5A] text-white transition-all hover:shadow-lg hover:scale-105"
            >
              Ver Planes y Precios
            </button>
            <button
              onClick={onRegister}
              className="h-14 px-8 text-lg rounded-md bg-[#ffffff]  text-black hover:bg-white hover:text-[#000000] transition-all hover:shadow-lg hover:scale-105"
            >
              Publicar Propiedad
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-white/20">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-[#A37F6E]/20 rounded-lg flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-[#A37F6E]" />
              </div>
              <p className="text-lg font-medium">Público Objetivo</p>
              <p className="text-sm text-white/80">Llega directamente a estudiantes que buscan activamente.</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-[#A37F6E]/20 rounded-lg flex items-center justify-center mx-auto">
                <Eye className="w-6 h-6 text-[#A37F6E]" />
              </div>
              <p className="text-lg font-medium">Transparencia 360°</p>
              <p className="text-sm text-white/80">Genera más confianza (y menos visitas fallidas) mostrando tu espacio tal cual es.</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-[#A37F6E]/20 rounded-lg flex items-center justify-center mx-auto">
                <LayoutDashboard className="w-6 h-6 text-[#A37F6E]" />
              </div>
              <p className="text-lg font-medium">Gestión Simple</p>
              <p className="text-sm text-white/80">Publica, administra y recibe mensajes en un solo lugar.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
