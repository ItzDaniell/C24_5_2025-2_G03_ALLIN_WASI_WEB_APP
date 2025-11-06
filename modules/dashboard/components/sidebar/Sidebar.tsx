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
  Plus,
  Settings,
  User as UserIcon,
  FolderOpen,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  current: string;
  onChange: (view: string) => void;
  variant?: "desktop" | "mobile";
  onLogout?: () => void;
}

export function Sidebar({ current, onChange, variant = "desktop", onLogout }: SidebarProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "Usuario";
  const userRole = (session as any)?.user?.role ?? "Arrendadora";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, badge: null as number | null },
    { id: "properties", label: "Mis Propiedades", icon: Building, badge: null as number | null },
    { id: "files", label: "Mis Archivos", icon: FolderOpen, badge: null as number | null },
    { id: "create-property", label: "Nueva Propiedad", icon: Plus, badge: null as number | null },
    { id: "settings", label: "Configuración", icon: Settings, badge: null as number | null },
  ];

  return (
    <aside
      className={
        variant === "desktop"
          ? "hidden lg:flex fixed inset-y-0 left-0 w-64 h-screen bg-white border-r border-au-lait flex-col"
          : "w-64 bg-white flex flex-col h-full"
      }
    >
      {/* Header */}
      <div className="p-6 border-b border-au-lait">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-creme-brulee rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-inkwell">RoomFinder</h2>
            <p className="text-sm text-lunar-eclipse">Panel de Arrendador</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-12 ${
                isActive
                  ? "bg-creme-brulee text-white shadow-lg hover:bg-creme-brulee hover:bg-opacity-90"
                  : "text-lunar-eclipse hover:bg-au-lait"
              }`}
              onClick={() => onChange(item.id)}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={`${isActive ? "bg-white text-creme-brulee" : "bg-creme-brulee text-white"}`}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-au-lait">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-au-lait mb-3">
          <div className="w-10 h-10 bg-creme-brulee rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-inkwell">{userName}</p>
            <p className="text-sm text-lunar-eclipse">{userRole == 'landlord' ? 'Arrendador' : 'Arrendadora'}</p>
          </div>
        </div>

        {/* Botón Cerrar Sesión */}
        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-inkwell hover:bg-au-lait border-2 border-au-lait"
          onClick={() => (onLogout ? onLogout() : signOut())}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="flex-1 text-left">Cerrar Sesión</span>
        </Button>
      </div>
    </aside>
  );
}
