import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    if (!lat || !lon) {
      return NextResponse.json({ message: "lat y lon son requeridos" }, { status: 400 });
    }

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "TECSUP-Rooms/1.0 (contact: soporte@tecsup.edu.pe)",
        "Accept": "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return NextResponse.json({ message: "Reverse geocode error", error: txt }, { status: res.status });
    }
    const data = await res.json();
    const address = data?.display_name as string | undefined;
    const addr = data?.address || {};
    return NextResponse.json(
      {
        label: address,
        lat,
        lon,
        address: addr,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { message: "Unexpected reverse geocode error", error: e?.message || String(e) },
      { status: 500 }
    );
  }
}


