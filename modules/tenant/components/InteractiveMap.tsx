"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import {
  MapPin, Home, ShoppingBag, Scissors, Utensils,
  Clock, Phone, Navigation, GraduationCap, Store,
  Coffee, Pill, ChevronRight, X, Locate
} from "lucide-react";

/* ───────────────────────── Types ───────────────────────── */

interface Room {
  id: string;
  title: string;
  address: string;
  monthlyPrice: number;
  latitude?: number;
  longitude?: number;
  images?: Array<{ url: string }>;
}

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

interface InteractiveMapProps {
  rooms: Room[];
  onRoomClick?: (room: Room) => void;
}

/* ──────────────── Tecsup location ──────────────── */

const TECSUP = {
  name: "TECSUP Lima – Sede Principal",
  latitude: -12.0439002,
  longitude: -76.9529147,
  address: "Av. Cascanueces 2221, Santa Anita, Lima",
  hours: "Lun–Vie 8:00 a.m. – 8:00 p.m. | Sáb 8:00 a.m. – 1:00 p.m.",
  phone: "(01) 317-3900",
  transit: "Línea 2 Metro de Lima · Av. Los Ruiseñores / Carretera Central",
};

/* ──────────────── Points of Interest ──────────────── */

const POIS: POI[] = [
  // ─── Barberías ───
  {
    id: "barb-1", name: "Barbería Urban Style", type: "barberia",
    latitude: -12.0465, longitude: -76.9680,
    address: "Av. Los Ruiseñores 320, Santa Anita",
    hours: "Lun–Sáb 9:00 – 20:00", phone: "987 654 321",
    description: "Cortes modernos y clásicos, barba y cejas"
  },
  {
    id: "barb-2", name: "D'Lujos Barber Shop", type: "barberia",
    latitude: -12.0505, longitude: -76.9740,
    address: "Calle Las Amapolas 145, Santa Anita",
    hours: "Lun–Sáb 10:00 – 21:00", phone: "912 345 678",
    description: "Especialistas en fade y diseño capilar"
  },
  {
    id: "barb-3", name: "The King Barbershop", type: "barberia",
    latitude: -12.0440, longitude: -76.9750,
    address: "Jr. Los Jazmines 580, Ate Vitarte",
    hours: "Mar–Dom 9:00 – 20:00",
    description: "Ambiente premium, servicio personalizado"
  },
  // ─── Mercados ───
  {
    id: "merc-1", name: "Mercado Productores", type: "mercado",
    latitude: -12.0525, longitude: -76.9685,
    address: "Av. La Cultura 701, Santa Anita",
    hours: "Lun–Dom 5:00 – 18:00",
    description: "El mercado mayorista más grande de Lima"
  },
  {
    id: "merc-2", name: "Mercado Ceres", type: "mercado",
    latitude: -12.0453, longitude: -76.9640,
    address: "Av. Metropolitana cdra. 5, Ate",
    hours: "Lun–Dom 6:00 – 19:00",
    description: "Frutas, verduras y productos frescos"
  },
  {
    id: "merc-3", name: "Metro – Santa Anita", type: "mercado",
    latitude: -12.0430, longitude: -76.9760,
    address: "Carretera Central Km. 3, Santa Anita",
    hours: "Lun–Dom 8:00 – 22:00", phone: "(01) 613-5555",
    description: "Supermercado con variedad completa"
  },
  // ─── Tiendas ───
  {
    id: "tiend-1", name: "Mall Aventura Santa Anita", type: "tienda",
    latitude: -12.0430, longitude: -76.9640,
    address: "Av. Nicolás Ayllón 4009, Ate",
    hours: "Lun–Dom 10:00 – 22:00", phone: "(01) 618-7000",
    description: "Centro comercial con tiendas, cine y food court"
  },
  {
    id: "tiend-2", name: "Real Plaza Santa Anita", type: "tienda",
    latitude: -12.0510, longitude: -76.9755,
    address: "Av. Carretera Central cdra. 6, Santa Anita",
    hours: "Lun–Dom 10:00 – 22:00",
    description: "Centro comercial con restaurantes y entretenimiento"
  },
  {
    id: "tiend-3", name: "Promart Santa Anita", type: "tienda",
    latitude: -12.0492, longitude: -76.9650,
    address: "Av. Nicolás Ayllón 3710, Ate",
    hours: "Lun–Dom 8:00 – 21:00",
    description: "Mejoramiento del hogar y artículos en general"
  },
  // ─── Restaurantes ───
  {
    id: "rest-1", name: "Pollos & Parrillas Don Tito", type: "restaurante",
    latitude: -12.0470, longitude: -76.9725,
    address: "Av. Los Ruiseñores 180, Santa Anita",
    hours: "Lun–Dom 11:00 – 22:00",
    description: "Pollo a la brasa y parrillas al carbón"
  },
  {
    id: "rest-2", name: "Chifa Wan Tan", type: "restaurante",
    latitude: -12.0495, longitude: -76.9695,
    address: "Calle Las Orquídeas 420, Santa Anita",
    hours: "Lun–Dom 11:30 – 22:30",
    description: "Cocina chino-peruana auténtica"
  },
  {
    id: "rest-3", name: "Menú El Sabrosón", type: "restaurante",
    latitude: -12.0460, longitude: -76.9700,
    address: "Jr. Las Camelias 215, Santa Anita",
    hours: "Lun–Sáb 8:00 – 16:00",
    description: "Menú criollo diario económico para estudiantes"
  },
  {
    id: "rest-4", name: "Cevichería El Limón", type: "restaurante",
    latitude: -12.0518, longitude: -76.9720,
    address: "Av. Los Eucaliptos 560, Santa Anita",
    hours: "Mar–Dom 10:00 – 17:00",
    description: "Ceviche y mariscos frescos del día"
  },
  // ─── Farmacias ───
  {
    id: "farm-1", name: "InkaFarma Santa Anita", type: "farmacia",
    latitude: -12.0488, longitude: -76.9730,
    address: "Av. Los Ruiseñores 480, Santa Anita",
    hours: "Lun–Dom 7:00 – 23:00", phone: "(01) 314-2020",
    description: "Farmacia 24h, medicamentos y cuidado personal"
  },
  {
    id: "farm-2", name: "MiFarma Ate", type: "farmacia",
    latitude: -12.0445, longitude: -76.9690,
    address: "Av. Metropolitana 330, Ate",
    hours: "Lun–Dom 7:00 – 22:00",
    description: "Farmacia y productos de salud"
  },
  // ─── Cafés ───
  {
    id: "cafe-1", name: "Café Aroma & Arte", type: "cafe",
    latitude: -12.0475, longitude: -76.9705,
    address: "Calle Los Tulipanes 102, Santa Anita",
    hours: "Lun–Sáb 7:30 – 20:00",
    description: "Café de especialidad y repostería artesanal"
  },
  {
    id: "cafe-2", name: "Starbucks – Mall Aventura", type: "cafe",
    latitude: -12.0432, longitude: -76.9645,
    address: "Mall Aventura Santa Anita, 2do piso",
    hours: "Lun–Dom 10:00 – 22:00",
    description: "Café y bebidas con zona de estudio"
  },
];

