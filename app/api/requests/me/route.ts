import { NextRequest, NextResponse } from "next/server";
import serverFetch from "@/lib/server-fetch";
import { API_BASE_URL } from "@/lib/constants";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        
        let url = `${API_BASE_URL}/requests/me`;
        if (status) url += `?status=${status}`;

        const res = await serverFetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });
        const data = await res.json().catch(() => ([]));
        if (!res.ok) {
            return NextResponse.json(
                { message: data?.message || "Error fetching tenant requests" },
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
