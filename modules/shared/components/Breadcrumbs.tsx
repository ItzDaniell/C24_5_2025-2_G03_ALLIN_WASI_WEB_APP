"use client";
import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/ui/button";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={items[0]?.onClick}
        className="h-8 px-2 text-lunar-eclipse hover:text-inkwell hover:bg-au-lait/50"
      >
        <Home className="w-4 h-4" />
      </Button>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-au-lait" />
          {item.active ? (
            <span className="font-medium text-inkwell">{item.label}</span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={item.onClick}
              className="h-8 px-2 text-lunar-eclipse hover:text-inkwell hover:bg-au-lait/50"
            >
              {item.label}
            </Button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
