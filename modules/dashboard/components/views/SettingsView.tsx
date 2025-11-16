"use client";

import React from "react";
import { Button } from "@/ui/button";
import { ProfileForm } from "@/modules/dashboard/components/settings/ProfileForm";
import { NotificationsForm } from "@/modules/dashboard/components/settings/NotificationsForm";

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
      </div>
    </div>
  );
}
