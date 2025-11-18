"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/ui/card";

export function PropertyCardSkeleton() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-au-lait/50 animate-pulse">
      <CardHeader className="p-0">
        <div className="w-full h-48 bg-au-lait/30 rounded-t-lg" />
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="h-6 bg-au-lait/30 rounded w-3/4" />
        <div className="h-4 bg-au-lait/30 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-8 bg-au-lait/30 rounded w-20" />
          <div className="h-8 bg-au-lait/30 rounded w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-au-lait/50 animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-au-lait/30 rounded w-24" />
            <div className="h-8 bg-au-lait/30 rounded w-16" />
          </div>
          <div className="w-12 h-12 bg-au-lait/30 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-au-lait/30 animate-pulse">
      <div className="w-12 h-12 bg-au-lait/30 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-au-lait/30 rounded w-1/3" />
        <div className="h-3 bg-au-lait/30 rounded w-1/4" />
      </div>
      <div className="h-8 bg-au-lait/30 rounded w-20" />
    </div>
  );
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-au-lait border-t-creme-brulee rounded-full animate-spin`} />
    </div>
  );
}
