"use client";
import { Button } from "@/ui/button";
import { Bot, Sparkles, Menu } from "lucide-react";

interface HeaderProps {
  onOpenAiChat: () => void;
  onOpenMenu?: () => void;
}

export function Header({ onOpenAiChat, onOpenMenu }: HeaderProps) {
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
          <h1 className="mb-2 text-inkwell">¡Bienvenida, María!</h1>
          <p className="text-lunar-eclipse">Aquí tienes un resumen de tu actividad como arrendadora</p>
        </div>
      </div>
      <Button
        onClick={onOpenAiChat}
        className="bg-creme-brulee text-white hover:bg-opacity-90 transition-all flex items-center gap-2"
      >
        <Bot className="w-4 h-4" />
        <Sparkles className="w-4 h-4" />
        Chat IA
      </Button>
    </div>
  );
}
