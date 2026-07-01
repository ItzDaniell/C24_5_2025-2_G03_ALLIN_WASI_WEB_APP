"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { RequestsView } from "@/modules/landlord/components";

export default function LandlordRequestsPage() {
  const router = useRouter();

  const handleViewChange = (view: string) => {
    router.push(`/dashboard/landlord/${view}`);
  };

  return <RequestsView onViewChange={handleViewChange} />;
}
