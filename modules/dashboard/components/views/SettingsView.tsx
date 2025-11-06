"use client";

import React from "react";
import { Button } from "@/ui/button";
import { ProfileForm } from "@/modules/dashboard/components/settings/ProfileForm";
import { NotificationsForm } from "@/modules/dashboard/components/settings/NotificationsForm";
import { GeneralSettingsCard } from "@/modules/dashboard/components/settings/GeneralSettingsCard";
import { SecurityCard } from "@/modules/dashboard/components/settings/SecurityCard";

interface SettingsViewProps {
  onViewChange: (view: string) => void;
}

export function SettingsView({ onViewChange }: SettingsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-inkwell">Configuración</h1>
        <p className="text-lunar-eclipse">Gestiona la configuración de tu cuenta y preferencias</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileForm />
        <NotificationsForm />
        <GeneralSettingsCard />
        <SecurityCard />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" className="border-au-lait text-inkwell">Cancelar</Button>
        <Button className="bg-creme-brulee text-white">Guardar cambios</Button>
      </div>
    </div>
  );
}
