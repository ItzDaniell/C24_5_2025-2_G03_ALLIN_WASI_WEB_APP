"use client";
import React from "react";
import { cn } from "@/ui/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badgeCount?: number;
}

export function SidebarItem({ icon, label, active, onClick, badgeCount }: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors justify-between",
        active ? "bg-creme-brulee text-white shadow-sm" : "text-inkwell hover:bg-au-lait"
      )}
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "w-7 h-7 inline-flex items-center justify-center rounded-md",
            active ? "bg-white/20 text-white" : "text-lunar-eclipse"
          )}
        >
          {icon}
        </span>
        <span>{label}</span>
      </span>
      {typeof badgeCount === "number" && badgeCount > 0 && (
        <span className={cn(
          "min-w-5 h-5 px-1 inline-flex items-center justify-center rounded-full text-[10px] font-medium",
          active ? "bg-white/30 text-white" : "bg-creme-brulee text-white"
        )}>
          {badgeCount}
        </span>
      )}
    </button>
  );
}
