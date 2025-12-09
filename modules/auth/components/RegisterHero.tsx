"use client";

import Image from "next/image";

export function RegisterHero() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-inkwell items-center justify-center p-12 relative">
      <div className="text-center text-white space-y-8 max-w-lg">
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm p-4 border border-white border-opacity-20 flex items-center justify-center shadow-lg">
            <Image 
              src="/logo.png" 
              alt="Allin Wasi Logo" 
              width={120} 
              height={120}
              className="object-contain rounded-full"
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-5xl mb-4 font-bold">Únete a nuestra comunidad</h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Crea tu cuenta y encuentra tu <strong>Allin Wasi</strong><br />
            (Hogar Seguro) cerca del campus TECSUP
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20">
          <p className="text-lg opacity-80 italic">
            "Tu espacio ideal para una vida estudiantil exitosa"
          </p>
        </div>
      </div>
    </div>
  );
}

