"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { PropertiesView } from "@/modules/landlord/components";
import serverFetch from "@/lib/server-fetch";
import { API_BASE_URL } from "@/lib/constants";

export default function LandlordPropertiesPage() {
  const router = useRouter();

  const handleViewChange = (view: string) => {
    router.push(`/dashboard/landlord/${view}`);
  };

  const handleStartEdit = (id: string | number) => {
    router.push(`/dashboard/landlord/create-property?id=${id}`);
  };

  const handleViewDetails = (id: string | number) => {
    router.push(`/dashboard/landlord/property-details?id=${id}`);
  };

  // We'll fetch data on the client for now
  return (
    <PropertiesView
      onViewChange={handleViewChange}
      onStartEdit={handleStartEdit}
      onViewDetails={handleViewDetails}
    />
  );
}
