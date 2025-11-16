"use client";
import { TrendingUp, DollarSign, Building, FileText, MessageSquare } from "lucide-react";
import { StatCard } from "./StatCard";
import useRequests from "@/modules/dashboard/data/queries/useRequests";
import useConversations from "@/modules/dashboard/data/queries/useConversations";
import { RequestStatus } from "@/types/requestType";

export function StatsGrid({
  totalProperties,
  available,
  rented,
  reserved,
  draft,
  incomeLabel = "S/—",
}: {
  totalProperties: number;
  available: number;
  rented: number;
  reserved: number;
  draft: number;
  incomeLabel?: string;
}) {
  // Obtener datos reales de requests y messages
  const { data: requests } = useRequests("landlord", RequestStatus.PENDING);
  const { data: conversations } = useConversations();
  
  const requestsLabel = String(requests?.filter((r) => r.status === RequestStatus.PENDING).length || 0);
  const messagesLabel = String(conversations?.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0) || 0);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Ingresos este mes"
        value={incomeLabel}
        subtitle={
          <p className="text-xs text-creme-brulee flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            Actualizado
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
        value={String(totalProperties)}
        subtitle={<p className="text-xs text-lunar-eclipse mt-1">{rented} alquiladas, {available} disponibles, {reserved} reservadas, {draft} borradores</p>}
        iconSlot={
          <div className="w-12 h-12 bg-lunar-eclipse rounded-xl flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
        }
      />

      <StatCard
        title="Nuevas solicitudes"
        value={requestsLabel}
        subtitle={<p className="text-xs text-inkwell mt-1">Requieren atención</p>}
        iconSlot={
          <div className="w-12 h-12 bg-inkwell rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
        }
      />

      <StatCard
        title="Mensajes nuevos"
        value={messagesLabel}
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
