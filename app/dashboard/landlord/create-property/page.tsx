"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { CreatePropertyForm } from "@/modules/landlord/components";

export default function LandlordCreatePropertyPage() {
  const router = useRouter();

  const handleViewChange = (view: string) => {
    router.push(`/dashboard/landlord/${view}`);
  };

  return <CreatePropertyForm onViewChange={handleViewChange} />;
}
