"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MessagesView } from "@/modules/tenant/components/views/messages/MessagesView";

export default function TenantMessagesPage() {
  const router = useRouter();

  const handleViewChange = (view: string) => {
    router.push(`/dashboard/tenant/${view}`);
  };

  return <MessagesView onViewChange={handleViewChange} />;
}
