"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FilesManager } from "@/modules/landlord/components";

export default function LandlordFilesPage() {
  const router = useRouter();

  const handleViewChange = (view: string) => {
    router.push(`/dashboard/landlord/${view}`);
  };

  return <FilesManager onViewChange={handleViewChange} />;
}
