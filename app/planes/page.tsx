"use client";

import { useRouter } from "next/navigation";
import { Check, ArrowLeft, Shield, Zap, Users, Eye, MessageSquare, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function PlanesPage() {
  const router = useRouter();

  const handlePublicar = () => {
    sessionStorage.setItem("selectedPlan", "publicacion");
    router.push("/register");
  };

  const features = [
    {
      icon: Shield,
      title: "Validación de Identidad",
      desc: "Verificación completa de tu identidad para generar confianza en los estudiantes.",
    },
    {
      icon: Eye,
      title: "Tour Virtual 360°",
      desc: "Publica fotos y tours inmersivos para que los estudiantes vean tu espacio tal como es.",
    },
    {
      icon: Users,
      title: "Acceso a Estudiantes Verificados",
      desc: "Conecta directamente con estudiantes de TECSUP que buscan alojamiento activamente.",
    },
    {
      icon: MessageSquare,
      title: "Chat con Inquilinos",
      desc: "Comunícate de forma segura con los interesados desde la plataforma.",
    },
    {
      icon: LayoutDashboard,
      title: "Panel de Gestión",
      desc: "Administra tu publicación, solicitudes y mensajes en un solo lugar.",
    },
    {
      icon: Zap,
      title: "Publicación Inmediata",
      desc: "Una vez verificado, tu propiedad aparece visible para todos los estudiantes.",
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="border-b border-au-lait bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-inkwell hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al inicio</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm border border-au-lait">
                <Image
                  src="/logo.png"
                  alt="Allin Wasi Logo"
                  width={40}
                  height={40}
                  className="object-contain rounded-full"
                />
              </div>
              <span className="text-xl text-inkwell font-semibold">Allin Wasi</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-12 md:py-20 bg-gradient-to-br from-indigo-50/20 via-white to-emerald-50/10">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-6"
          >
            Para Arrendadores
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl md:text-5xl text-inkwell mb-5 font-bold leading-tight"
          >
            Publica tu propiedad por{" "}
            <span className="text-primary">S/ 15.00</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl text-lunar-eclipse max-w-2xl mx-auto"
          >
            Un único pago por publicación. Sin suscripciones, sin sorpresas. Llega directamente a estudiantes
            verificados de TECSUP que buscan alojamiento.
          </motion.p>
        </div>
      </section>

      {/* Main Card */}
      <section className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="border-2 border-primary rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 bg-white"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-br from-primary to-primary/80 px-8 py-10 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white blur-2xl" />
              </div>
              <div className="relative z-10">
                <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1 rounded-full mb-4 backdrop-blur-sm">
                  🏠 Publicación de Propiedad
                </span>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-2xl font-medium opacity-80">S/</span>
                  <span className="text-7xl font-bold tracking-tight">15</span>
                  <span className="text-2xl font-medium opacity-80">.00</span>
                </div>
                <p className="text-white/80 text-lg">por publicación · pago único</p>
              </div>
            </div>

            {/* Features */}
            <div className="px-8 py-8">
              <p className="text-sm font-semibold text-inkwell uppercase tracking-wider mb-6">
                Todo incluido en tu publicación
              </p>
              <ul className="space-y-4 mb-8">
                {features.map((f, i) => (
                  <motion.li
                    key={f.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.07, duration: 0.4 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <f.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-inkwell text-sm">{f.title}</p>
                      <p className="text-lunar-eclipse text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>

              {/* Security note */}
              <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-lunar-eclipse">
                  El pago incluye el proceso de{" "}
                  <strong className="text-inkwell">Validación de Identidad</strong>. Solo los perfiles verificados
                  pueden publicar propiedades en la plataforma.
                </p>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePublicar}
                className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all font-semibold text-lg shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
              >
                Publicar mi propiedad — S/ 15.00
              </motion.button>
              <p className="text-center text-sm text-lunar-eclipse mt-4">
                Al continuar, aceptas nuestros{" "}
                <button className="text-primary hover:underline">Términos y Condiciones</button>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ / Contact */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="py-10 bg-gradient-to-br from-au-lait/30 to-white"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl text-inkwell mb-3 font-semibold">¿Tienes preguntas?</h2>
          <p className="text-lunar-eclipse mb-6">
            Escríbenos a{" "}
            <a href="mailto:soporte@allinwasi.pe" className="text-primary hover:underline font-medium">
              soporte@allinwasi.pe
            </a>{" "}
            y te ayudamos.
          </p>
          <button
            onClick={() => router.push("/")}
            className="h-11 px-7 rounded-lg border-2 border-inkwell text-inkwell hover:bg-inkwell/10 transition-all font-medium"
          >
            Volver al inicio
          </button>
        </div>
      </motion.section>
    </div>
  );
}
