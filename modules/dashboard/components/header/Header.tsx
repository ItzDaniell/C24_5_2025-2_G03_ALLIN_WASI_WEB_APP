"use client";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";

interface HeaderProps {
  onOpenMenu?: () => void;
}

export function Header({ onOpenMenu }: HeaderProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Usuario";
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={onOpenMenu}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-inkwell hover:bg-au-lait"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="mb-2 text-inkwell">¡Bienvenido(a), {userName}!</h1>
          <p className="text-lunar-eclipse">Aquí tienes un resumen de tu actividad como arrendador(a)</p>
        </div>
      </div>
    </div>
  );
}
