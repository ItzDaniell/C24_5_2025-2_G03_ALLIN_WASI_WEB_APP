"use client";
import React from "react";
import { Button } from "@/ui/button";
import { Bot, Sparkles } from "lucide-react";

interface AiChatFabProps {
  onClick: () => void;
}

export function AiChatFab({ onClick }: AiChatFabProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-creme-brulee text-white hover:bg-creme-brulee/90 shadow-lg hover:shadow-xl transition-all z-50 flex items-center justify-center p-0 hover:animate-bounce"
      aria-label="Abrir chat con IA"
    >
      <div className="relative">
        <Bot className="w-6 h-6" />
        <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-200" />
      </div>
    </Button>
  );
}

