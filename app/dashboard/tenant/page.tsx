"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Heart,
  MessageSquare,
  CalendarCheck,
  Star,
  MapPin,
  Sparkles,
  Target,
  Home,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Skeleton } from "@/ui/skeleton";
import useAllProperties from "@/modules/tenant/data/queries/useAllProperties";
import useTenantRequests from "@/modules/tenant/data/queries/useTenantRequests";
import useMe from "@/modules/auth/data/queries/useMe";
import useFavorites from "@/modules/tenant/hooks/useFavorites";
import { ImageWithSkeleton } from "@/modules/shared/components/ImageWithSkeleton";

export default function TenantDashboardPage() {
  const router = useRouter();
  const { data: allProperties, isLoading: loadingProperties } = useAllProperties();
  const { data: myRequests } = useTenantRequests();
  const { data: userData, isLoading: isLoadingUserData } = useMe();
  const { favorites } = useFavorites();

  const u: any = (userData as any)?.user ?? userData;
  const userName = u?.fullName;
  const isLoadingName = !userData || !u || !u?.fullName;

  const recommendedProperties = React.useMemo(() => {
    if (!allProperties) return [];
    return [...allProperties].sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [allProperties]);

  return (
    <div className="space-y-6">
      {/* Validation Banner */}
      {userData?.tenant?.verificationStatus === "pending" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-amber-800 text-sm">
              Validación en proceso
            </h4>
            <p className="text-amber-700/90 text-sm mt-1">
              Tus datos están siendo validados por la administración. Pronto te
              notificaremos cuando hayan sido verificados.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters Header */}
      <div className="bg-white/40 backdrop-blur-md border border-au-lait/60 rounded-[2.5rem] p-8 lg:p-10 shadow-sm space-y-8">
        {isLoadingName ? (
          <Skeleton className="h-20 w-full bg-au-lait/30 rounded-xl" />
        ) : (
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold text-inkwell tracking-tight">
              ¡Hola, {userName?.split(" ")[0]}!
            </h1>
            <p className="text-sm text-lunar-eclipse font-medium">
              Encuentra tu habitación perfecta cerca de TECSUP
            </p>
          </div>
        )}

        <div className="relative group w-full">
          <input
            type="text"
            placeholder="¿Dónde quieres vivir? (ej. Ate, Surco, La Molina...)"
            className="w-full px-8 py-5 bg-white border border-au-lait rounded-full shadow-sm focus:ring-4 focus:ring-creme-brulee/10 focus:border-creme-brulee outline-none transition-all text-sm font-medium"
            onClick={() => router.push("/dashboard/tenant/search")}
          />
          <Button
            className="absolute right-2 top-1/2 -translate-y-1/2 h-[calc(100%-1rem)] px-10 bg-creme-brulee hover:bg-creme-brulee/90 text-white rounded-full text-xs font-black transition-all shadow-lg shadow-creme-brulee/20 active:scale-95"
            onClick={() => router.push("/dashboard/tenant/search")}
          >
            Buscar
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-au-lait/60 text-[11px] h-10 px-5 hover:border-creme-brulee hover:bg-creme-brulee/5 text-slate-700 font-semibold transition-all"
            onClick={() => router.push("/dashboard/tenant/map")}
          >
            <MapPin className="w-4 h-4 mr-2 text-creme-brulee" />
            Explorar con mapa
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl border-au-lait/60 text-[11px] h-10 px-5 hover:border-creme-brulee hover:bg-creme-brulee/5 text-slate-700 font-semibold transition-all"
            onClick={() => router.push("/dashboard/tenant/search")}
          >
            <Target className="w-4 h-4 mr-2 text-red-500" />
            Cerca de TECSUP
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl border-au-lait/60 text-[11px] h-10 px-5 hover:border-creme-brulee hover:bg-creme-brulee/5 text-slate-700 font-semibold transition-all"
            onClick={() => router.push("/dashboard/tenant/search")}
          >
            <Home className="w-4 h-4 mr-2 text-yellow-600" />
            Hasta S/ 500
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl border-au-lait/60 text-[11px] h-10 px-5 hover:border-creme-brulee hover:bg-creme-brulee/5 text-slate-700 font-semibold transition-all"
            onClick={() => router.push("/dashboard/tenant/search")}
          >
            <Home className="w-4 h-4 mr-2 text-blue-500" />
            Con baño privado
          </Button>
        </div>
      </div>

      {/* Smart Recommendations */}
      <section className="pt-2">
        <div className="flex items-end justify-between mb-6">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-inkwell flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              Recomendaciones para ti
            </h3>
            <p className="text-xs text-lunar-eclipse font-medium">
              Basadas en tu presupuesto y preferencias de ubicación
            </p>
          </div>
          <Button
            variant="link"
            className="text-creme-brulee text-xs font-bold hover:no-underline px-0 cursor-pointer"
            onClick={() => router.push("/dashboard/tenant/search")}
          >
            Ver más
          </Button>
        </div>

        {loadingProperties ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] bg-slate-100 animate-pulse rounded-3xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedProperties.map((room: any) => (
              <PropertyCard
                key={room.id}
                room={room}
                onSelect={() => router.push(`/dashboard/tenant/property-details?id=${room.id}`)}
                isFav={favorites?.some((fav: any) => fav.id === room.id) || false}
                onToggleFav={() => {}}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Access */}
      <section>
        <h3 className="text-lg font-semibold text-inkwell mb-6">
          Accesos rápidos
        </h3>
        {!myRequests ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-20 bg-au-lait/30 rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Mis Mensajes",
                desc: "Sin mensajes nuevos",
                icon: MessageSquare,
                color: "bg-blue-500",
                badge: 0,
                onClick: () => router.push("/dashboard/tenant/messages"),
              },
              {
                title: "Mis Reservas",
                desc: `${
                  myRequests?.filter((r: any) => r.status === "pending").length || 0
                } pendientes`,
                icon: CalendarCheck,
                color: "bg-emerald-500",
                badge:
                  myRequests?.filter((r: any) => r.status === "pending").length || 0,
                onClick: () => router.push("/dashboard/tenant/reservations"),
              },
              {
                title: "Comunidad",
                desc: "Interactúa con otros estudiantes",
                icon: User,
                color: "bg-violet-500",
                badge: 0,
                onClick: () => router.push("/dashboard/tenant/community"),
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="border border-au-lait/50 hover:border-creme-brulee/50 hover:shadow-md transition-all cursor-pointer bg-white group rounded-2xl"
                onClick={item.onClick}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className={`relative size-12 ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg shadow-current/20`}
                  >
                    <item.icon className="w-6 h-6" />
                    {item.badge > 0 && (
                      <div className="absolute -top-1.5 -right-1.5 size-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold">
                        {item.badge}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-inkwell text-sm group-hover:text-creme-brulee transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-lunar-eclipse">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Popular Zones */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-5 h-5 text-lunar-eclipse" />
          <h3 className="text-lg font-semibold text-inkwell">
            Zonas populares
          </h3>
        </div>
        {loadingProperties ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="h-24 bg-au-lait/30 rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Ate Vitarte", "La Molina", "Surco", "San Borja"].map((zone) => {
              const roomCount =
                allProperties?.filter((room: any) =>
                  room.address?.toLowerCase().includes(zone.toLowerCase())
                ).length || 0;
              return (
                <Card
                  key={zone}
                  className="border border-au-lait/50 hover:border-creme-brulee/50 hover:shadow-md transition-all cursor-pointer bg-white group rounded-2xl text-center py-6"
                  onClick={() => router.push("/dashboard/tenant/search")}
                >
                  <h4 className="font-semibold text-inkwell text-sm group-hover:text-creme-brulee transition-colors">
                    {zone}
                  </h4>
                  <p className="text-[10px] font-medium text-slate-400 mt-1">
                    {roomCount} {roomCount === 1 ? "cuarto" : "cuartos"}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

const TYPE_LABELS: Record<string, string> = {
  room: "Habitación",
  apartment: "Departamento",
  house: "Casa",
  studio: "Estudio",
};

function PropertyCard({
  room,
  onSelect,
  isFav,
  onToggleFav,
}: {
  room: any;
  onSelect: () => void;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  return (
    <Card
      className="group overflow-hidden border-au-lait/50 hover:border-creme-brulee/50 hover:shadow-xl transition-all cursor-pointer bg-white rounded-3xl"
      onClick={onSelect}
    >
      <div className="relative aspect-[4/5]">
        <ImageWithSkeleton
          src={
            room.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"
          }
          alt={room.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav();
          }}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              isFav
                ? "fill-red-500 text-red-500 scale-110"
                : "text-slate-600 hover:fill-red-100"
            }`}
          />
        </button>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <Badge className="bg-white/90 backdrop-blur-sm text-inkwell font-bold shadow-sm">
            {TYPE_LABELS[room.propertyType] || room.propertyType || "Habitación"}
          </Badge>
          <div className="bg-creme-brulee text-white px-4 py-2 rounded-full font-black shadow-lg">
            S/ {room.monthlyPrice}/mes
          </div>
        </div>
      </div>
      <CardContent className="p-6 space-y-3">
        <h3 className="text-lg font-bold text-inkwell group-hover:text-creme-brulee transition-colors line-clamp-2">
          {room.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-lunar-eclipse">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{room.address}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {room.includedServices?.slice(0, 3).map((service: string) => (
            <Badge
              key={service}
              variant="outline"
              className="border-au-lait/50 text-lunar-eclipse text-[10px] font-medium bg-au-lait/10"
            >
              {service}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
