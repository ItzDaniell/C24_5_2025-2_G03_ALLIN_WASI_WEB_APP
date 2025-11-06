"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";

export function SecurityCard() {
  return (
    <Card className="border-au-lait">
      <CardHeader>
        <CardTitle className="text-inkwell">Seguridad de la cuenta</CardTitle>
        <p className="text-sm text-lunar-eclipse">Mantén tu cuenta segura</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Eliminado: Cambiar contraseña */}
        <Button variant="outline" className="w-full justify-center border-au-lait text-inkwell">Activar autenticación de dos factores</Button>
        <Button variant="outline" className="w-full justify-center border-au-lait text-inkwell">Descargar mis datos</Button>
      </CardContent>
    </Card>
  );
}
