"use client";
import React from "react";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  Building,
  MessageSquare,
  FileText,
  User as UserIcon,
  FolderOpen,
  LogOut,
  Bot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useRequests from "@/modules/dashboard/data/queries/useRequests";
import useConversations from "@/modules/dashboard/data/queries/useConversations";
import { RequestStatus } from "@/types/requestType";

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
  const userName = session?.user?.name ?? "Usuario";
  const roleValue = (session as any)?.user?.role;
  const userRole = typeof roleValue === 'string' ? roleValue : (roleValue?.name || "Arrendadora");

  const { data: requests } = useRequests("landlord", RequestStatus.PENDING);
  const { data: conversations } = useConversations();
  
  const pendingRequestsCount = requests?.filter((r) => r.status === RequestStatus.PENDING).length || 0;
  const unreadMessagesCount = conversations?.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0) || 0;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, badge: null as number | null },
    { id: "properties", label: "Mis Propiedades", icon: Building, badge: null as number | null },
    { id: "files", label: "Mis Archivos", icon: FolderOpen, badge: null as number | null },
    { id: "requests", label: "Solicitudes", icon: FileText, badge: pendingRequestsCount > 0 ? pendingRequestsCount : null },
    { id: "messages", label: "Mensajes", icon: MessageSquare, badge: unreadMessagesCount > 0 ? unreadMessagesCount : null },
    { id: "ai-chat", label: "Chats IA", icon: Bot, badge: null as number | null },
  ];

  return (
    <aside
      className={
        variant === "desktop"
          ? `fixed inset-y-0 left-0 h-screen bg-gradient-to-b from-inkwell to-lunar-eclipse shadow-2xl flex flex-col z-50 transition-all duration-300 ${
              expanded ? 'w-64' : 'w-16'
            }`
          : "w-64 bg-gradient-to-b from-inkwell to-lunar-eclipse flex flex-col h-full"
      }
    >
      <div className="p-4 border-b border-white/10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-creme-brulee rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
            <Home className="w-5 h-5 text-white" />
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
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-creme-brulee rounded-full flex items-center justify-center shadow-lg hover:bg-creme-brulee/90 transition-colors z-10"
            title={expanded ? "Colapsar sidebar" : "Expandir sidebar"}
          >
            {expanded ? (
              <ChevronLeft className="w-4 h-4 text-white" />
            ) : (
              <ChevronRight className="w-4 h-4 text-white" />
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
              className={`w-full h-12 cursor-pointer transition-all relative ${
                expanded ? 'justify-start' : 'justify-center'
              } ${
                isActive
                  ? "bg-creme-brulee text-white shadow-lg hover:bg-creme-brulee hover:shadow-xl"
                  : "text-au-lait hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => onChange(item.id)}
              title={item.label}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${expanded ? 'mr-3' : ''}`} />
              {expanded && <span className="flex-1 text-left font-medium">{item.label}</span>}
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={`${
                    expanded 
                      ? 'static' 
                      : 'absolute -top-1 -right-1'
                  } ${
                    isActive 
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
          className={`w-full h-auto p-3 rounded-lg bg-white/10 mb-3 hover:bg-white/20 cursor-pointer transition-all ${
            expanded ? 'justify-start' : 'justify-center'
          } ${current === "settings" ? "ring-2 ring-creme-brulee" : ""}`}
          onClick={() => onChange("settings")}
          title="Configuración"
        >
          <div className="w-10 h-10 bg-creme-brulee rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          {expanded && (
            <div className="flex-1 text-left ml-3 overflow-hidden">
              <p className="text-white font-medium truncate">{userName}</p>
              <p className="text-sm text-au-lait truncate">{userRole == 'landlord' ? 'Arrendador' : 'Arrendadora'}</p>
            </div>
          )}
        </Button>

        <Button
          variant="ghost"
          className={`w-full h-12 text-white hover:bg-red-500/20 hover:text-red-300 border border-white/20 cursor-pointer transition-all ${
            expanded ? 'justify-start' : 'justify-center'
          }`}
          onClick={() => (onLogout ? onLogout() : signOut())}
          title="Cerrar Sesión"
        >
          <LogOut className={`w-5 h-5 flex-shrink-0 ${expanded ? 'mr-3' : ''}`} />
          {expanded && <span className="flex-1 text-left font-medium">Cerrar Sesión</span>}
        </Button>
      </div>
    </aside>
  );
}
