"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PropertyDetailsView } from "@/modules/tenant/components/views/properties/PropertyDetailsView";

export default function TenantPropertyDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("id") || "";

  return (
    <PropertyDetailsView
      propertyId={propertyId}
      onBack={() => router.back()}
      onViewMessages={(chatId) => router.push("/dashboard/tenant/messages")}
    />
  );
}
