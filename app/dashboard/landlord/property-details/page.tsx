"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PropertyDetailsView } from "@/modules/landlord/components";

export default function LandlordPropertyDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("id") || "";

  const handleViewChange = (view: string) => {
    router.push(`/dashboard/landlord/${view}`);
  };

  const handleStartEdit = (id: string | number) => {
    router.push(`/dashboard/landlord/create-property?id=${id}`);
  };

  return (
    <PropertyDetailsView
      propertyId={propertyId}
      onViewChange={handleViewChange}
      onStartEdit={handleStartEdit}
    />
  );
}
