"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { SettingsView } from "@/modules/landlord/components";

export default function LandlordSettingsPage() {
  const router = useRouter();

  const handleViewChange = (view: string) => {
    router.push(`/dashboard/landlord/${view}`);
  };

  return <SettingsView onViewChange={handleViewChange} />;
}
