import React from "react";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/nextAuthOptions";
import { getUser } from "@/app/api/auth/[...nextauth]/getUser";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(nextAuthOptions);
  const accessToken = (session as any)?.accessToken;

  if (!accessToken) {
    redirect("/");
  }

  const response = await getUser(accessToken);
  const user = await response.json();
  
  const role = (typeof user?.role === 'string' ? user.role : (user?.role?.name || '')).toLowerCase();

  if (role === "tenant" || role === "estudiante") {
    redirect("/dashboard/tenant");
  }

  // Default to landlord
  redirect("/dashboard/landlord");
}
