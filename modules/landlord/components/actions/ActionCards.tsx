"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Building, MessageSquare, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import useRequests from "@/modules/landlord/data/queries/useRequests";
import useConversations from "@/modules/landlord/data/queries/useConversations";
import { RequestStatus } from "@/types/requestType";
import { Skeleton } from "@/ui/skeleton";

interface ActionCardsProps {
  publishedCount?: number;
  draftCount?: number;
}

export function ActionCards({ publishedCount = 0, draftCount = 0 }: ActionCardsProps) {
  const router = useRouter();
  // Obtener datos reales
  const { data: requests, isLoading: isLoadingRequests } = useRequests("landlord");
  const { data: conversations, isLoading: isLoadingConversations } = useConversations();

  const isLoading = isLoadingRequests || isLoadingConversations;

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 bg-au-lait/30 rounded-xl" />
        <Skeleton className="h-64 bg-au-lait/30 rounded-xl" />
        <Skeleton className="h-64 bg-au-lait/30 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-au-lait/50 bg-white/80 backdrop-blur-sm overflow-hidden group" onClick={() => router.push('/dashboard/landlord/properties')}>
        <div className="absolute inset-0 bg-creme-brulee/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-inkwell font-semibold">Mis Propiedades</CardTitle>
              <CardDescription className="text-lunar-eclipse">Gestiona tus anuncios y propiedades</CardDescription>
            </div>
            <div className="w-12 h-12 bg-creme-brulee rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-au-lait/30 transition-colors">
              <span className="text-sm font-medium text-lunar-eclipse">Publicadas</span>
              <Badge variant="secondary" className="bg-lunar-eclipse/10 text-lunar-eclipse font-semibold">{publishedCount}</Badge>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-au-lait/30 transition-colors">
              <span className="text-sm font-medium text-lunar-eclipse">Borradores</span>
              <Badge variant="secondary" className="bg-au-lait text-inkwell font-semibold">{draftCount}</Badge>
            </div>
            <Button className="w-full mt-4 bg-creme-brulee hover:bg-creme-brulee/90 text-white shadow-md hover:shadow-lg transition-all">Ver todas</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-au-lait/50 bg-white/80 backdrop-blur-sm overflow-hidden group" onClick={() => router.push('/dashboard/landlord/messages')}>
        <div className="absolute inset-0 bg-lunar-eclipse/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-inkwell font-semibold">Nuevos Mensajes</CardTitle>
              <CardDescription className="text-lunar-eclipse">Conversa con inquilinos interesados</CardDescription>
            </div>
            <div className="w-12 h-12 bg-lunar-eclipse rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
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
                  <div key={conv.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-au-lait/30 transition-colors">
                    <div className="w-8 h-8 bg-creme-brulee rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-semibold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-inkwell">{userName}</p>
                      <p className="text-xs text-lunar-eclipse truncate">
                        {conv.lastMessage?.content || "Sin mensajes"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-lunar-eclipse text-center py-4">No hay mensajes nuevos</p>
            )}
            <Button variant="outline" className="w-full mt-4 border-lunar-eclipse/30 text-inkwell hover:bg-lunar-eclipse/10 transition-all">Ver todos los mensajes</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-au-lait/50 bg-white/80 backdrop-blur-sm overflow-hidden group" onClick={() => router.push('/dashboard/landlord/requests')}>
        <div className="absolute inset-0 bg-inkwell/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-inkwell font-semibold">Solicitudes Pendientes</CardTitle>
              <CardDescription className="text-lunar-eclipse">Revisa y aprueba solicitudes</CardDescription>
            </div>
            <div className="w-12 h-12 bg-inkwell rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-au-lait/30 transition-colors">
              <span className="text-sm font-medium text-lunar-eclipse">Pendientes</span>
              <Badge variant="secondary" className="bg-creme-brulee/20 text-creme-brulee font-semibold">{pendingRequests}</Badge>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-au-lait/30 transition-colors">
              <span className="text-sm font-medium text-lunar-eclipse">En revisión</span>
              <Badge variant="secondary" className="bg-creme-brulee/20 text-creme-brulee font-semibold">{inReviewRequests}</Badge>
            </div>
            <Button className="w-full mt-4 bg-inkwell hover:bg-lunar-eclipse text-white shadow-md hover:shadow-lg transition-all">Revisar solicitudes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
