"use client";

import { useRouter } from "next/navigation";
import { Check, ArrowLeft } from "lucide-react";

export default function PlanesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#D0D7C8] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-[#2F4F4F] hover:text-[#A37F6E] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al inicio</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2F4F4F] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🏠</span>
              </div>
              <span className="text-lg text-[#2D3638] font-medium">Allin Wasi</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#D0D7C8]/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl text-[#2D3638] mb-4">Planes para Arrendadores</h1>
          <p className="text-xl text-[#2F4F4F] max-w-2xl mx-auto">
            Elige el plan que necesitas para empezar a alquilar.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Plan Básico */}
            <div className="border-2 border-[#D0D7C8] rounded-2xl p-8 hover:border-[#A37F6E] transition-all hover:shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl text-[#2D3638] mb-2">Plan Básico</h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl text-[#A37F6E] font-bold">S/ 10.00</span>
                  <span className="text-[#2F4F4F]">/ mes</span>
                </div>
                <p className="text-[#2F4F4F]">Para empezar y recibir tus primeros interesados.</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-[#A37F6E]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#A37F6E]" />
                  </div>
                  <span className="text-[#2F4F4F]">Publicar hasta 2 propiedades</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-[#A37F6E]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#A37F6E]" />
                  </div>
                  <span className="text-[#2F4F4F]">Recibir y gestionar mensajes</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-[#A37F6E]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#A37F6E]" />
                  </div>
                  <span className="text-[#2F4F4F]">Soporte estándar</span>
                </li>
              </ul>

              <button
                onClick={() => router.push("/register")}
                className="w-full h-14 rounded-lg border-2 border-[#A37F6E] text-[#A37F6E] hover:bg-[#A37F6E] hover:text-white transition-colors font-medium"
              >
                Empezar con Básico
              </button>
            </div>

            {/* Plan Premium */}
            <div className="border-2 border-[#A37F6E] rounded-2xl p-8 relative hover:shadow-2xl transition-all bg-gradient-to-br from-white to-[#A37F6E]/5">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#A37F6E] text-white px-4 py-1 rounded-full text-sm">
                Recomendado
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl text-[#2D3638] mb-2">Plan Premium</h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl text-[#A37F6E] font-bold">S/ 20.00</span>
                  <span className="text-[#2F4F4F]">/ mes</span>
                </div>
                <p className="text-[#2F4F4F]">Para maximizar tu visibilidad y obtener datos.</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-[#A37F6E]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#A37F6E]" />
                  </div>
                  <span className="text-[#2F4F4F]"><strong>Todo lo del Plan Básico</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-[#A37F6E]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#A37F6E]" />
                  </div>
                  <span className="text-[#2F4F4F]">Publicaciones ilimitadas</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-[#A37F6E]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#A37F6E]" />
                  </div>
                  <span className="text-[#2F4F4F]">Prioridad en resultados de búsqueda</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-[#A37F6E]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#A37F6E]" />
                  </div>
                  <span className="text-[#2F4F4F]">Analíticas de visitas de tus propiedades</span>
                </li>
              </ul>

              <button
                onClick={() => router.push("/register")}
                className="w-full h-14 rounded-lg bg-[#A37F6E] hover:bg-[#8B6B5A] text-white transition-colors font-medium shadow-lg shadow-[#A37F6E]/20"
              >
                Obtener Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ or Additional Info */}
      <section className="py-16 bg-[#D0D7C8]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl text-[#2D3638] mb-6">¿Tienes preguntas?</h2>
          <p className="text-lg text-[#2F4F4F] mb-8">
            Contáctanos en <a href="mailto:soporte@allinwasi.pe" className="text-[#A37F6E] hover:underline">soporte@allinwasi.pe</a> y te ayudaremos a elegir el mejor plan para ti.
          </p>
          <button
            onClick={() => router.push("/")}
            className="h-12 px-8 rounded-lg border-2 border-[#2F4F4F] text-[#2F4F4F] hover:bg-[#2F4F4F] hover:text-white transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </section>
    </div>
  );
}
