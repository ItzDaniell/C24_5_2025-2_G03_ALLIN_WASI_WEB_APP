import { NextRequest, NextResponse } from "next/server";
import serverFetch from "@/lib/server-fetch";
import { API_BASE_URL } from "@/lib/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "30";
    const before = searchParams.get("before");

    let url = `${API_BASE_URL}/chat/conversations/${id}/messages?limit=${limit}`;
    if (before) {
      url += `&before=${before}`;
    }

    const res = await serverFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Error fetching messages", error: data },
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

