"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Building, MessageSquare, FileText } from "lucide-react";

interface ActionCardsProps {
  onViewChange: (view: string) => void;
}

export function ActionCards({ onViewChange }: ActionCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow border-au-lait" onClick={() => onViewChange('properties')}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-inkwell">Mis Propiedades</CardTitle>
              <CardDescription className="text-lunar-eclipse">Gestiona tus anuncios y propiedades</CardDescription>
            </div>
            <div className="w-12 h-12 bg-creme-brulee rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-lunar-eclipse">Publicadas</span>
              <Badge variant="secondary" className="bg-lunar-eclipse bg-opacity-10 text-lunar-eclipse">8</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-lunar-eclipse">Borradores</span>
              <Badge variant="secondary" className="bg-au-lait text-inkwell">2</Badge>
            </div>
            <Button className="w-full mt-4 bg-creme-brulee hover:bg-opacity-90">Ver todas</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow border-au-lait" onClick={() => onViewChange('messages')}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-inkwell">Nuevos Mensajes</CardTitle>
              <CardDescription className="text-lunar-eclipse">Conversa con inquilinos interesados</CardDescription>
            </div>
            <div className="w-12 h-12 bg-lunar-eclipse rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-creme-brulee rounded-full flex items-center justify-center">
                <span className="text-white text-sm">JD</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-inkwell">Juan Díaz</p>
                <p className="text-xs text-lunar-eclipse">¿Está disponible para visita?</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-lunar-eclipse rounded-full flex items-center justify-center">
                <span className="text-white text-sm">AL</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-inkwell">Ana López</p>
                <p className="text-xs text-lunar-eclipse">Pregunta sobre el tour 360°</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 border-au-lait text-inkwell hover:bg-au-lait">Ver todos los mensajes</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow border-au-lait" onClick={() => onViewChange('applications')}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-inkwell">Solicitudes Pendientes</CardTitle>
              <CardDescription className="text-lunar-eclipse">Revisa y aprueba solicitudes</CardDescription>
            </div>
            <div className="w-12 h-12 bg-inkwell rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-lunar-eclipse">Pendientes</span>
              <Badge variant="secondary" className="bg-creme-brulee bg-opacity-20 text-creme-brulee">5</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-lunar-eclipse">En revisión</span>
              <Badge variant="secondary" className="bg-creme-brulee bg-opacity-20 text-creme-brulee">2</Badge>
            </div>
            <Button className="w-full mt-4 bg-inkwell hover:bg-lunar-eclipse text-white">Revisar solicitudes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
