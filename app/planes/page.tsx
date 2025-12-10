"use client";

import { useRouter } from "next/navigation";
import { Check, ArrowLeft, Shield, ArrowRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function PlanesPage() {
  const router = useRouter();

  const handleSelectPlan = (plan: 'basic' | 'featured') => {
    sessionStorage.setItem('selectedPlan', plan);
    router.push("/register");
  };

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

      {/* Hero Section */}
      <section className="relative py-8 md:py-12 bg-gradient-to-br from-indigo-50/20 via-white to-emerald-50/10">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/30 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl text-inkwell mb-4 font-bold"
          >
            Planes para Arrendadores Verificados
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-xl text-lunar-eclipse max-w-3xl mx-auto"
          >
            Elige el plan que necesitas para empezar a alquilar. Únete a la única comunidad segura para estudiantes de TECSUP.
          </motion.p>
        </div>
      </section>

      {/* Security Banner */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="py-5 bg-primary/5 border-y border-primary/20"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-inkwell mb-1">
                🛡️ Compromiso de Seguridad
              </h3>
              <p className="text-lunar-eclipse">
                En <strong className="text-inkwell">Allin Wasi</strong>, cuidamos la calidad de nuestra oferta. El pago de la suscripción incluye el proceso de <strong className="text-inkwell">Validación de Identidad</strong>. Solo los perfiles verificados podrán publicar.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Pricing Cards */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Plan Básico */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="border-2 border-au-lait rounded-2xl p-8 hover:border-primary transition-all hover:shadow-xl bg-white group"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl text-inkwell mb-2 font-semibold">Plan Básico</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl text-primary font-bold">S/ 10.00</span>
                </div>
                <p className="text-sm text-primary font-semibold mb-3">Por habitación</p>
                <p className="text-lunar-eclipse">
                  Ideal para arrendadores con poca rotación que buscan presencia digital básica.
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-lunar-eclipse">
                    <strong className="text-inkwell">✅ Validación de Identidad</strong>
                    <span className="text-lunar-eclipse/70 text-sm block">Seguridad para ti y el alumno</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-au-lait rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-lunar-eclipse">Publicación de anuncio estándar</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-au-lait rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-lunar-eclipse">Gestión de solicitudes</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-au-lait rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-lunar-eclipse">Chat con inquilinos</span>
                </li>
              </ul>

              <button
                onClick={() => handleSelectPlan('basic')}
                className="w-full h-14 rounded-lg border-2 border-inkwell text-inkwell hover:bg-inkwell hover:text-white transition-all font-medium group-hover:border-primary group-hover:text-primary group-hover:hover:bg-primary group-hover:hover:text-white"
              >
                Empezar Verificación y Registro
              </button>
            </motion.div>

            {/* Plan Destacado */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="border-2 border-primary rounded-2xl p-8 relative hover:shadow-2xl transition-all bg-gradient-to-br from-white to-primary/5"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg"
              >
                ⭐ Recomendado
              </motion.div>

              <div className="text-center mb-8">
                <h3 className="text-2xl text-inkwell mb-2 font-semibold">Plan Destacado</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl text-primary font-bold">S/ 20.00</span>
                </div>
                <p className="text-sm text-primary font-semibold mb-3">Por habitación</p>
                <p className="text-lunar-eclipse">
                  Diseñado para arrendadores que desean alquilar sus espacios con mayor rapidez.
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-lunar-eclipse">
                    <strong className="text-inkwell">✅ Validación de Identidad Prioritaria</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-lunar-eclipse">
                    <strong className="text-inkwell">Posicionamiento prioritario</strong> (Top Listing)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-lunar-eclipse">Métricas de visualización</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-lunar-eclipse">Gestión de solicitudes y Chat</span>
                </li>
              </ul>

              <button
                onClick={() => handleSelectPlan('featured')}
                className="w-full h-14 rounded-lg bg-primary hover:bg-primary/90 text-white transition-all font-medium shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
              >
                Empezar Verificación y Registro
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ or Additional Info */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="py-5 bg-gradient-to-br from-au-lait/30 to-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl text-inkwell mb-6 font-semibold">¿Tienes preguntas?</h2>
          <p className="text-lg text-lunar-eclipse mb-8">
            Contáctanos en <a href="mailto:soporte@allinwasi.pe" className="text-primary hover:underline font-medium">soporte@allinwasi.pe</a> y te ayudaremos a elegir el mejor plan para ti.
          </p>
          <button
            onClick={() => router.push("/")}
            className="h-12 px-8 rounded-lg border-2 border-inkwell text-inkwell hover:bg-inkwell hover:text-white transition-all font-medium"
          >
            Volver al inicio
          </button>
        </div>
      </motion.section>
    </div>
  );
}
