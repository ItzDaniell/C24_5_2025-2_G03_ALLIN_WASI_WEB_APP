"use client";
import React from "react";
import { Button } from "@/ui/button";
import { ArrowLeft } from "lucide-react";

interface ViewHeaderProps {
  title: string;
  description?: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

export function ViewHeader({ title, description, onBack, action }: ViewHeaderProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-au-lait/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="mt-1 hover:bg-au-lait/50 text-inkwell"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-inkwell mb-1">{title}</h1>
            {description && (
              <p className="text-sm sm:text-base text-lunar-eclipse">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
