import { NextRequest, NextResponse } from "next/server";
import serverFetch from "@/lib/server-fetch";
import { API_BASE_URL } from "@/lib/constants";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await serverFetch(`${API_BASE_URL}/chat/conversations/${id}/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Error marking as read", error: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Unexpected error", error: error?.message || String(error) },
      { status: 500 }
    );
  }
}

