"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Bell, Mail, MessageSquare } from "lucide-react";
import useMe from "@/modules/auth/data/queries/useMe";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export function NotificationsForm() {
  const { data, isLoading, refetch } = useMe();
  const notif = React.useMemo(() => {
    const ns = (data as any)?.user?.notificationSettings;
    if (typeof ns === "string") {
      try { return JSON.parse(ns); } catch { return {}; }
    }
    return ns || {};
  }, [data]);

  const [receiveEmail, setReceiveEmail] = React.useState<boolean>(false);
  const [receiveMessages, setReceiveMessages] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading) {
      setReceiveEmail(!!notif?.receiveEmail);
      setReceiveMessages(!!notif?.receiveMessages);
    }
  }, [isLoading, notif]);

  const onSave = async () => {
    try {
      setSaving(true);
      await axiosInstance.put("/api/users/me", {
        notificationSettings: {
          receiveEmail,
          receiveMessages,
        },
      });
      toast.success("Preferencias guardadas");
      refetch();
    } catch (e: any) {
      toast.error("Error al guardar preferencias");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-au-lait shadow-sm rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-inkwell flex items-center gap-2">
          <Bell className="w-5 h-5 text-creme-brulee" />
          Notificaciones
        </CardTitle>
        <CardDescription>Controla cómo y cuándo quieres recibir noticias de Allin Wasi.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-creme-brulee/20 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-inkwell text-sm">Avisos por correo</p>
              <p className="text-xs text-slate-500">Recibe actualizaciones sobre tus solicitudes.</p>
            </div>
          </div>
          <Checkbox checked={receiveEmail} onCheckedChange={(v) => setReceiveEmail(Boolean(v))} className="rounded-md border-slate-300 data-[state=checked]:bg-emerald-600" />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-creme-brulee/20 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-inkwell text-sm">Mensajes de Arrendadores</p>
              <p className="text-xs text-slate-500">Notificaciones de nuevos mensajes en el chat.</p>
            </div>
          </div>
          <Checkbox checked={receiveMessages} onCheckedChange={(v) => setReceiveMessages(Boolean(v))} className="rounded-md border-slate-300 data-[state=checked]:bg-emerald-600" />
        </div>

        <Button
          variant="outline"
          className="w-full sm:w-auto h-11 px-8 rounded-xl border-au-lait font-bold text-inkwell hover:bg-slate-50"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar Preferencias"}
        </Button>
      </CardContent>
    </Card>
  );
}
