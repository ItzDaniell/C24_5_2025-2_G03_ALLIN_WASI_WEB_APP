"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

export function GeneralSettingsCard() {
  const [language, setLanguage] = React.useState("es");
  const [timezone, setTimezone] = React.useState("America/Lima");

  return (
    <Card className="border-au-lait">
      <CardHeader>
        <CardTitle className="text-inkwell">Configuración General</CardTitle>
        <p className="text-sm text-lunar-eclipse">Preferencias de la aplicación</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-2 block">Idioma</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-white border-2 border-gray-200">
              <SelectValue placeholder="Selecciona un idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">Inglés</SelectItem>
                <SelectItem value="pt">Portugués</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block">Zona horaria</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="bg-white border-2 border-gray-200">
              <SelectValue placeholder="Selecciona una zona horaria" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="America/Lima">Lima, Perú (GMT-5)</SelectItem>
                <SelectItem value="America/Bogota">Bogotá, Colombia (GMT-5)</SelectItem>
                <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                <SelectItem value="Europe/Madrid">Madrid, España (GMT+1)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
