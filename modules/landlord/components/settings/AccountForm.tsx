"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";

export function AccountForm() {
  return (
    <Card className="border-au-lait">
      <CardHeader>
        <CardTitle className="text-inkwell">Cuenta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Correo</Label>
          <Input id="email" type="email" placeholder="correo@ejemplo.com" className="mt-2 bg-white border-2 border-gray-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input id="password" type="password" className="mt-2 bg-white border-2 border-gray-200" />
          </div>
          <div>
            <Label htmlFor="password2">Repetir contraseña</Label>
            <Input id="password2" type="password" className="mt-2 bg-white border-2 border-gray-200" />
          </div>
        </div>
        <Button className="bg-inkwell text-white hover:bg-lunar-eclipse">Actualizar</Button>
      </CardContent>
    </Card>
  );
}
