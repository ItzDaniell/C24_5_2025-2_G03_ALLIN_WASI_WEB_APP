"use client";

import { Home as HomeIcon } from "lucide-react";

export function Footer() {
  return (
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
  );
}
