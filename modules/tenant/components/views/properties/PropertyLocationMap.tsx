"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import {
  MapPin, Home, ShoppingBag, Scissors, Utensils,
  Clock, Phone, Navigation, GraduationCap, Store,
  Coffee, Pill, X, Locate, AlertCircle, ChevronRight, Loader2,
} from "lucide-react";

/* ───────────────────── Types ───────────────────── */

type POICategory = "barberia" | "mercado" | "tienda" | "restaurante" | "farmacia" | "cafe";

interface POI {
  id: string;
  name: string;
  type: POICategory;
  latitude: number;
  longitude: number;
  address: string;
  hours: string;
  phone?: string;
  description?: string;
}

interface PropertyLocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  title?: string;
  city?: string;
}

/* ────────────── Reference point: TECSUP ────────────── */

const TECSUP = {
  name: "TECSUP Lima – Sede Principal",
  latitude: -12.0439002,
  longitude: -76.9529147,
  address: "Av. Cascanueces 2221, Santa Anita, Lima",
  hours: "Lun–Vie 8:00 a.m. – 8:00 p.m. | Sáb 8:00 a.m. – 1:00 p.m.",
  phone: "(01) 317-3900",
};

/* ────────────── Overpass API: fetch real nearby POIs ────────────── */

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// Maps our category to OSM tags
const OSM_QUERIES: Record<POICategory, string> = {
  mercado: `
    node["shop"="supermarket"](around:RADIUS,LAT,LON);
    node["shop"="convenience"](around:RADIUS,LAT,LON);
    node["amenity"="marketplace"](around:RADIUS,LAT,LON);
    way["shop"="supermarket"](around:RADIUS,LAT,LON);
    way["amenity"="marketplace"](around:RADIUS,LAT,LON);
  `,
  tienda: `
    node["shop"="mall"](around:RADIUS,LAT,LON);
    node["shop"="department_store"](around:RADIUS,LAT,LON);
    node["shop"="clothes"](around:RADIUS,LAT,LON);
    node["shop"="variety_store"](around:RADIUS,LAT,LON);
    way["shop"="mall"](around:RADIUS,LAT,LON);
    way["shop"="department_store"](around:RADIUS,LAT,LON);
  `,
  restaurante: `
    node["amenity"="restaurant"](around:RADIUS,LAT,LON);
    node["amenity"="fast_food"](around:RADIUS,LAT,LON);
    way["amenity"="restaurant"](around:RADIUS,LAT,LON);
  `,
  farmacia: `
    node["amenity"="pharmacy"](around:RADIUS,LAT,LON);
    node["shop"="chemist"](around:RADIUS,LAT,LON);
    way["amenity"="pharmacy"](around:RADIUS,LAT,LON);
  `,
  cafe: `
    node["amenity"="cafe"](around:RADIUS,LAT,LON);
    way["amenity"="cafe"](around:RADIUS,LAT,LON);
  `,
  barberia: `
    node["shop"="hairdresser"](around:RADIUS,LAT,LON);
    node["shop"="beauty"](around:RADIUS,LAT,LON);
    way["shop"="hairdresser"](around:RADIUS,LAT,LON);
  `,
};

const CATEGORY_LABELS_ES: Record<POICategory, string> = {
  mercado: "Mercado / Supermercado",
  tienda: "Tienda / Centro comercial",
  restaurante: "Restaurante",
  farmacia: "Farmacia",
  cafe: "Café",
  barberia: "Barbería / Peluquería",
};

