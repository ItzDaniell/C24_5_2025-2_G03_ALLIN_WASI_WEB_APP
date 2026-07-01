"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: React.ReactNode;
  iconSlot: React.ReactNode;
}

export function StatCard({ title, value, subtitle, iconSlot }: StatCardProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-au-lait/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-lunar-eclipse">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-inkwell">{value}</div>
            {subtitle}
          </div>
          <div className="transform transition-transform hover:scale-110">
            {iconSlot}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
