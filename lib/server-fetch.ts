import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/nextAuthOptions";

export default async function serverFetch(
  url: RequestInfo,
  options?: RequestInit
) {
  const session = await getServerSession(nextAuthOptions);

  const update = { ...options };

  const headers: Record<string, string> = {
    ...(update.headers as Record<string, string>),
    "Content-Type": "application/json",
  };
  const token = (session as any)?.accessToken as string | undefined;
  if (token) headers.Authorization = `Bearer ${token}`;
  update.headers = headers;

  return fetch(url, update);
}
