"use client";

import React from "react";
import { ProfileForm } from "@/modules/landlord/components/settings/ProfileForm";
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
      <div className="flex items-start justify-between gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-au-lait/50">
        <div className="flex items-center gap-3 flex-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-inkwell mb-1">Configuración</h1>
            <p className="text-sm sm:text-base text-lunar-eclipse">Gestiona la configuración de tu cuenta y preferencias</p>
          </div>
        </div>
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
      </div>
    </div>
  );
}
