"use client";

import { Quote } from "lucide-react";
import { motion } from "framer-motion";

export function AllinWasiMeaning() {
  return (
    <section id="allin-wasi" className="py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#D0D7C8]/20 via-transparent to-transparent" />
      
      <div className="max-w-4xl mx-auto px-4 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#2D3638] mb-6 tracking-tight">
            ¿Qué significa Allin Wasi?
          </h2>
          <div className="flex items-center justify-center gap-4 text-xl md:text-2xl text-[#A37F6E] font-medium italic">
            <span>/a.ʎin wa.si/</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D0D7C8]" />
            <span>Quechua</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#F8FAF9] p-8 rounded-2xl border border-[#D0D7C8]/50 hover:border-[#A37F6E]/30 transition-colors"
          >
            <h3 className="text-lg font-semibold text-[#2D3638] mb-2 flex items-center gap-2">
              <span className="text-[#A37F6E]">1.</span> Hogar Bueno
            </h3>
            <p className="text-[#2F4F4F]">
              Un espacio que ofrece bienestar, comodidad y calidad de vida.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#F8FAF9] p-8 rounded-2xl border border-[#D0D7C8]/50 hover:border-[#A37F6E]/30 transition-colors"
          >
            <h3 className="text-lg font-semibold text-[#2D3638] mb-2 flex items-center gap-2">
              <span className="text-[#A37F6E]">2.</span> Hogar Seguro
            </h3>
            <p className="text-[#2F4F4F]">
              Un refugio donde prima la confianza, la protección y la tranquilidad.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative bg-[#2D3638] rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-xl"
        >
          <Quote className="absolute top-6 left-6 w-12 h-12 text-white/10 rotate-180" />
          <div className="relative z-10 text-center space-y-6">
            <h3 className="text-xl font-semibold text-[#D0D7C8]">Nuestra Misión</h3>
            <p className="text-lg md:text-xl leading-relaxed text-white/90 font-light">
              "Elegimos este nombre porque encapsula nuestro propósito: construir una plataforma basada en la <span className="text-[#A37F6E] font-medium">confianza</span> y la <span className="text-[#A37F6E] font-medium">autenticidad</span>. Conectamos estudiantes con arrendadores que ofrecen espacios genuinos, creando relaciones transparentes donde ambas partes se sienten seguras."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
