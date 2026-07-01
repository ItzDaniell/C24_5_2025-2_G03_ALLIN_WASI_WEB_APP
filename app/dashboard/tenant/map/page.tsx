"use client";
import React from "react";
import dynamic from "next/dynamic";

// Load the map component dynamically with ssr: false to avoid hydration issues
const InteractiveMap = dynamic(() => import("@/modules/tenant/components/InteractiveMap").then(mod => mod.InteractiveMap), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[560px] bg-slate-50 rounded-[2rem]">
      <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
      <span className="ml-4 text-sm font-semibold text-slate-400">Cargando mapa...</span>
    </div>
  )
});

export default function TenantMapPage() {
  return <InteractiveMap rooms={[]} />;
}
