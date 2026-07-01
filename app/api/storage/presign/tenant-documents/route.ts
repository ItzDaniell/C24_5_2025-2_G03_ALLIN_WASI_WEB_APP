import { NextRequest, NextResponse } from "next/server";
import serverFetch from "@/lib/server-fetch";
import { API_BASE_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const res = await serverFetch(`${API_BASE_URL}/storage/presign/tenant-documents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            return NextResponse.json(
                { message: data?.message || "Error generating presign URL for tenant documents", error: data },
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
