import React, { Suspense } from "react";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/nextAuthOptions";
import { getUser } from "@/app/api/auth/[...nextauth]/getUser";
import { redirect } from "next/navigation";
import { LoadingSpinner } from "@/modules/shared/components/LoadingSkeleton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(nextAuthOptions);
  const accessToken = (session as any)?.accessToken;

  if (!accessToken) {
    redirect("/");
  }

  const response = await getUser(accessToken);
  const user = await response.json();
  const role = (typeof user?.role === "string"
    ? user.role
    : user?.role?.name || ""
  ).toLowerCase();

  // We'll pass the role via context or use it to render the appropriate layout
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
}
