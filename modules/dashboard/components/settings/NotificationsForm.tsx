"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";

export function NotificationsForm() {
  return (
    <Card className="border-au-lait">
      <CardHeader>
        <CardTitle className="text-inkwell">Notificaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center gap-3 text-inkwell">
          <Checkbox />
          <span>Recibir avisos por correo</span>
        </label>
        <label className="flex items-center gap-3 text-inkwell">
          <Checkbox />
          <span>Recibir mensajes de interesados</span>
        </label>
        <Button variant="outline" className="border-au-lait text-inkwell">Guardar preferencias</Button>
      </CardContent>
    </Card>
  );
}
