"use client";

import Image from "next/image";

export function LoginHero() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-inkwell items-center justify-center p-12 sticky top-0 h-screen overflow-hidden">
      <div className="text-center text-white space-y-8 max-w-lg">
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm p-4 border border-white border-opacity-20 flex items-center justify-center shadow-lg ">
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
          <h2 className="text-5xl mb-4 font-bold">Bienvenido de vuelta</h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Tu <strong>Allin Wasi</strong> (Hogar Seguro) te espera.<br />
            Accede a tu cuenta y continúa gestionando tus propiedades
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20">
          <p className="text-lg opacity-80 italic">
            "Encuentra tu espacio ideal cerca del campus TECSUP"
          </p>
        </div>
      </div>
    </div>
  );
}