/* ──────────────── Config ──────────────── */

/* Inline SVG paths for marker/popup HTML (no emojis) */
const SVG_ICONS: Record<string, string> = {
  tecsup: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  rooms: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  barberia: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></svg>`,
  mercado: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  tienda: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect x="9" y="14" width="6" height="7" rx="1"/><path d="M3 9h18"/></svg>`,
  restaurante: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
  farmacia: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="M8.5 8.5 16 16"/></svg>`,
  cafe: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`,
  // popup detail icons (dark stroke for white backgrounds)
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  train: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h.01"/><path d="M16 15h.01"/></svg>`,
  school: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
};

const CATEGORY_CONFIG: Record<POICategory | "rooms" | "tecsup", {
  color: string; gradient: string; svgKey: string; label: string; icon: any;
}> = {
  tecsup:      { color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", svgKey: "tecsup",      label: "TECSUP",       icon: GraduationCap },
  rooms:       { color: "#6366f1", gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", svgKey: "rooms",       label: "Cuartos",      icon: Home },
  barberia:    { color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", svgKey: "barberia",    label: "Barberías",    icon: Scissors },
  mercado:     { color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)", svgKey: "mercado",     label: "Mercados",     icon: ShoppingBag },
  tienda:      { color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", svgKey: "tienda",      label: "Tiendas",      icon: Store },
  restaurante: { color: "#ef4444", gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", svgKey: "restaurante", label: "Restaurantes", icon: Utensils },
  farmacia:    { color: "#14b8a6", gradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)", svgKey: "farmacia",    label: "Farmacias",    icon: Pill },
  cafe:        { color: "#a16207", gradient: "linear-gradient(135deg, #92400e 0%, #a16207 100%)", svgKey: "cafe",        label: "Cafés",        icon: Coffee },
};

/* ──────── Distance helper ──────── */

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

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/* ──────────── Popup HTML builders ──────────── */

function buildTecsupPopup() {
  const ic = (key: string, color = "#f59e0b") =>
    `<span style="color:${color};display:flex;align-items:center;flex-shrink:0;">${SVG_ICONS[key].replace('stroke="currentColor"', `stroke="${color}"`)}</span>`;
  return `
    <div style="font-family:'Inter',system-ui,sans-serif;width:290px;background:#fff;display:flex;flex-direction:column;">
      <div style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:20px;display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:44px;height:44px;background:rgba(255,255,255,0.25);border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:inset 0 2px 6px rgba(255,255,255,0.2);">
            ${SVG_ICONS.school.replace('width="20"', 'width="24"').replace('height="20"', 'height="24"')}
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;">
            <div style="font-size:16px;font-weight:800;color:#fff;line-height:1.25;letter-spacing:-0.2px;">${TECSUP.name}</div>
            <div style="display:inline-flex;align-items:center;background:rgba(0,0,0,0.15);padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:fit-content;">Sede Principal</div>
          </div>
        </div>
      </div>
      <div style="padding:16px 20px;display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;align-items:flex-start;gap:10px;">
          <div style="margin-top:2px;">${ic("mapPin", "#d97706")}</div>
          <span style="font-size:12px;color:#334155;line-height:1.5;font-weight:500;">${TECSUP.address}</span>
        </div>
        <div style="display:flex;align-items:flex-start;gap:10px;">
          <div style="margin-top:2px;">${ic("clock", "#d97706")}</div>
          <span style="font-size:12px;color:#475569;line-height:1.5;font-weight:500;">${TECSUP.hours}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          ${ic("phone", "#d97706")}
          <span style="font-size:12.5px;color:#1e293b;font-weight:700;">${TECSUP.phone}</span>
        </div>
        <div style="height:1px;background:#f1f5f9;margin:2px 0;"></div>
        <div style="display:flex;align-items:flex-start;gap:10px;">
          <div style="margin-top:1px;">${ic("train", "#94a3b8")}</div>
          <span style="font-size:11px;color:#64748b;line-height:1.45;font-weight:500;">${TECSUP.transit}</span>
        </div>
      </div>
    </div>
  `;
}

function buildPOIPopup(poi: POI) {
  const cfg = CATEGORY_CONFIG[poi.type];
  const dist = haversineKm(TECSUP.latitude, TECSUP.longitude, poi.latitude, poi.longitude);
  const ic = (key: string, color = cfg.color) =>
    `<span style="color:${color};display:flex;align-items:center;flex-shrink:0;">${SVG_ICONS[key].replace('stroke="currentColor"', `stroke="${color}"`)}</span>`;
  return `
    <div style="font-family:'Inter',system-ui,sans-serif;width:280px;background:#fff;display:flex;flex-direction:column;">
      <div style="background:${cfg.gradient};padding:16px 20px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;background:rgba(255,255,255,0.25);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:inset 0 2px 6px rgba(255,255,255,0.2);">
            ${SVG_ICONS[cfg.svgKey].replace('width="18"', 'width="20"').replace('height="18"', 'height="20"')}
          </div>
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:5px;">
            <div style="font-size:15px;font-weight:800;color:#fff;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;letter-spacing:-0.2px;">${poi.name}</div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="background:rgba(0,0,0,0.15);color:#fff;font-size:9px;font-weight:700;padding:3px 8px;border-radius:6px;text-transform:uppercase;letter-spacing:0.5px;">${cfg.label}</span>
              <span style="background:rgba(255,255,255,0.9);color:${cfg.color};font-size:9.5px;font-weight:800;padding:3px 8px;border-radius:6px;">${formatDistance(dist)}</span>
            </div>
          </div>
        </div>
      </div>
      <div style="padding:16px 20px;display:flex;flex-direction:column;gap:10px;">
        ${poi.description ? `<p style="font-size:12px;color:#475569;margin:0 0 4px;line-height:1.5;font-weight:500;">${poi.description}</p>` : ""}
        <div style="display:flex;align-items:flex-start;gap:10px;">
          <div style="margin-top:2px;">${ic("mapPin")}</div>
          <span style="font-size:11.5px;color:#64748b;line-height:1.45;font-weight:500;">${poi.address}</span>
        </div>
        <div style="display:flex;align-items:flex-start;gap:10px;">
          <div style="margin-top:1px;">${ic("clock")}</div>
          <span style="font-size:11.5px;color:#64748b;font-weight:500;">${poi.hours}</span>
        </div>
        ${poi.phone ? `
        <div style="display:flex;align-items:center;gap:10px;">
          ${ic("phone")}
          <span style="font-size:12px;color:#334155;font-weight:700;">${poi.phone}</span>
        </div>` : ""}
      </div>
    </div>
  `;
}

function toDataUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  return value.startsWith("data:") || value.startsWith("http") ? value : `data:image/jpeg;base64,${value}`;
}

function buildRoomPopup(room: Room) {
  const dist = haversineKm(TECSUP.latitude, TECSUP.longitude, room.latitude!, room.longitude!);
  const imgUrl = toDataUrl(room.images?.[0]?.url) || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=180&fit=crop";
  const pinIc = SVG_ICONS.mapPin.replace('stroke="currentColor"', 'stroke="#64748b"');
  const schoolIc = SVG_ICONS.school.replace('stroke="white"', 'stroke="#16a34a"');
  const arrowIc = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
  return `
    <div style="font-family:'Inter',system-ui,sans-serif;width:280px;background:#fff;display:flex;flex-direction:column;">
      <div style="position:relative;width:100%;height:140px;background:#f1f5f9;">
        <img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=180&fit=crop'" />
        <div style="position:absolute;top:10px;right:10px;background:rgba(15,23,42,0.75);backdrop-filter:blur(8px);color:#fff;padding:6px 14px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15);border:1px solid rgba(255,255,255,0.1);">
          <div style="display:flex;align-items:baseline;gap:2px;">
            <span style="font-size:14px;font-weight:800;letter-spacing:-0.5px;">S/ ${room.monthlyPrice}</span>
            <span style="font-size:10px;font-weight:600;opacity:0.85;">/mes</span>
          </div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:40px;background:linear-gradient(to top, rgba(0,0,0,0.5), transparent);"></div>
      </div>
      <div style="padding:16px;display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;flex-direction:column;gap:6px;">
          <h3 style="margin:0;font-size:15px;font-weight:800;color:#0f172a;line-height:1.3;letter-spacing:-0.2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${room.title}</h3>
          <div style="display:flex;align-items:flex-start;gap:6px;">
            <div style="margin-top:2px;">${pinIc}</div>
            <span style="font-size:12px;color:#475569;line-height:1.4;font-weight:500;">${room.address}</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid #e2e8f0;margin-top:2px;">
          <div style="display:inline-flex;align-items:center;gap:6px;background:#f0fdf4;padding:6px 10px;border-radius:8px;">
            ${schoolIc.replace('width="20"', 'width="14"').replace('height="20"', 'height="14"')}
            <span style="font-size:11px;color:#16a34a;font-weight:800;">${formatDistance(dist)}</span>
          </div>
          <button
            data-room-id="${room.id}"
            style="
              display:inline-flex;align-items:center;gap:6px;
              background:#0f172a;color:#fff;border:none;cursor:pointer;
              padding:8px 14px;border-radius:8px;
              font-size:12px;font-weight:700;letter-spacing:0.2px;
              font-family:'Inter',system-ui,sans-serif;
              box-shadow:0 2px 8px rgba(15,23,42,0.2);
              transition:all 0.2s ease;
            "
            onmouseover="this.style.background='#1e293b';this.style.transform='translateY(-1px)';"
            onmouseout="this.style.background='#0f172a';this.style.transform='translateY(0)';"
          >
            Ver Detalles
            ${arrowIc}
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ──────────── Custom Marker HTML ──────────── */

function tecsupMarkerHtml() {
  return `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;">
      <div style="
        width:52px;height:52px;border-radius:50%;
        background:linear-gradient(135deg,#f59e0b,#d97706);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 20px rgba(245,158,11,0.5),0 0 0 4px rgba(245,158,11,0.2);
        animation:tecsupPulse 2s ease-in-out infinite;
        cursor:pointer;
      ">
        ${SVG_ICONS.school}
      </div>
      <div style="
        position:absolute;top:-10px;right:-10px;
        background:#fff;color:#d97706;font-size:8px;font-weight:900;
        padding:2px 6px;border-radius:6px;
        box-shadow:0 2px 8px rgba(0,0,0,0.12);
        letter-spacing:0.5px;white-space:nowrap;
      ">TECSUP</div>
    </div>
  `;
}

function poiMarkerHtml(poi: POI) {
  const cfg = CATEGORY_CONFIG[poi.type];
  return `
    <div style="
      width:38px;height:38px;border-radius:50%;
      background:${cfg.gradient};
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 3px 12px ${cfg.color}55,0 0 0 3px ${cfg.color}22;
      cursor:pointer;
      transition:transform 0.2s ease;
    " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
      ${SVG_ICONS[cfg.svgKey]}
    </div>
  `;
}

function roomMarkerHtml() {
  return `
    <div style="
      width:40px;height:40px;border-radius:50%;
      background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 3px 14px rgba(99,102,241,0.45),0 0 0 3px rgba(99,102,241,0.18);
      cursor:pointer;
      transition:transform 0.18s ease,box-shadow 0.18s ease;
    " onmouseover="this.style.transform='scale(1.2)';this.style.boxShadow='0 6px 20px rgba(99,102,241,0.6)'"
      onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 3px 14px rgba(99,102,241,0.45)'">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>
  `;
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

export function InteractiveMap({ rooms, onRoomClick }: InteractiveMapProps) {
  const mapRef = useRef<any>(null);
  const layerGroupsRef = useRef<Record<string, any>>({});
  const [mapReady, setMapReady] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    new Set(["rooms", "barberia", "mercado", "tienda", "restaurante", "farmacia", "cafe"])
  );
  const [showTecsupCard, setShowTecsupCard] = useState(true);

  /* ── inject global CSS for pulse animation ── */
  useEffect(() => {
    const id = "leaflet-custom-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes tecsupPulse {
        0%, 100% { box-shadow: 0 4px 20px rgba(245,158,11,0.5), 0 0 0 4px rgba(245,158,11,0.2); }
        50%       { box-shadow: 0 4px 30px rgba(245,158,11,0.7), 0 0 0 8px rgba(245,158,11,0.1); }
      }
      .leaflet-popup-content-wrapper {
        border-radius: 16px !important;
        padding: 0 !important;
        overflow: hidden !important;
        box-shadow: 0 16px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08) !important;
        border: none !important;
      }
      .leaflet-popup-content { margin: 0 !important; width: auto !important; }
      .leaflet-popup-tip-container { margin-top: -1px !important; }
      .leaflet-popup-tip { box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
    `;
    document.head.appendChild(style);
  }, []);

  /* ── Load Leaflet & build the map ── */
  useEffect(() => {
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
      // Bail out if cleanup already ran while we were awaiting Leaflet
      if (disposed) return;

      const L = (window as any).L;
      if (!L) return;

      const container = document.getElementById("tenant-map");
      if (!container) return;

      // ── Destroy any previous map instance on this container ──
      // This prevents the "_leaflet_pos" crash from React StrictMode's
      // double-invocation of effects (effect runs → cleanup → effect runs again).
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (_) {}
        mapRef.current = null;
      }
      // Clear Leaflet's own container flag so it doesn't think it's already inited
      if ((container as any)._leaflet_id) {
        (container as any)._leaflet_id = undefined;
      }

      // One final disposed check after all synchronous cleanup
      if (disposed) return;

      /* ── Map instance ── */
      const map = L.map("tenant-map", {
        zoomControl: false,
      }).setView([TECSUP.latitude, TECSUP.longitude], 15);
      mapRef.current = map;

      // Zoom control top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Premium tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);

      // Limit bounds to Lima metro area
      const bounds = L.latLngBounds(L.latLng(-12.2, -77.2), L.latLng(-11.8, -76.7));
      map.setMaxBounds(bounds);
      map.on("drag", () => map.panInsideBounds(bounds, { animate: false }));

      /* ── Tecsup marker (always visible) ── */
      const tecsupIcon = L.divIcon({
        className: "",
        html: tecsupMarkerHtml(),
        iconSize: [60, 60],
        iconAnchor: [30, 30],
      });
      const tecsupMarker = L.marker([TECSUP.latitude, TECSUP.longitude], { icon: tecsupIcon, zIndexOffset: 1000 }).addTo(map);
      tecsupMarker.bindPopup(buildTecsupPopup(), { maxWidth: 340, className: "" });

      /* ── Layer groups per category ── */
      const groups: Record<string, any> = {};

      // Room layer
      const roomGroup = L.layerGroup();
      rooms.forEach((room) => {
        if (!room.latitude || !room.longitude) return;
        const icon = L.divIcon({
          className: "",
          html: roomMarkerHtml(),
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });
        const marker = L.marker([room.latitude, room.longitude], { icon });
        // Click opens popup only — navigation is handled by the "Ver Detalles" button inside
        marker.bindPopup(buildRoomPopup(room), { maxWidth: 310, className: "", closeButton: true });
        marker.addTo(roomGroup);
      });
      groups["rooms"] = roomGroup;
      roomGroup.addTo(map);

      // Wire up "Ver Detalles" buttons inside room popups
      if (onRoomClick) {
        map.on("popupopen", (e: any) => {
          const container: HTMLElement | null = e.popup.getElement();
          if (!container) return;
          const btn = container.querySelector<HTMLButtonElement>("[data-room-id]");
          if (!btn) return;
          const roomId = btn.getAttribute("data-room-id");
          const target = rooms.find((r) => r.id === roomId);
          if (target) {
            // Remove previous listener clone to avoid duplicates
            const fresh = btn.cloneNode(true) as HTMLButtonElement;
            btn.parentNode?.replaceChild(fresh, btn);
            fresh.addEventListener("click", () => onRoomClick(target));
          }
        });
      }

      // POI layers
      const poiCategories: POICategory[] = ["barberia", "mercado", "tienda", "restaurante", "farmacia", "cafe"];
      poiCategories.forEach((cat) => {
        const group = L.layerGroup();
        POIS.filter((p) => p.type === cat).forEach((poi) => {
          const icon = L.divIcon({
            className: "",
            html: poiMarkerHtml(poi),
            iconSize: [38, 38],
            iconAnchor: [19, 19],
          });
          const marker = L.marker([poi.latitude, poi.longitude], { icon });
          marker.bindPopup(buildPOIPopup(poi), { maxWidth: 320, className: "" });
          marker.addTo(group);
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
  }, [rooms, onRoomClick]);

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

  /* ── Toggle filter ── */
  const toggleFilter = useCallback((id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    const allIds = ["rooms", "barberia", "mercado", "tienda", "restaurante", "farmacia", "cafe"];
    setActiveFilters((prev) => (prev.size === allIds.length ? new Set() : new Set(allIds)));
  }, []);

  const centerTecsup = useCallback(() => {
    mapRef.current?.flyTo([TECSUP.latitude, TECSUP.longitude], 16, { duration: 1.2 });
  }, []);

  /* ── Filter button config ── */
  const filterButtons = [
    { id: "rooms",       ...CATEGORY_CONFIG.rooms },
    { id: "barberia",    ...CATEGORY_CONFIG.barberia },
    { id: "mercado",     ...CATEGORY_CONFIG.mercado },
    { id: "tienda",      ...CATEGORY_CONFIG.tienda },
    { id: "restaurante", ...CATEGORY_CONFIG.restaurante },
    { id: "farmacia",    ...CATEGORY_CONFIG.farmacia },
    { id: "cafe",        ...CATEGORY_CONFIG.cafe },
  ];

  const activeCount = POIS.filter((p) => activeFilters.has(p.type)).length +
    (activeFilters.has("rooms") ? rooms.filter((r) => r.latitude && r.longitude).length : 0);

  return (
    <div className="space-y-4">
      {/* ─── Filter Bar ─── */}
      <Card className="border-au-lait/60 bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Filtrar puntos de interés</h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {activeCount} {activeCount === 1 ? "punto" : "puntos"} visibles en el mapa
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={centerTecsup}
                className="h-9 px-3 text-[11px] font-bold text-amber-600 hover:bg-amber-50 rounded-xl gap-1.5"
              >
                <Locate className="w-3.5 h-3.5" />
                TECSUP
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAll}
                className="h-9 px-3 text-[11px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
              >
                {activeFilters.size === filterButtons.length ? "Ocultar todo" : "Mostrar todo"}
              </Button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => {
              const Icon = btn.icon;
              const isActive = activeFilters.has(btn.id);
              const count = btn.id === "rooms"
                ? rooms.filter((r) => r.latitude && r.longitude).length
                : POIS.filter((p) => p.type === btn.id).length;

              return (
                <button
                  key={btn.id}
                  onClick={() => toggleFilter(btn.id)}
                  className="group relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-bold transition-all duration-200 border"
                  style={{
                    background: isActive ? btn.color + "12" : "#f8fafc",
                    borderColor: isActive ? btn.color + "40" : "#e2e8f0",
                    color: isActive ? btn.color : "#94a3b8",
                  }}
                >
                  <span
                    className="flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-200"
                    style={{
                      background: isActive ? btn.gradient : "#e2e8f0",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </span>
                  {btn.label}
                  <span
                    className="ml-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black transition-all"
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
      </Card>

      {/* ─── Map Container ─── */}
      <div className="relative">
        <Card className="overflow-hidden border-au-lait/60 rounded-[2rem] shadow-lg">
          <div id="tenant-map-container" className="w-full h-[560px] relative">
            <div id="tenant-map" className="w-full h-full" />
            {!mapReady && (
              <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-3 z-[500]">
                <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
                <span className="text-sm font-semibold text-slate-400">Cargando mapa...</span>
              </div>
            )}
          </div>
        </Card>

        {/* ─── Tecsup Info Floating Card ─── */}
        {showTecsupCard && (
          <div className="absolute bottom-5 left-5 z-[500] w-[300px] animate-in slide-in-from-bottom-4 duration-500">
            <Card className="border-amber-200/60 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
              <button
                onClick={() => setShowTecsupCard(false)}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">TECSUP Lima</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Sede Principal</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-[10.5px] text-slate-500 font-medium leading-snug">{TECSUP.address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-[10px] text-slate-400 font-medium leading-snug">{TECSUP.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-[11px] text-slate-600 font-bold">{TECSUP.phone}</span>
                  </div>
                </div>
                <button
                  onClick={centerTecsup}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[11px] font-bold transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Centrar en mapa
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Re-show button when card is hidden */}
        {!showTecsupCard && (
          <button
            onClick={() => setShowTecsupCard(true)}
            className="absolute bottom-5 left-5 z-[500] w-10 h-10 bg-white/90 backdrop-blur-xl border border-amber-200 rounded-xl shadow-lg flex items-center justify-center hover:bg-amber-50 transition-colors"
          >
            <GraduationCap className="w-5 h-5 text-amber-500" />
          </button>
        )}
      </div>
    </div>
  );
}
