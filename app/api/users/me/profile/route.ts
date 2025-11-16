import serverFetch from "@/lib/server-fetch";

export async function GET() {
  const BASE_URL = process.env.BACKEND_API_URL || process.env.API_BASE_URL;
  if (!BASE_URL) {
    return Response.json(
      { error: "API base URL is not configured. Set BACKEND_API_URL or API_BASE_URL in your environment." },
      { status: 500 }
    );
  }
  const [userRes, landlordRes] = await Promise.all([
    serverFetch(`${BASE_URL}/users/me`, { method: "GET", headers: { "Content-Type": "application/json" }, cache: "no-store" }),
    serverFetch(`${BASE_URL}/landlords/me`, { method: "GET", headers: { "Content-Type": "application/json" }, cache: "no-store" }),
  ]);

  const userData = userRes.ok ? await userRes.json().catch(() => ({})) : await userRes.text().catch(() => "");
  const landlordData = landlordRes.ok ? await landlordRes.json().catch(() => ({})) : null;

  if (!userRes.ok) {
    return Response.json(
      { error: (userData as any)?.message || "[NextAPI]: Error al obtener el usuario" },
      { status: userRes.status }
    );
  }

  return Response.json(
    {
      user: userData,
      landlord: landlordRes.ok ? landlordData : null,
    },
    { status: 200 }
  );
}

export async function PUT(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let payload: any = {};
  if (contentType.includes("application/json")) {
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }
  }

  const BASE_URL = process.env.BACKEND_API_URL || process.env.API_BASE_URL;
  if (!BASE_URL) {
    return Response.json(
      { error: "API base URL is not configured. Set BACKEND_API_URL or API_BASE_URL in your environment." },
      { status: 500 }
    );
  }

  const response = await serverFetch(`${BASE_URL}/users/me/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const respType = response.headers.get("content-type");
  const data = respType && respType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    return Response.json(
      { error: (data as any)?.message || "[NextAPI]: Error al actualizar el perfil" },
      { status: response.status }
    );
  }

  return Response.json(data);
}



