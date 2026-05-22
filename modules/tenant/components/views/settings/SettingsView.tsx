"use client";

import React from "react";
import { ProfileForm } from "../../settings/ProfileForm";
import { ViewHeader } from "../../ViewHeader";

export function SettingsView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <ViewHeader 
        title="Configuración" 
        description="Gestiona tu información personal y preferencias de vivienda."
      />

      <div className="space-y-8">
        <ProfileForm />
      </div>
    </div>
  );
}
