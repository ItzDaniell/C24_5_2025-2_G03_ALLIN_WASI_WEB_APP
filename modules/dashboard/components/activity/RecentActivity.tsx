"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Eye, Users, MessageSquare } from "lucide-react";

export function RecentActivity() {
  return (
    <Card className="border-au-lait">
      <CardHeader>
        <CardTitle className="text-inkwell">Actividad Reciente</CardTitle>
        <CardDescription className="text-lunar-eclipse">Últimas interacciones con tus propiedades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-au-lait rounded-lg">
            <div className="w-10 h-10 bg-creme-brulee rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-inkwell">Nueva visualización del tour 360°</p>
              <p className="text-sm text-lunar-eclipse">Habitación en Santa Anita - hace 2 horas</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-au-lait rounded-lg">
            <div className="w-10 h-10 bg-lunar-eclipse rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-inkwell">Nueva solicitud de alquiler</p>
              <p className="text-sm text-lunar-eclipse">Apartamento cerca de UNALM - hace 4 horas</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-au-lait rounded-lg">
            <div className="w-10 h-10 bg-inkwell rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-inkwell">Mensaje recibido</p>
              <p className="text-sm text-lunar-eclipse">Carlos Mendoza pregunta sobre disponibilidad - hace 1 día</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
