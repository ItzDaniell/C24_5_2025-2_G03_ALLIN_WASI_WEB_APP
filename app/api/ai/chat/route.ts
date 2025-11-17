import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/nextAuthOptions";
import { API_BASE_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(nextAuthOptions as any);
    const token = (session as any)?.accessToken as string | undefined;
    
    const body = await req.json();
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ message: errorData?.message || "Error al enviar mensaje", error: errorData }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: "Error inesperado", error: error?.message || String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