async function fetchNearbyPOIs(lat: number, lon: number, radiusMeters = 1500): Promise<POI[]> {
  const allPois: POI[] = [];
  const categories = Object.keys(OSM_QUERIES) as POICategory[];

  // Build a single combined query for all categories at once
  let combinedBody = "";
  for (const cat of categories) {
    combinedBody += OSM_QUERIES[cat]
      .replace(/RADIUS/g, String(radiusMeters))
      .replace(/LAT/g, String(lat))
      .replace(/LON/g, String(lon));
  }

  const query = `[out:json][timeout:12];(${combinedBody});out center 80;`;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    const data = await res.json();

    const elements: any[] = data.elements || [];

    for (const el of elements) {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (!elLat || !elLon) continue;

      const name = el.tags?.name;
      if (!name) continue; // skip unnamed nodes

      const cat = classifyElement(el);
      if (!cat) continue;

      allPois.push({
        id: `osm-${el.id}`,
        name,
        type: cat,
        latitude: elLat,
        longitude: elLon,
        address: buildAddress(el.tags),
        hours: el.tags?.opening_hours || "Horario no disponible",
        phone: el.tags?.phone || el.tags?.["contact:phone"] || undefined,
        description: CATEGORY_LABELS_ES[cat],
      });
    }
  } catch (err) {
    console.warn("[PropertyLocationMap] Overpass API error, using empty POI list:", err);
  }

  // Deduplicate by name+type (OSM can have duplicates for node+way)
  const seen = new Set<string>();
  return allPois.filter((p) => {
    const key = `${p.type}::${p.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function classifyElement(el: any): POICategory | null {
  const t = el.tags || {};
  if (t.amenity === "pharmacy" || t.shop === "chemist") return "farmacia";
  if (t.amenity === "cafe") return "cafe";
  if (t.amenity === "restaurant" || t.amenity === "fast_food") return "restaurante";
  if (t.amenity === "marketplace") return "mercado";
  if (t.shop === "supermarket" || t.shop === "convenience") return "mercado";
  if (t.shop === "mall" || t.shop === "department_store" || t.shop === "clothes" || t.shop === "variety_store") return "tienda";
  if (t.shop === "hairdresser" || t.shop === "beauty") return "barberia";
  return null;
}

function buildAddress(tags: any): string {
  if (!tags) return "Dirección no disponible";
  const parts: string[] = [];
  if (tags["addr:street"]) parts.push(tags["addr:street"]);
  if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"]);
  if (tags["addr:city"]) parts.push(tags["addr:city"]);
  if (tags["addr:district"]) parts.push(tags["addr:district"]);
  return parts.length > 0 ? parts.join(", ") : (tags["addr:full"] || "Dirección no disponible");
}

/* ────────────── Inline SVG Icons ────────────── */

const SVG: Record<string, string> = {
  tecsup:     `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  home:       `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  barberia:   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></svg>`,
  mercado:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  tienda:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect x="9" y="14" width="6" height="7" rx="1"/><path d="M3 9h18"/></svg>`,
  restaurante:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
  farmacia:   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="M8.5 8.5 16 16"/></svg>`,
  cafe:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`,
  mapPin:     `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  clock:      `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  phone:      `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
};

/* ────────────── Category config ────────────── */

const CATEGORY_CONFIG: Record<POICategory | "property" | "tecsup", {
  color: string; gradient: string; svgKey: string; label: string; icon: any;
}> = {
  tecsup:     { color: "#f59e0b", gradient: "linear-gradient(135deg,#f59e0b,#d97706)", svgKey: "tecsup",      label: "TECSUP",      icon: GraduationCap },
  property:   { color: "#6366f1", gradient: "linear-gradient(135deg,#6366f1,#4f46e5)", svgKey: "home",        label: "Cuarto",       icon: Home },
  barberia:   { color: "#8b5cf6", gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)", svgKey: "barberia",    label: "Barberías",    icon: Scissors },
  mercado:    { color: "#10b981", gradient: "linear-gradient(135deg,#10b981,#059669)", svgKey: "mercado",     label: "Mercados",     icon: ShoppingBag },
  tienda:     { color: "#3b82f6", gradient: "linear-gradient(135deg,#3b82f6,#2563eb)", svgKey: "tienda",      label: "Tiendas",      icon: Store },
  restaurante:{ color: "#ef4444", gradient: "linear-gradient(135deg,#ef4444,#dc2626)", svgKey: "restaurante", label: "Restaurantes", icon: Utensils },
  farmacia:   { color: "#14b8a6", gradient: "linear-gradient(135deg,#14b8a6,#0d9488)", svgKey: "farmacia",    label: "Farmacias",    icon: Pill },
  cafe:       { color: "#a16207", gradient: "linear-gradient(135deg,#92400e,#a16207)", svgKey: "cafe",        label: "Cafés",        icon: Coffee },
};

/* ────────────── Helpers ────────────── */

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function ic(key: string, color = "currentColor") {
  return `<span style="color:${color};display:flex;align-items:center;flex-shrink:0;">${SVG[key].replace('stroke="currentColor"', `stroke="${color}"`)}</span>`;
}

/* ────────────── Popup builders ────────────── */

function buildPropertyPopup(title: string, address: string, lat: number, lon: number) {
  const dist = haversineKm(TECSUP.latitude, TECSUP.longitude, lat, lon);
  return `
    <div style="font-family:'Inter',system-ui,sans-serif;width:280px;background:#fff;display:flex;flex-direction:column;">
      <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:18px 20px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:42px;height:42px;background:rgba(255,255,255,0.22);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${SVG.home.replace('width="18"', 'width="22"').replace('height="18"', 'height="22"')}
          </div>
          <div>
            <div style="font-size:15px;font-weight:800;color:#fff;line-height:1.25;letter-spacing:-0.2px;">${title}</div>
            <div style="display:inline-flex;margin-top:4px;background:rgba(0,0,0,0.18);padding:2px 8px;border-radius:6px;font-size:9px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;">Tu cuarto</div>
          </div>
        </div>
      </div>
      <div style="padding:14px 18px;display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;align-items:flex-start;gap:8px;">
          ${ic("mapPin", "#6366f1")}
          <span style="font-size:12px;color:#334155;line-height:1.5;font-weight:500;">${address}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#f0fdf4;border-radius:8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          <span style="font-size:11.5px;color:#16a34a;font-weight:800;">A ${fmtDist(dist)} de TECSUP</span>
        </div>
      </div>
    </div>
  `;
}

function buildPOIPopup(poi: POI, refLat: number, refLon: number) {
  const cfg = CATEGORY_CONFIG[poi.type];
  const dist = haversineKm(refLat, refLon, poi.latitude, poi.longitude);
  return `
    <div style="font-family:'Inter',system-ui,sans-serif;width:272px;background:#fff;display:flex;flex-direction:column;">
      <div style="background:${cfg.gradient};padding:14px 18px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:38px;height:38px;background:rgba(255,255,255,0.22);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${SVG[cfg.svgKey].replace('width="16"', 'width="20"').replace('height="16"', 'height="20"')}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:800;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${poi.name}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
              <span style="background:rgba(0,0,0,0.18);color:#fff;font-size:8.5px;font-weight:700;padding:2px 7px;border-radius:5px;text-transform:uppercase;">${cfg.label}</span>
              <span style="background:rgba(255,255,255,0.9);color:${cfg.color};font-size:9px;font-weight:800;padding:2px 7px;border-radius:5px;">${fmtDist(dist)}</span>
            </div>
          </div>
        </div>
      </div>
      <div style="padding:12px 18px;display:flex;flex-direction:column;gap:8px;">
        ${poi.description ? `<p style="font-size:11.5px;color:#475569;margin:0 0 2px;line-height:1.5;font-weight:500;">${poi.description}</p>` : ""}
        <div style="display:flex;align-items:flex-start;gap:8px;">${ic("mapPin", cfg.color)}<span style="font-size:11px;color:#64748b;font-weight:500;line-height:1.45;">${poi.address}</span></div>
        <div style="display:flex;align-items:flex-start;gap:8px;">${ic("clock", cfg.color)}<span style="font-size:11px;color:#64748b;font-weight:500;">${poi.hours}</span></div>
        ${poi.phone ? `<div style="display:flex;align-items:center;gap:8px;">${ic("phone", cfg.color)}<span style="font-size:11.5px;color:#334155;font-weight:700;">${poi.phone}</span></div>` : ""}
      </div>
    </div>
  `;
}

function buildTecsupPopup() {
  return `
    <div style="font-family:'Inter',system-ui,sans-serif;width:282px;background:#fff;display:flex;flex-direction:column;">
      <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:18px 20px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:42px;height:42px;background:rgba(255,255,255,0.22);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${SVG.tecsup.replace('width="20"', 'width="24"').replace('height="20"', 'height="24"')}
          </div>
          <div>
            <div style="font-size:15px;font-weight:800;color:#fff;line-height:1.25;">${TECSUP.name}</div>
            <div style="display:inline-flex;margin-top:4px;background:rgba(0,0,0,0.18);padding:2px 8px;border-radius:6px;font-size:9px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;">Sede Principal</div>
          </div>
        </div>
      </div>
      <div style="padding:14px 18px;display:flex;flex-direction:column;gap:9px;">
        <div style="display:flex;align-items:flex-start;gap:8px;">${ic("mapPin", "#d97706")}<span style="font-size:11.5px;color:#334155;font-weight:500;line-height:1.5;">${TECSUP.address}</span></div>
        <div style="display:flex;align-items:flex-start;gap:8px;">${ic("clock", "#d97706")}<span style="font-size:11px;color:#475569;font-weight:500;line-height:1.45;">${TECSUP.hours}</span></div>
        <div style="display:flex;align-items:center;gap:8px;">${ic("phone", "#d97706")}<span style="font-size:12px;color:#1e293b;font-weight:700;">${TECSUP.phone}</span></div>
      </div>
    </div>
  `;
}

/* ────────────── Marker HTML builders ────────────── */

function propertyMarkerHtml() {
  return `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;">
      <div style="
        width:48px;height:48px;border-radius:50%;
        background:linear-gradient(135deg,#6366f1,#4f46e5);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 20px rgba(99,102,241,0.55),0 0 0 5px rgba(99,102,241,0.18);
        animation:propPulse 2.2s ease-in-out infinite;
        cursor:pointer;
      ">
        ${SVG.home.replace('width="18"', 'width="22"').replace('height="18"', 'height="22"')}
      </div>
      <div style="
        position:absolute;top:-11px;right:-14px;
        background:#fff;color:#4f46e5;font-size:7.5px;font-weight:900;
        padding:2px 6px;border-radius:5px;
        box-shadow:0 2px 8px rgba(0,0,0,0.12);
        letter-spacing:0.5px;white-space:nowrap;
      ">CUARTO</div>
    </div>
  `;
}

function tecsupMarkerHtml() {
  return `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;">
      <div style="
        width:46px;height:46px;border-radius:50%;
        background:linear-gradient(135deg,#f59e0b,#d97706);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 18px rgba(245,158,11,0.5),0 0 0 4px rgba(245,158,11,0.18);
        animation:tecsupPulse 2s ease-in-out infinite;
        cursor:pointer;
      ">
        ${SVG.tecsup}
      </div>
      <div style="
        position:absolute;top:-10px;right:-10px;
        background:#fff;color:#d97706;font-size:7.5px;font-weight:900;
        padding:2px 6px;border-radius:5px;
        box-shadow:0 2px 8px rgba(0,0,0,0.12);
        letter-spacing:0.5px;
      ">TECSUP</div>
    </div>
  `;
}

function poiMarkerHtml(poi: POI) {
  const cfg = CATEGORY_CONFIG[poi.type];
  return `
    <div style="
      width:36px;height:36px;border-radius:50%;
      background:${cfg.gradient};
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 3px 10px ${cfg.color}55,0 0 0 3px ${cfg.color}22;
      cursor:pointer;
      transition:transform 0.18s;
    " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
      ${SVG[cfg.svgKey]}
    </div>
  `;
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */

const MAP_ID = "property-detail-map";

export function PropertyLocationMap({ latitude, longitude, address, title, city }: PropertyLocationMapProps) {
  const mapRef = useRef<any>(null);
  const layerGroupsRef = useRef<Record<string, any>>({});
  const [mapReady, setMapReady] = useState(false);
  const [hasCoords, setHasCoords] = useState(false);
  const [loadingPOIs, setLoadingPOIs] = useState(false);
  const [pois, setPois] = useState<POI[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    new Set(["barberia", "mercado", "tienda", "restaurante", "farmacia", "cafe"])
  );

  const lat = latitude ? Number(latitude) : null;
  const lon = longitude ? Number(longitude) : null;
  const centerLat = lat ?? TECSUP.latitude;
  const centerLon = lon ?? TECSUP.longitude;

  /* ── Fetch real POIs from Overpass API ── */
  useEffect(() => {
    let cancelled = false;
    setLoadingPOIs(true);

    // Search near the property if coords available, otherwise near TECSUP
    fetchNearbyPOIs(centerLat, centerLon, 1500).then((results) => {
      if (!cancelled) {
        setPois(results);
        setLoadingPOIs(false);
      }
    });

    return () => { cancelled = true; };
  }, [centerLat, centerLon]);

  /* ── Inject Leaflet styles + animation keyframes ── */
  useEffect(() => {
    const id = "plm-custom-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes propPulse {
        0%,100% { box-shadow:0 4px 20px rgba(99,102,241,0.55),0 0 0 5px rgba(99,102,241,0.18); }
        50%      { box-shadow:0 4px 28px rgba(99,102,241,0.75),0 0 0 10px rgba(99,102,241,0.08); }
      }
      @keyframes tecsupPulse {
        0%,100% { box-shadow:0 4px 18px rgba(245,158,11,0.5),0 0 0 4px rgba(245,158,11,0.18); }
        50%      { box-shadow:0 4px 26px rgba(245,158,11,0.7),0 0 0 9px rgba(245,158,11,0.08); }
      }
      .leaflet-popup-content-wrapper {
        border-radius:16px!important;padding:0!important;overflow:hidden!important;
        box-shadow:0 16px 40px rgba(0,0,0,0.14),0 4px 12px rgba(0,0,0,0.07)!important;border:none!important;
      }
      .leaflet-popup-content { margin:0!important;width:auto!important; }
      .leaflet-popup-tip-container { margin-top:-1px!important; }
    `;
    document.head.appendChild(style);
  }, []);

  /* ── Load Leaflet + build map (rebuild when POIs arrive) ── */
  useEffect(() => {
    if (loadingPOIs) return; // wait for POIs to load before building map

    let disposed = false;

    const ensureLeaflet = () =>
      new Promise<void>((resolve) => {
        if (!document.querySelector('link[data-leaflet="1"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          link.crossOrigin = "";
          link.setAttribute("data-leaflet", "1");
          document.head.appendChild(link);
        }
        if ((window as any).L) { resolve(); return; }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

    (async () => {
      await ensureLeaflet();
      if (disposed) return;

      const L = (window as any).L;
      if (!L) return;

      const container = document.getElementById(MAP_ID);
      if (!container) return;

      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (_) {}
        mapRef.current = null;
      }
      if ((container as any)._leaflet_id) {
        (container as any)._leaflet_id = undefined;
      }
      if (disposed) return;

      /* Map instance */
      const zoom = lat && lon ? 16 : 15;
      const map = L.map(MAP_ID, { zoomControl: false }).setView([centerLat, centerLon], zoom);
      mapRef.current = map;
      L.control.zoom({ position: "topright" }).addTo(map);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);

      const bounds = L.latLngBounds(L.latLng(-12.5, -77.5), L.latLng(-11.5, -76.3));
      map.setMaxBounds(bounds);
      map.on("drag", () => map.panInsideBounds(bounds, { animate: false }));

      /* TECSUP marker (always visible) */
      const tecsupIcon = L.divIcon({ className: "", html: tecsupMarkerHtml(), iconSize: [56, 56], iconAnchor: [28, 28] });
      L.marker([TECSUP.latitude, TECSUP.longitude], { icon: tecsupIcon, zIndexOffset: 900 })
        .bindPopup(buildTecsupPopup(), { maxWidth: 320, className: "" })
        .addTo(map);

      /* Property marker (if coords available) */
      if (lat && lon) {
        const propIcon = L.divIcon({ className: "", html: propertyMarkerHtml(), iconSize: [56, 56], iconAnchor: [28, 28] });
        L.marker([lat, lon], { icon: propIcon, zIndexOffset: 1000 })
          .bindPopup(buildPropertyPopup(title || "Cuarto", address || "", lat, lon), { maxWidth: 310, className: "" })
          .addTo(map);

        // Distance line between property and TECSUP
        L.polyline(
          [[lat, lon], [TECSUP.latitude, TECSUP.longitude]],
          { color: "#6366f1", weight: 2.5, opacity: 0.45, dashArray: "8 6" }
        ).addTo(map);

        setHasCoords(true);
      }

      /* POI layer groups — using real data from Overpass */
      const groups: Record<string, any> = {};
      const poiCategories: POICategory[] = ["barberia", "mercado", "tienda", "restaurante", "farmacia", "cafe"];
      poiCategories.forEach((cat) => {
        const group = L.layerGroup();
        pois.filter((p) => p.type === cat).forEach((poi) => {
          const icon = L.divIcon({ className: "", html: poiMarkerHtml(poi), iconSize: [36, 36], iconAnchor: [18, 18] });
          L.marker([poi.latitude, poi.longitude], { icon })
            .bindPopup(buildPOIPopup(poi, centerLat, centerLon), { maxWidth: 310, className: "" })
            .addTo(group);
        });
        groups[cat] = group;
        group.addTo(map);
      });

      layerGroupsRef.current = groups;
      setMapReady(true);
    })();

    return () => {
      disposed = true;
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (_) {}
        mapRef.current = null;
      }
      layerGroupsRef.current = {};
      setMapReady(false);
    };
  }, [lat, lon, address, title, centerLat, centerLon, pois, loadingPOIs]);

  /* ── Sync filter state → layer visibility ── */
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    Object.entries(layerGroupsRef.current).forEach(([key, group]) => {
      if (activeFilters.has(key)) {
        if (!map.hasLayer(group)) map.addLayer(group);
      } else {
        if (map.hasLayer(group)) map.removeLayer(group);
      }
    });
  }, [activeFilters, mapReady]);

  const toggleFilter = useCallback((id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const flyToProperty = useCallback(() => {
    if (!mapRef.current) return;
    if (lat && lon) {
      mapRef.current.flyTo([lat, lon], 17, { duration: 1.2 });
    } else {
      mapRef.current.flyTo([TECSUP.latitude, TECSUP.longitude], 15, { duration: 1.2 });
    }
  }, [lat, lon]);

  const filterButtons = [
    { id: "barberia",    ...CATEGORY_CONFIG.barberia },
    { id: "mercado",     ...CATEGORY_CONFIG.mercado },
    { id: "tienda",      ...CATEGORY_CONFIG.tienda },
    { id: "restaurante", ...CATEGORY_CONFIG.restaurante },
    { id: "farmacia",    ...CATEGORY_CONFIG.farmacia },
    { id: "cafe",        ...CATEGORY_CONFIG.cafe },
  ];

  const activePOICount = pois.filter((p) => activeFilters.has(p.type)).length;

  return (
    <div className="space-y-4">
      {/* ── Header + Filter Bar ── */}
      <Card className="border border-au-lait rounded-2xl overflow-hidden shadow-sm bg-white">
        {/* Title row */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                <MapPin className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-inkwell">Ubicación y alrededores</h3>
                <p className="text-[11px] text-lunar-eclipse font-medium mt-0.5">
                  {hasCoords
                    ? `${address || city || "Dirección registrada"} · ${fmtDist(haversineKm(lat!, lon!, TECSUP.latitude, TECSUP.longitude))} de TECSUP`
                    : "Referencia: TECSUP Lima, Santa Anita"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={flyToProperty}
              className="h-8 px-3 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl gap-1.5 shrink-0"
            >
              <Locate className="w-3.5 h-3.5" />
              {hasCoords ? "Ver cuarto" : "Centrar"}
            </Button>
          </div>

          {/* No-coords notice */}
          {!hasCoords && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/60">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <p className="text-[11px] text-amber-700 font-medium leading-snug">
                Coordenadas exactas no disponibles — el mapa muestra servicios cercanos a TECSUP.
              </p>
            </div>
          )}
        </div>

        {/* Filter chips */}
        <div className="px-5 py-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {loadingPOIs ? "Buscando servicios cercanos..." : `Servicios cercanos (radio 1.5 km)`}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {loadingPOIs ? (
                <Loader2 className="w-3 h-3 animate-spin inline-block" />
              ) : (
                `${activePOICount} visibles`
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filterButtons.map((btn) => {
              const Icon = btn.icon;
              const isActive = activeFilters.has(btn.id);
              const count = pois.filter((p) => p.type === btn.id).length;
              return (
                <button
                  key={btn.id}
                  onClick={() => toggleFilter(btn.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 border cursor-pointer"
                  style={{
                    background: isActive ? btn.color + "12" : "#f8fafc",
                    borderColor: isActive ? btn.color + "40" : "#e2e8f0",
                    color: isActive ? btn.color : "#94a3b8",
                  }}
                >
                  <span
                    className="flex items-center justify-center w-5 h-5 rounded-md transition-all"
                    style={{ background: isActive ? btn.gradient : "#e2e8f0" }}
                  >
                    <Icon className="w-3 h-3 text-white" />
                  </span>
                  {btn.label}
                  <span
                    className="px-1 py-0.5 rounded text-[9px] font-black"
                    style={{
                      background: isActive ? btn.color + "20" : "#e2e8f0",
                      color: isActive ? btn.color : "#94a3b8",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div className="relative">
          <div className="w-full h-[420px] relative">
            <div id={MAP_ID} className="w-full h-full" />
            {(!mapReady || loadingPOIs) && (
              <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-3 z-[500]">
                <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
                <span className="text-sm font-semibold text-slate-400">
                  {loadingPOIs ? "Buscando lugares cercanos..." : "Cargando mapa..."}
                </span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 right-3 z-[500] flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-lg px-2.5 py-1.5 shadow-sm">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 shrink-0" />
              <span className="text-[10px] font-bold text-slate-600">Cuarto</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-lg px-2.5 py-1.5 shadow-sm">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shrink-0" />
              <span className="text-[10px] font-bold text-slate-600">TECSUP</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10.5px] text-lunar-eclipse font-medium">
            <MapPin className="w-3 h-3 text-amber-500" />
            <span>Datos de © OpenStreetMap — radio de búsqueda: 1.5 km</span>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || "TECSUP Santa Anita Lima")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10.5px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Ver en Google Maps
            <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </Card>
    </div>
  );
}
