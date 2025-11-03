import DashboardPage from "@/modules/dashboard/page";
import serverFetch from "@/lib/server-fetch";
import { API_BASE_URL } from "@/lib/constants";

export default async function Page() {
  const res = await serverFetch(`${API_BASE_URL}/properties`, { cache: "no-store" });
  const data = await res.json().catch(() => [] as any[]);
  const initialProperties = Array.isArray(data) ? data : [];
  return <DashboardPage initialProperties={initialProperties} />;
}
