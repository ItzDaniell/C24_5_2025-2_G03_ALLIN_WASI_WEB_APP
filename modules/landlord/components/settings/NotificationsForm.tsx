"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
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

  const [receiveNewRequests, setReceiveNewRequests] = React.useState<boolean>(false);
  const [receiveNewMessages, setReceiveNewMessages] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState(false);
  const initialRef = React.useRef<{ receiveNewRequests: boolean; receiveNewMessages: boolean }>({
    receiveNewRequests: false,
    receiveNewMessages: false,
  });

  React.useEffect(() => {
    if (!isLoading) {
      setReceiveNewRequests(!!notif?.receiveNewRequests);
      setReceiveNewMessages(!!notif?.receiveNewMessages);
      initialRef.current = {
        receiveNewRequests: !!notif?.receiveNewRequests,
        receiveNewMessages: !!notif?.receiveNewMessages,
      };
    }
  }, [isLoading, notif]);

  const onSave = async () => {
    try {
      setSaving(true);
      await axiosInstance.put("/api/users/me", {
        notificationSettings: {
          receiveNewRequests,
          receiveNewMessages,
        },
      }, { headers: { "Content-Type": "application/json" } });
      toast.success("Preferencias guardadas");
      refetch();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || "No se pudieron guardar las preferencias";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const isDirty =
    receiveNewRequests !== initialRef.current.receiveNewRequests ||
    receiveNewMessages !== initialRef.current.receiveNewMessages;

  return (
    <Card className="border-au-lait">
      <CardHeader>
        <CardTitle className="text-inkwell">Notificaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center gap-3 text-inkwell">
          <Checkbox checked={receiveNewRequests} onCheckedChange={(v) => setReceiveNewRequests(Boolean(v))} />
          <span>Recibir avisos por correo</span>
        </label>
        <label className="flex items-center gap-3 text-inkwell">
          <Checkbox checked={receiveNewMessages} onCheckedChange={(v) => setReceiveNewMessages(Boolean(v))} />
          <span>Recibir mensajes de interesados</span>
        </label>
        <Button
          variant="outline"
          className={`border-au-lait ${isDirty ? "text-inkwell" : "text-lunar-eclipse cursor-not-allowed opacity-70"}`}
          onClick={onSave}
          disabled={!isDirty || saving}
        >
          {saving ? "Guardando..." : "Guardar preferencias"}
        </Button>
      </CardContent>
    </Card>
  );
}
