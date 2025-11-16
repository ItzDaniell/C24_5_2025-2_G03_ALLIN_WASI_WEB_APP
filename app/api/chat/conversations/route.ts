import { NextRequest, NextResponse } from "next/server";
import serverFetch from "@/lib/server-fetch";
import { API_BASE_URL } from "@/lib/constants";

export async function GET() {
  try {
    const res = await serverFetch(`${API_BASE_URL}/chat/conversations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Error fetching conversations", error: data },
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await serverFetch(`${API_BASE_URL}/chat/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Error creating conversation", error: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Unexpected error", error: error?.message || String(error) },
      { status: 500 }
    );
  }
}



