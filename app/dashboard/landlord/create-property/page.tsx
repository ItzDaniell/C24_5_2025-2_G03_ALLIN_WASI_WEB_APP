"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreatePropertyForm } from "@/modules/landlord/components";

export default function LandlordCreatePropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get("id");

  const handleViewChange = (view: string) => {
    router.push(`/dashboard/landlord/${view}`);
  };

  return (
    <CreatePropertyForm
      onViewChange={handleViewChange}
      editingPropertyId={editingId ?? null}
    />
  );
}
