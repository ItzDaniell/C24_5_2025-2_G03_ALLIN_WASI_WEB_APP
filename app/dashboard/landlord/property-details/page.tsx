"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { PropertyDetailsView } from "@/modules/landlord/components";

export default function LandlordPropertyDetailsPage() {
  const router = useRouter();

  const handleViewChange = (view: string) => {
    router.push(`/dashboard/landlord/${view}`);
  };

  const handleStartEdit = (id: string | number) => {
    router.push(`/dashboard/landlord/create-property`);
  };

  return (
    <PropertyDetailsView
      propertyId=""
      onViewChange={handleViewChange}
      onStartEdit={handleStartEdit}
    />
  );
}
