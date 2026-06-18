"use client";
import React from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const PropertyStatistics = dynamic(
  () =>
    import("@/modules/landlord/components/views/properties/PropertyStatistics").then(
      (m) => m.PropertyStatistics
    ),
  { ssr: false }
);

export default function LandlordStatisticsPage() {
  const router = useRouter();

  const handleViewChange = (view: string) => {
    router.push(`/dashboard/landlord/${view}`);
  };

  return <PropertyStatistics onViewChange={handleViewChange} />;
}
