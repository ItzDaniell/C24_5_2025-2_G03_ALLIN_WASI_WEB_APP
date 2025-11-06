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
    <Card className="bg-white border-au-lait">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-lunar-eclipse">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-inkwell">{value}</div>
            {subtitle}
          </div>
          {iconSlot}
        </div>
      </CardContent>
    </Card>
  );
}
