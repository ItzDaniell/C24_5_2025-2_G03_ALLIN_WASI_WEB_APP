"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { PropertyDetailsView } from "@/modules/tenant/components/views/properties/PropertyDetailsView";

export default function TenantPropertyDetailsPage() {
  const router = useRouter();
  return (
    <PropertyDetailsView
      propertyId=""
      onBack={() => router.back()}
      onViewMessages={(chatId) => router.push("/dashboard/tenant/messages")}
    />
  );
}
