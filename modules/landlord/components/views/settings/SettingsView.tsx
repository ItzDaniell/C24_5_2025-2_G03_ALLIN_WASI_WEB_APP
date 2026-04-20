"use client";

import React from "react";
import { ProfileForm } from "@/modules/landlord/components/settings/ProfileForm";
import { NotificationsForm } from "@/modules/landlord/components/settings/NotificationsForm";
import { VerificationStatus } from "@/modules/landlord/components/settings/VerificationStatus";
import useMe from "@/modules/auth/data/queries/useMe";

interface SettingsViewProps {
  onViewChange: (view: string) => void;
}

export function SettingsView({ onViewChange }: SettingsViewProps) {
  const { data, isLoading } = useMe();

  // Extract landlord data
  const landlordData = (data as any)?.landlord;
  const verificationStatus = landlordData?.verificationStatus || '';
  const verificationMessage = landlordData?.verificationMessage || null;
  const dniFrontUrl = landlordData?.dniFrontUrl || null;
  const dniBackUrl = landlordData?.dniBackUrl || null;
  const utilityBillUrl = landlordData?.utilityBillUrl || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-inkwell">Configuración</h1>
        <p className="text-lunar-eclipse">Gestiona la configuración de tu cuenta y preferencias</p>
      </div>

      {!isLoading && (
        <VerificationStatus
          status={verificationStatus}
          message={verificationMessage}
          dniFrontUrl={dniFrontUrl}
          dniBackUrl={dniBackUrl}
          utilityBillUrl={utilityBillUrl}
        />
      )}

      <div className="space-y-6">
        <ProfileForm />
        <NotificationsForm />
      </div>
    </div>
  );
}
