"use client";

import { Home as HomeIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#D0D7C8]/30 py-12 border-t border-[#D0D7C8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#2F4F4F] rounded-lg flex items-center justify-center">
                <HomeIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg text-[#2D3638]">Allin Wasi</span>
            </div>
            <p className="text-sm text-[#2F4F4F]">Tu hogar seguro en Lima</p>
          </div>
          <div>
            <h4 className="text-sm text-[#2D3638] mb-4">Plataforma</h4>
            <ul className="space-y-2">
              <li><a href="#allin-wasi" className="text-sm text-[#2F4F4F] hover:text-[#A37F6E]">Nuestra Misión</a></li>
              <li><a href="#beneficios" className="text-sm text-[#2F4F4F] hover:text-[#A37F6E]">Beneficios</a></li>
              <li><a href="#arrendadores" className="text-sm text-[#2F4F4F] hover:text-[#A37F6E]">Para Arrendadores</a></li>
              <li><a href="/planes" className="text-sm text-[#2F4F4F] hover:text-[#A37F6E]">Planes y Precios</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm text-[#2D3638] mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li className="text-sm text-[#2F4F4F]">soporte@allinwasi.pe</li>
              <li className="text-sm text-[#2F4F4F]">Lima, Perú</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-[#D0D7C8]">
          <p className="text-sm text-[#2F4F4F] text-center">© 2025 Allin Wasi. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
