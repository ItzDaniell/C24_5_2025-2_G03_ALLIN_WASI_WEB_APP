import { NextRequest, NextResponse } from "next/server";
import serverFetch from "@/lib/server-fetch";
import { API_BASE_URL } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (search) params.append("search", search);
    if (limit) params.append("limit", limit);
    if (offset) params.append("offset", offset);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/media/my-files${queryString ? `?${queryString}` : ""}`;

    const res = await serverFetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Error fetching files", error: data },
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
