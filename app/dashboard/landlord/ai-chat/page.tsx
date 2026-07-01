"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { AiChatView } from "@/modules/landlord/components";

export default function LandlordAiChatPage() {
  const router = useRouter();

  const handleViewChange = (view: string) => {
    router.push(`/dashboard/landlord/${view}`);
  };

  return <AiChatView onViewChange={handleViewChange} />;
}
