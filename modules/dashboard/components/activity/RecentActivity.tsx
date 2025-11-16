"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Eye, Users, MessageSquare } from "lucide-react";
import useRecentActivity from "@/modules/dashboard/data/queries/useRecentActivity";
import type { ActivityLog } from "@/types/activityType";

const getIcon = (activity: ActivityLog) => {
  if (activity.entityType === "property" || activity.entityType === "tour360") {
    return <Eye className="w-5 h-5 text-white" />;
  }
  if (activity.entityType === "request") {
    return <Users className="w-5 h-5 text-white" />;
  }
  if (activity.entityType === "message") {
    return <MessageSquare className="w-5 h-5 text-white" />;
  }
  return <Eye className="w-5 h-5 text-white" />;
};

const getBgColor = (activity: ActivityLog) => {
  if (activity.entityType === "property" || activity.entityType === "tour360") {
    return "bg-creme-brulee";
  }
  if (activity.entityType === "request") {
    return "bg-lunar-eclipse";
  }
  if (activity.entityType === "message") {
    return "bg-inkwell";
  }
  return "bg-au-lait";
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function RecentActivity() {
  const { data, isLoading, error } = useRecentActivity(7);

  return (
    <Card className="border-au-lait h-[350px] md:h-[350px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-inkwell">Actividad Reciente</CardTitle>
        <CardDescription className="text-lunar-eclipse">
          Últimas interacciones con tus propiedades en los últimos 7 días
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {isLoading && (
          <p className="text-lunar-eclipse text-sm">Cargando actividad reciente...</p>
        )}

        {error && !isLoading && (
          <p className="text-red-500 text-sm">No se pudo cargar la actividad reciente.</p>
        )}

        {!isLoading && !error && (!data || data.length === 0) && (
          <p className="text-lunar-eclipse text-sm">
            Aún no hay actividad registrada. Cuando recibas vistas, solicitudes o mensajes,
            aparecerán aquí.
          </p>
        )}

        {!isLoading && !error && data && data.length > 0 && (
          <div className="space-y-4">
            {data.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 bg-au-lait rounded-lg"
              >
                <div
                  className={`w-10 h-10 ${getBgColor(
                    activity
                  )} rounded-full flex items-center justify-center`}
                >
                  {getIcon(activity)}
                </div>
                <div className="flex-1">
                  <p className="text-inkwell text-sm">
                    {activity.description}
                  </p>
                  <p className="text-xs text-lunar-eclipse">
                    {formatTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
