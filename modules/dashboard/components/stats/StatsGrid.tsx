"use client";
import { TrendingUp, DollarSign, Building, FileText, MessageSquare } from "lucide-react";
import { StatCard } from "./StatCard";

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Ingresos este mes"
        value="S/12,450"
        subtitle={
          <p className="text-xs text-creme-brulee flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            +8.5% vs mes anterior
          </p>
        }
        iconSlot={
          <div className="w-12 h-12 bg-creme-brulee rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        }
      />

      <StatCard
        title="Propiedades activas"
        value="8"
        subtitle={<p className="text-xs text-lunar-eclipse mt-1">6 alquiladas, 2 disponibles</p>}
        iconSlot={
          <div className="w-12 h-12 bg-lunar-eclipse rounded-xl flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
        }
      />

      <StatCard
        title="Nuevas solicitudes"
        value="5"
        subtitle={<p className="text-xs text-inkwell mt-1">Requieren atención</p>}
        iconSlot={
          <div className="w-12 h-12 bg-inkwell rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
        }
      />

      <StatCard
        title="Mensajes nuevos"
        value="3"
        subtitle={<p className="text-xs text-creme-brulee mt-1">Sin leer</p>}
        iconSlot={
          <div className="w-12 h-12 bg-creme-brulee rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
        }
      />
    </div>
  );
}
