import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/nextAuthOptions";

export default async function serverFetch(
  url: RequestInfo,
  options?: RequestInit
) {
  const session = await getServerSession(nextAuthOptions as any);

  const update = { ...options };

  const token = (session as any)?.accessToken as string | undefined;
  update.headers = {
    ...(update.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as HeadersInit;

  return fetch(url, update);
}
