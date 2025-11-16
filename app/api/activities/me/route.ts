import { NextRequest, NextResponse } from "next/server";
import serverFetch from "@/lib/server-fetch";
import { API_BASE_URL } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = searchParams.get("days") || "7";

    const res = await serverFetch(`${API_BASE_URL}/activities/me?days=${days}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Error al obtener la actividad reciente", error: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error inesperado al obtener la actividad reciente", error: error?.message || String(error) },
      { status: 500 }
    );
  }
}


