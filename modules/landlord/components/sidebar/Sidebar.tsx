"use client";
import React from "react";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Home, Building, MessageSquare, FileText, User as UserIcon, FolderOpen, LogOut, Bot, ChevronLeft, ChevronRight } from "lucide-react";
import useRequests from "@/modules/landlord/data/queries/useRequests";
import useConversations from "@/modules/landlord/data/queries/useConversations";
import { RequestStatus } from "@/types/requestType";
import useMe from "@/modules/auth/data/queries/useMe";
import { Skeleton } from "@/ui/skeleton";

interface SidebarProps {
  current: string;
  onChange: (view: string) => void;
  variant?: "desktop" | "mobile";
  onLogout?: () => void;
  expanded?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ current, onChange, variant = "desktop", onLogout, expanded = true, onToggle }: SidebarProps) {
  const { data: session } = useSession();
  const { data: userData, isLoading: isLoadingUserData } = useMe();
  
  // Usar datos de useMe si están disponibles (más frescos), sino de la sesión
  const u: any = (userData as any)?.user ?? userData;
  const userName = u?.fullName ?? u?.name ?? session?.user?.name ?? "Usuario";
  
  const roleValue = (session as any)?.user?.role;
  const userRole = typeof roleValue === 'string' ? roleValue : (roleValue?.name || "Arrendadora");

  const { data: requests } = useRequests("landlord", RequestStatus.PENDING);
  const { data: conversations } = useConversations();

  const pendingRequestsCount = requests?.filter((r) => r.status === RequestStatus.PENDING).length || 0;
  const unreadMessagesCount = conversations?.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0) || 0;
  const userProfilePicture = (userData as any)?.user?.profilePicture;
  const googleImage = (session?.user as any)?.image;
  const profileImage = userProfilePicture
    ? (userProfilePicture.startsWith("data:") ? userProfilePicture : `data:image/jpeg;base64,${userProfilePicture}`)
    : googleImage || null;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, badge: null as number | null },
    { id: "properties", label: "Mis Propiedades", icon: Building, badge: null as number | null },
    { id: "files", label: "Mis Archivos", icon: FolderOpen, badge: null as number | null },
    { id: "requests", label: "Solicitudes", icon: FileText, badge: pendingRequestsCount > 0 ? pendingRequestsCount : null },
    { id: "messages", label: "Mensajes", icon: MessageSquare, badge: unreadMessagesCount > 0 ? unreadMessagesCount : null },
    { id: "ai-chat", label: "Centro de Ayuda", icon: Bot, badge: null as number | null },
  ];

  return (
    <aside
      className={
        variant === "desktop"
          ? `fixed inset-y-0 left-0 h-screen bg-inkwell shadow-2xl flex flex-col z-50 transition-all duration-300 ${expanded ? 'w-64' : 'w-16'
          }`
          : "w-64 bg-inkwell flex flex-col h-full"
      }
    >
      <div className="p-4 border-b border-white/10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-lg shrink-0">
            <Image
              src="/logo.png"
              alt="Allin Wasi Logo"
              width={40}
              height={40}
              className="object-contain rounded-full"
            />
          </div>
          {expanded && (
            <div className="flex-1 overflow-hidden">
              <h2 className="text-white font-semibold truncate">Allin Wasi</h2>
              <p className="text-sm text-au-lait truncate">Panel de Arrendador</p>
            </div>
          )}
        </div>
        {variant === "desktop" && onToggle && (
          <button
            onClick={onToggle}
            className="absolute -right-3 cursor-pointer top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-creme-brulee to-emerald-600 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all z-10"
            title={expanded ? "Colapsar sidebar" : "Expandir sidebar"}
          >
            {expanded ? (
              <ChevronLeft className="w-3.5 h-3.5 text-white" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full h-11 cursor-pointer transition-all duration-300 relative group ${expanded ? 'justify-start px-4' : 'justify-center'
                } ${isActive
                  ? "bg-gradient-to-r from-creme-brulee to-emerald-500 text-white shadow-md hover:from-creme-brulee hover:to-emerald-500 hover:text-white"
                  : "text-au-lait/70 hover:bg-white/5 hover:text-white"
                }`}
              onClick={() => onChange(item.id)}
              title={item.label}
            >
              <Icon className={`w-5 h-5 shrink-0 ${expanded ? 'mr-3' : ''}`} />
              {expanded && <span className="flex-1 text-left font-medium">{item.label}</span>}
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={`${expanded
                      ? 'static'
                      : 'absolute -top-1 -right-1'
                    } ${isActive
                      ? "bg-white text-creme-brulee font-semibold"
                      : "bg-creme-brulee text-white"
                    }`}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      <div className="p-2 border-t border-white/10 bg-black/10">
        <Button
          variant="ghost"
          className={`w-full h-auto p-3 rounded-lg bg-white/10 mb-3 hover:bg-white/20 cursor-pointer transition-all ${expanded ? 'justify-start' : 'justify-center'
            } ${current === "settings" ? "ring-2 ring-creme-brulee" : ""}`}
          onClick={() => onChange("settings")}
          title="Configuración"
        >
          {isLoadingUserData ? (
            <>
              <Skeleton className="w-10 h-10 rounded-full shrink-0 bg-white/20" />
              {expanded && (
                <div className="flex-1 ml-3 space-y-2 overflow-hidden">
                  <Skeleton className="h-4 w-24 bg-white/20" />
                  <Skeleton className="h-3 w-16 bg-white/20" />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg overflow-hidden bg-creme-brulee">
                {profileImage ? (
                  profileImage.startsWith('data:') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profileImage}
                      alt="Foto de perfil"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Image
                      src={profileImage}
                      alt="Foto de perfil"
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  )
                ) : (
                  <UserIcon className="w-5 h-5 text-white" />
                )}
              </div>
              {expanded && (
                <div className="flex-1 text-left ml-3 overflow-hidden">
                  <p className="text-white font-medium truncate">{userName}</p>
                  <p className="text-sm text-au-lait truncate">{userRole == 'landlord' ? 'Arrendador' : 'Arrendadora'}</p>
                </div>
              )}
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          className={`w-full h-12 text-white hover:bg-red-500/20 hover:text-red-300 border border-white/20 cursor-pointer transition-all ${expanded ? 'justify-start' : 'justify-center'
            }`}
          onClick={() => (onLogout ? onLogout() : signOut({ callbackUrl: '/' }))}
          title="Cerrar Sesión"
        >
          <LogOut className={`w-5 h-5 shrink-0 ${expanded ? 'mr-3' : ''}`} />
          {expanded && <span className="flex-1 text-left font-medium">Cerrar Sesión</span>}
        </Button>
      </div>
    </aside>
  );
}
