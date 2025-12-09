"use client";

import { Eye, MapPin, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export function Benefits() {
  return (
    <section id="beneficios" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl text-inkwell mb-4"
          >
            ¿Por qué elegir Allin Wasi?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-lunar-eclipse max-w-2xl mx-auto"
          >
            Transparencia, seguridad y confianza para estudiantes y arrendadores.
          </motion.p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          <motion.div variants={item} className="border border-au-lait rounded-xl p-8 hover:border-primary transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <Eye className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl text-inkwell mb-3">Visitas 360°</h3>
            <p className="text-lunar-eclipse leading-relaxed"><strong>Transparencia Total.</strong> Arrendadores muestran sus espacios tal como son, estudiantes ven exactamente lo que van a encontrar. Sin sorpresas.</p>
          </motion.div>

          <motion.div variants={item} id="seguridad" className="border border-au-lait rounded-xl p-8 hover:border-primary transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl text-inkwell mb-3">Seguridad y Mapa</h3>
            <p className="text-lunar-eclipse leading-relaxed"><strong>Decisiones Informadas.</strong> Conoce servicios cercanos y alertas de zonas de riesgo en nuestro mapa interactivo antes de decidir.</p>
          </motion.div>

          <motion.div variants={item} id="comunidad" className="border border-au-lait rounded-xl p-8 hover:border-primary transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl text-inkwell mb-3">Comunidad y Confianza</h3>
            <p className="text-lunar-eclipse leading-relaxed"><strong>Comunidad Colaborativa.</strong> Estudiantes comparten experiencias reales, arrendadores construyen reputación. Todos se benefician de la transparencia.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
