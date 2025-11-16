import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const limit = searchParams.get("limit") || "5";
    const countrycodes = searchParams.get("country") || "pe"; // por defecto Perú
    if (!q || q.trim().length < 3) {
      return NextResponse.json([], { status: 200 });
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", limit);
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("countrycodes", countrycodes);

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "TECSUP-Rooms/1.0 (contact: soporte@tecsup.edu.pe)",
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return NextResponse.json({ message: "Geocode error", error: txt }, { status: res.status });
    }

    const data = await res.json();
    const mapped = Array.isArray(data)
      ? data.map((item: any) => ({
          label: item.display_name as string,
          lat: item.lat,
          lon: item.lon,
          address: item.address || {},
        }))
      : [];
    return NextResponse.json(mapped, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { message: "Unexpected geocode error", error: e?.message || String(e) },
      { status: 500 }
    );
  }
}


