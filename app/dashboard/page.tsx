import { LandlordDashboard } from "@/modules/landlord";
import { StudentDashboard } from "@/modules/student";
import serverFetch from "@/lib/server-fetch";
import { API_BASE_URL } from "@/lib/constants";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/nextAuthOptions";
import { getUser } from "@/app/api/auth/[...nextauth]/getUser";

export default async function Page() {
  const session = await getServerSession(nextAuthOptions);
  const accessToken = (session as any)?.accessToken;

  if (!accessToken) {
    return <div>No se encontró sesión activa.</div>;
  }

  const response = await getUser(accessToken);
  const user = await response.json();
  
  const role = (typeof user?.role === 'string' ? user.role : (user?.role?.name || '')).toLowerCase();

  if (role === "tenant" || role === "estudiante") {
    return <StudentDashboard />;
  }

  // Default to landlord or show landlord if applicable
  const res = await serverFetch(`${API_BASE_URL}/properties`, { cache: "no-store" });
  const data = await res.json().catch(() => [] as any[]);
  const initialProperties = Array.isArray(data) ? data : [];
  
  return <LandlordDashboard initialProperties={initialProperties} />;
}
