import { NextRequest, NextResponse } from "next/server";
import serverFetch from "@/lib/server-fetch";
import { API_BASE_URL } from "@/lib/constants";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    let url = `${API_BASE_URL}/requests/${id}`;
    if (action === "accept") {
      url = `${API_BASE_URL}/requests/${id}/accept`;
    } else if (action === "reject") {
      url = `${API_BASE_URL}/requests/${id}/reject`;
    }
    let body = null;
    if (!action) {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    const res = await serverFetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Error updating request", error: data },
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await serverFetch(`${API_BASE_URL}/requests/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Error deleting request", error: data },
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

