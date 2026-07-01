"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MessagesView } from "@/modules/landlord/components";

export default function LandlordMessagesPage() {
  const router = useRouter();

  const handleViewChange = (view: string) => {
    router.push(`/dashboard/landlord/${view}`);
  };

  return <MessagesView onViewChange={handleViewChange} />;
}
