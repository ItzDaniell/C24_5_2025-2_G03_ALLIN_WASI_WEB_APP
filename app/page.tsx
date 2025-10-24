"use client";

import { useRouter } from "next/navigation";
import { Eye, MapPin, Users, Home as HomeIcon, Shield, MessageSquare, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const onLogin = () => router.push("/login");
  const onRegister = () => router.push("/register");

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#2F4F4F] rounded-xl flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl md:text-2xl text-[#2D3638]">TECSUP Housing</span>
            </div>

            {/* Navigation - Hidden on mobile */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#como-funciona" className="text-[#2F4F4F] hover:text-[#A37F6E] transition-colors">Cómo Funciona</a>
              <a href="#seguridad" className="text-[#2F4F4F] hover:text-[#A37F6E] transition-colors">Seguridad</a>
              <a href="#comunidad" className="text-[#2F4F4F] hover:text-[#A37F6E] transition-colors">Comunidad</a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onLogin}
                className="px-4 py-2 rounded-md text-[#2F4F4F] hover:text-[#A37F6E] hover:bg-[#D0D7C8]/30 transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={onRegister}
                className="px-4 py-2 rounded-md bg-[#A37F6E] hover:bg-[#8B6B5A] text-white transition-colors"
              >
                Regístrate
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D0D7C8]/20 via-white to-[#A37F6E]/5 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
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
                      <Shield className="w-5 h-5 text-[#A37F6E]" />
                      <p className="text-2xl text-[#2D3638]">100%</p>
                    </div>
                    <p className="text-xs text-[#2F4F4F]">Verificado</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#A37F6E]" />
                      <p className="text-2xl text-[#2D3638]">1.2K+</p>
                    </div>
                    <p className="text-xs text-[#2F4F4F]">Estudiantes</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <HomeIcon className="w-5 h-5 text-[#A37F6E]" />
                      <p className="text-2xl text-[#2D3638]">500+</p>
                    </div>
                    <p className="text-xs text-[#2F4F4F]">Propiedades</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image/Mockup */}
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

      {/* Benefits Section */}
      <section id="como-funciona" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl text-[#2D3638] mb-4">¿Por qué elegir TECSUP Housing?</h2>
            <p className="text-lg text-[#2F4F4F] max-w-2xl mx-auto">Transparencia, seguridad y confianza en cada paso de tu búsqueda</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="border border-[#D0D7C8] rounded-xl p-8 hover:border-[#A37F6E] transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-[#A37F6E]/10 rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-[#A37F6E]" />
              </div>
              <h3 className="text-xl text-[#2D3638] mb-3">Visitas 360°</h3>
              <p className="text-[#2F4F4F] leading-relaxed"><strong>Transparencia Total.</strong> Elimina la diferencia entre el anuncio y la realidad con recorridos virtuales 360°.</p>
            </div>

            {/* Card 2 */}
            <div id="seguridad" className="border border-[#D0D7C8] rounded-xl p-8 hover:border-[#A37F6E] transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-[#A37F6E]/10 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-[#A37F6E]" />
              </div>
              <h3 className="text-xl text-[#2D3638] mb-3">Seguridad y Mapa</h3>
              <p className="text-[#2F4F4F] leading-relaxed"><strong>Seguridad Verificada.</strong> Conoce servicios cercanos y alertas de zonas de riesgo antes de decidir.</p>
            </div>

            {/* Card 3 */}
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

      {/* Landlord CTA Section */}
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

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-[#2D3638] mb-4">Lo que dicen nuestros estudiantes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1,2,3].map((i) => (
              <div key={i} className="border border-[#D0D7C8] rounded-xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-[#A37F6E]">★</span>
                  ))}
                </div>
                <p className="text-[#2F4F4F] mb-4 italic">
                  {i === 1 && "Los tours 360° me salvaron de rentar un lugar que en fotos se veía bien, pero en realidad era muy pequeño. ¡Súper útil!"}
                  {i === 2 && "El mapa de seguridad me ayudó a elegir una zona tranquila cerca del campus. Mis padres están más tranquilos."}
                  {i === 3 && "En el foro, otros estudiantes me advirtieron sobre un arrendador problemático. ¡Evité un gran dolor de cabeza!"}
                </p>
                <p className="text-sm text-[#2D3638]">
                  {i === 1 && "María G. - Tecnologías de la Información"}
                  {i === 2 && "Carlos R. - Mecatrónica Industrial"}
                  {i === 3 && "Ana P. - Diseño Industrial"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#D0D7C8]/30 py-12 border-t border-[#D0D7C8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#A37F6E]/30 rounded-lg p-6 mb-8">
            <p className="text-sm text-[#2F4F4F] text-center">
              <strong>⚠️ Aviso Legal:</strong> TECSUP Housing es una plataforma informativa. No gestiona contratos, pagos ni sustituye a un agente inmobiliario. Los usuarios son responsables de verificar la información de las propiedades y realizar sus propias diligencias antes de cualquier acuerdo.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#2F4F4F] rounded-lg flex items-center justify-center">
                  <HomeIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg text-[#2D3638]">TECSUP Housing</span>
              </div>
              <p className="text-sm text-[#2F4F4F]">Tu hogar seguro en Lima</p>
            </div>
            <div>
              <h4 className="text-sm text-[#2D3638] mb-4">Plataforma</h4>
              <ul className="space-y-2">
                <li><a href="#como-funciona" className="text-sm text-[#2F4F4F] hover:text-[#A37F6E]">Cómo Funciona</a></li>
                <li><a href="#seguridad" className="text-sm text-[#2F4F4F] hover:text-[#A37F6E]">Seguridad</a></li>
                <li><a href="#comunidad" className="text-sm text-[#2F4F4F] hover:text-[#A37F6E]">Comunidad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm text-[#2D3638] mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-[#2F4F4F] hover:text-[#A37F6E]">Términos de Uso</a></li>
                <li><a href="#" className="text-sm text-[#2F4F4F] hover:text-[#A37F6E]">Privacidad</a></li>
                <li><a href="#" className="text-sm text-[#2F4F4F] hover:text-[#A37F6E]">Aviso Legal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm text-[#2D3638] mb-4">Contacto</h4>
              <ul className="space-y-2">
                <li className="text-sm text-[#2F4F4F]">soporte@tecsuphousing.pe</li>
                <li className="text-sm text-[#2F4F4F]">Lima, Perú</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#D0D7C8]">
            <p className="text-sm text-[#2F4F4F] text-center"> 2025 TECSUP Housing. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
