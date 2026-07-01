"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, Loader2, Search } from "lucide-react";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { ViewHeader } from "@/modules/tenant/components/ViewHeader";
import useAllProperties from "@/modules/tenant/data/queries/useAllProperties";
import useFavorites from "@/modules/tenant/hooks/useFavorites";
import { ImageWithSkeleton } from "@/modules/shared/components/ImageWithSkeleton";

export default function TenantFavoritesPage() {
  const router = useRouter();
  const { data: allProperties } = useAllProperties();
  const { favorites, toggleFavorite, isLoading: isLoadingFavorites } = useFavorites();

  return (
    <div className="space-y-6">
      <ViewHeader
        title="Mis Favoritos"
        description={`Tienes ${favorites?.length || 0} habitaciones guardadas`}
      />
      {isLoadingFavorites ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-creme-brulee" />
        </div>
      ) : !favorites || favorites.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-3xl p-16 text-center border border-au-lait/50 shadow-lg">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
            <Heart className="w-10 h-10 text-red-400 fill-red-200" />
          </div>
          <h3 className="text-2xl font-bold text-inkwell mb-3">Aún no tienes favoritos</h3>
          <p className="text-base text-lunar-eclipse mb-8 max-w-md mx-auto">
            Guarda las habitaciones que más te gusten para verlas después y compararlas fácilmente.
          </p>
          <Button
            onClick={() => router.push("/dashboard/tenant/search")}
            className="bg-gradient-to-r from-creme-brulee to-emerald-600 hover:from-creme-brulee/90 hover:to-emerald-600/90 text-white rounded-2xl px-8 py-3 text-sm font-bold shadow-lg shadow-creme-brulee/20 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Explorar habitaciones
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-au-lait/50 shadow-sm">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <span className="text-sm font-semibold text-inkwell">{favorites.length} favoritos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-lunar-eclipse font-medium">Ordenar por:</span>
              <Select defaultValue="recent">
                <SelectTrigger className="w-40 h-9 text-xs font-semibold border-au-lait/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                  <SelectItem value="rating">Mejor calificados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav: any) => {
              const fullProperty = allProperties?.find((p: any) => p.id === fav.id);
              const room = fullProperty ? { ...fav, landlord: fullProperty.landlord } : fav;
              return (
                <PropertyCard
                  key={room.id}
                  room={room}
                  onSelect={() => router.push("/dashboard/tenant/property-details")}
                  isFav={true}
                  onToggleFav={() => toggleFavorite(room.id)}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function PropertyCard({
  room, onSelect, isFav, onToggleFav }: {
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
          src={room.images?.[0]?.url || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"}
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
            {room.propertyType || "Habitación"}
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
          <Search className="w-4 h-4 shrink-0" />
          <span className="truncate">{room.address}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {room.includedServices?.slice(0,3).map((service: string) => (
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
