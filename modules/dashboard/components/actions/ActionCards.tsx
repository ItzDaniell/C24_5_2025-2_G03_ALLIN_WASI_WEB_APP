"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Building, MessageSquare, FileText } from "lucide-react";
import useRequests from "@/modules/dashboard/data/queries/useRequests";
import useConversations from "@/modules/dashboard/data/queries/useConversations";
import { RequestStatus } from "@/types/requestType";

interface ActionCardsProps {
  onViewChange: (view: string) => void;
  publishedCount?: number;
  draftCount?: number;
}

export function ActionCards({ onViewChange, publishedCount = 0, draftCount = 0 }: ActionCardsProps) {
  // Obtener datos reales
  const { data: requests } = useRequests("landlord");
  const { data: conversations } = useConversations();
  
  const pendingRequests = requests?.filter((r) => r.status === RequestStatus.PENDING).length || 0;
  const inReviewRequests = requests?.filter((r) => r.status === RequestStatus.ACCEPTED).length || 0;
  
  // Obtener últimas conversaciones con mensajes
  const recentConversations = conversations
    ?.filter((c) => c.lastMessage)
    .sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 2) || [];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow border-au-lait" onClick={() => onViewChange('properties')}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-inkwell">Mis Propiedades</CardTitle>
              <CardDescription className="text-lunar-eclipse">Gestiona tus anuncios y propiedades</CardDescription>
            </div>
            <div className="w-12 h-12 bg-creme-brulee rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-lunar-eclipse">Publicadas</span>
              <Badge variant="secondary" className="bg-lunar-eclipse bg-opacity-10 text-lunar-eclipse">{publishedCount}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-lunar-eclipse">Borradores</span>
              <Badge variant="secondary" className="bg-au-lait text-inkwell">{draftCount}</Badge>
            </div>
            <Button className="w-full mt-4 bg-creme-brulee hover:bg-opacity-90">Ver todas</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow border-au-lait" onClick={() => onViewChange('messages')}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-inkwell">Nuevos Mensajes</CardTitle>
              <CardDescription className="text-lunar-eclipse">Conversa con inquilinos interesados</CardDescription>
            </div>
            <div className="w-12 h-12 bg-lunar-eclipse rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentConversations.length > 0 ? (
              recentConversations.map((conv) => {
                const participant = conv.participants?.find((p) => p.user?.fullName);
                const userName = participant?.user?.fullName || "Usuario";
                const initials = userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div key={conv.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-creme-brulee rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">{initials}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-inkwell">{userName}</p>
                      <p className="text-xs text-lunar-eclipse truncate">
                        {conv.lastMessage?.content || "Sin mensajes"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-lunar-eclipse">No hay mensajes nuevos</p>
            )}
            <Button variant="outline" className="w-full mt-4 border-au-lait text-inkwell hover:bg-au-lait">Ver todos los mensajes</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow border-au-lait" onClick={() => onViewChange('requests')}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-inkwell">Solicitudes Pendientes</CardTitle>
              <CardDescription className="text-lunar-eclipse">Revisa y aprueba solicitudes</CardDescription>
            </div>
            <div className="w-12 h-12 bg-inkwell rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-lunar-eclipse">Pendientes</span>
              <Badge variant="secondary" className="bg-creme-brulee bg-opacity-20 text-creme-brulee">{pendingRequests}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-lunar-eclipse">En revisión</span>
              <Badge variant="secondary" className="bg-creme-brulee bg-opacity-20 text-creme-brulee">{inReviewRequests}</Badge>
            </div>
            <Button className="w-full mt-4 bg-inkwell hover:bg-lunar-eclipse text-white">Revisar solicitudes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
