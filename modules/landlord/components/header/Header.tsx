"use client";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";

interface HeaderProps {
  onOpenMenu?: () => void;
  userData?: any;
}

export function Header({ onOpenMenu, userData }: HeaderProps) {
  const { data: session } = useSession();
  
  const u: any = (userData as any)?.user ?? userData;
  const userName = u?.fullName ?? u?.name ?? session?.user?.name ?? "Usuario";
  
  return (
    <div className="flex items-start justify-between gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-au-lait/50">
      <div className="flex items-center gap-3 flex-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-inkwell mb-1">¡Bienvenido(a), {userName}!</h1>
          <p className="text-sm sm:text-base text-lunar-eclipse">Aquí tienes un resumen de tu actividad como arrendador(a)</p>
        </div>
      </div>
    </div>
  );
}
