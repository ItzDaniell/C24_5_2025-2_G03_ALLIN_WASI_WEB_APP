"use client";

import { Home as HomeIcon } from "lucide-react";

type Props = {
  isAuthenticated: boolean;
  userImage?: string | null;
  userName?: string | null;
  userInitials: string;
  onLogin: () => void;
  onRegister: () => void;
};

export function Header({
  isAuthenticated,
  userImage,
  userName,
  userInitials,
  onLogin,
  onRegister,
}: Props) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#2F4F4F] rounded-xl flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl md:text-2xl text-[#2D3638]">TECSUP Housing</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-[#2F4F4F] hover:text-[#A37F6E] transition-colors">Cómo Funciona</a>
            <a href="#seguridad" className="text-[#2F4F4F] hover:text-[#A37F6E] transition-colors">Seguridad</a>
            <a href="#comunidad" className="text-[#2F4F4F] hover:text-[#A37F6E] transition-colors">Comunidad</a>
          </nav>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName ?? "Usuario"}
                  className="w-9 h-9 rounded-full object-cover border border-[#D0D7C8]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#A37F6E] text-white flex items-center justify-center text-sm">
                  {userInitials}
                </div>
              )}
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </header>
  );
}
