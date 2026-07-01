import React from "react";
import serverFetch from "@/lib/server-fetch";
import { API_BASE_URL } from "@/lib/constants";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/nextAuthOptions";
import { getUser } from "@/app/api/auth/[...nextauth]/getUser";
import {
  Header,
  StatsGrid,
  ActionCards,
  RecentActivity,
} from "@/modules/landlord/components";

export default async function LandlordDashboardPage() {
  const session = await getServerSession(nextAuthOptions);
  const accessToken = (session as any)?.accessToken;

  if (!accessToken) {
    return null;
  }

  const response = await getUser(accessToken);
  const userData = await response.json();

  const res = await serverFetch(`${API_BASE_URL}/properties`, {
    cache: "no-store",
  });
  const data = await res.json().catch(() => [] as any[]);
  const initialProperties = Array.isArray(data) ? data : [];

  return (
    <>
      <Header userData={userData} isLoading={false} />
      <StatsGrid
        totalProperties={initialProperties?.length || 0}
        available={
          (initialProperties || []).filter(
            (p: any) => (p.status || "").toLowerCase() === "available"
          ).length
        }
        rented={
          (initialProperties || []).filter(
            (p: any) => (p.status || "").toLowerCase() === "rented"
          ).length
        }
        reserved={
          (initialProperties || []).filter(
            (p: any) => (p.status || "").toLowerCase() === "reserved"
          ).length
        }
        draft={
          (initialProperties || []).filter(
            (p: any) => (p.status || "").toLowerCase() === "draft"
          ).length
        }
      />
      <ActionCards
        publishedCount={
          (initialProperties || []).filter((p: any) =>
            ["available", "rented", "reserved"].includes(
              (p.status || "").toLowerCase()
            )
          ).length
        }
        draftCount={
          (initialProperties || []).filter(
            (p: any) => (p.status || "").toLowerCase() === "draft"
          ).length
        }
      />
      <RecentActivity />
    </>
  );
}
