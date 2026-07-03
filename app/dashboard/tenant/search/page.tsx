"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Heart,
  MapPin,
  DollarSign,
  Navigation,
  Filter,
  X,
  ChevronDown,
  Wifi,
  Zap,
  Droplets,
  Utensils,
  Bath,
  Dog,
  Shirt,
  Tv,
  Wind,
  ShieldCheck,
  Dumbbell,
  Car,
  Armchair,
  Loader2,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Slider } from "@/ui/slider";
import { Checkbox } from "@/ui/checkbox";
import { Label } from "@/ui/label";
import { Input } from "@/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { ViewHeader } from "@/modules/tenant/components/ViewHeader";
import useAllProperties from "@/modules/tenant/data/queries/useAllProperties";
import useFavorites from "@/modules/tenant/hooks/useFavorites";
import { ImageWithSkeleton } from "@/modules/shared/components/ImageWithSkeleton";

export default function TenantSearchPage() {
  const router = useRouter();

  // Queries
  const { data: allProperties, isLoading: loadingProperties } =
    useAllProperties();
  const { favorites, toggleFavorite, isFavorite, isLoading: isLoadingFavorites } =
    useFavorites();

  // Filter States
  const [searchQuery, setSearchQuery] = React.useState("");
  const [priceRange, setPriceRange] = React.useState([0, 2000]);
  const [nearMe, setNearMe] = React.useState(false);
  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);
  const [propertyType, setPropertyType] = React.useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);

  const filteredProperties = React.useMemo(() => {
    if (!allProperties) return [];
    return allProperties.filter((room: any) => {
      // Search text
      const matchesSearch =
        !searchQuery ||
        searchQuery === "all_districts" ||
        room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.address.toLowerCase().includes(searchQuery.toLowerCase());

      // Price
      const matchesPrice =
        room.monthlyPrice >= priceRange[0] && room.monthlyPrice <= priceRange[1];

      // Near me (Simulated for demo)
      const matchesNearMe =
        !nearMe ||
        room.address.toLowerCase().includes("tecsup") ||
        room.address.toLowerCase().includes("santa anita");

      // Services with keyword mapping for better matching
      const serviceMapping: Record<string, string[]> = {
        Wifi: ["wifi", "internet", "wi-fi"],
        Luz: ["luz", "electricidad", "energía"],
        Agua: ["agua", "h2o"],
        Lavandería: ["lavandería", "lavadora", "dryer", "laundry"],
        Cocina: ["cocina", "kitchen", "kitchenette"],
        "Baño Privado": ["baño privado", "baño propio", "private bathroom"],
        Amoblado: ["amoblado", "furnished", "muebles"],
        Seguridad: ["seguridad", "vigilancia", "guardianía", "security"],
        Gimnasio: ["gimnasio", "gym", "fitness"],
        Estacionamiento: ["estacionamiento", "cochera", "parking", "garage"],
        "TV Cable": ["tv cable", "cable", "televisión"],
        Mascotas: ["mascotas", "pets", "perros", "gatos"],
      };

      const matchesServices =
        selectedServices.length === 0 ||
        selectedServices.every((s) => {
          const keywords = serviceMapping[s] || [s.toLowerCase()];
          const roomServices = [
            ...(room.includedServices || []),
            ...(room.services || []),
            ...(room.features?.map((f: any) => f.name) || []),
          ];
          return roomServices.some((roomS: string) =>
            keywords.some((k) => roomS.toLowerCase().includes(k))
          );
        });

      // Property Type
      const matchesType = !propertyType || room.propertyType === propertyType;

      return (
        matchesSearch &&
        matchesPrice &&
        matchesNearMe &&
        matchesServices &&
        matchesType
      );
    });
  }, [
    allProperties,
    searchQuery,
    priceRange,
    nearMe,
    selectedServices,
    propertyType,
  ]);

  return (
    <div className="space-y-6">
      <ViewHeader
        title="Explorar Habitaciones"
        description="Filtra por zona, precio o servicios para encontrar tu lugar ideal."
      />
      <div className="bg-white border border-au-lait/60 rounded-[2.5rem] p-8 lg:p-10 shadow-sm space-y-8">
        <div className="space-y-6">
          {/* Search Bar with Buscar Button */}
          <div className="relative group w-full">
            <Input
              placeholder="Zonas, precios o servicios..."
              className="w-full px-8 pr-40 py-7 bg-slate-50/50 border-au-lait rounded-2xl shadow-sm focus-visible:ring-4 focus-visible:ring-creme-brulee/10 focus-visible:border-creme-brulee outline-none transition-all text-sm font-medium"
              value={searchQuery === "all_districts" ? "" : searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="absolute right-2 top-1/2 -translate-y-1/2 h-[calc(100%-1rem)] px-10 bg-creme-brulee hover:bg-creme-brulee/90 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-creme-brulee/20 active:scale-95">
              Buscar
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* District Select */}
            <Select
              value={searchQuery === "" ? "all_districts" : searchQuery}
              onValueChange={setSearchQuery}
            >
              <SelectTrigger className="w-44 h-12 px-4 rounded-xl border-au-lait bg-white text-slate-600 font-bold text-[11px] gap-2 transition-all hover:border-creme-brulee/50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-creme-brulee" />
                  <SelectValue placeholder="Distrito" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-au-lait">
                <SelectItem value="all_districts">Todos los distritos</SelectItem>
                {[
                  "Ate Vitarte",
                  "Santa Anita",
                  "La Molina",
                  "Surco",
                  "San Borja",
                  "San Isidro",
                  "Miraflores",
                  "Cercado de Lima",
                ].map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-44 h-12 px-4 rounded-xl border-au-lait bg-white text-slate-600 font-bold text-[11px] gap-2 transition-all hover:border-creme-brulee/50"
                >
                  <DollarSign className="w-3.5 h-3.5 text-yellow-600" />
                  S/ {priceRange[0]} - {priceRange[1]}
                  <ChevronDown className="w-3 h-3 opacity-50 ml-auto" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-6 rounded-2xl border-au-lait shadow-xl"
                align="start"
              >
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-inkwell">
                    Rango de precio
                  </h4>
                  <Slider
                    value={priceRange}
                    max={2000}
                    step={50}
                    onValueChange={setPriceRange}
                    className="py-4"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-lunar-eclipse">
                    <span>Min: S/ {priceRange[0]}</span>
                    <span>Max: S/ {priceRange[1]}</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Services Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-44 h-12 px-4 rounded-xl border-au-lait gap-2 text-[11px] font-bold transition-all ${
                    selectedServices.length > 0
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-lg"
                      : "bg-white text-slate-600 hover:bg-slate-50 hover:border-creme-brulee/50"
                  }`}
                >
                  <Zap
                    className={`w-3.5 h-3.5 ${
                      selectedServices.length > 0 ? "text-white" : "text-slate-400"
                    }`}
                  />
                  Servicios
                  {selectedServices.length > 0 && (
                    <Badge className="bg-white text-emerald-600 text-[9px] min-w-4 h-4 p-0 flex items-center justify-center rounded-full ml-1 border-none font-black">
                      {selectedServices.length}
                    </Badge>
                  )}
                  <ChevronDown className="w-3 h-3 opacity-50 ml-auto" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[550px] p-6 rounded-3xl border-au-lait shadow-2xl"
                align="end"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase">
                      Selecciona los servicios
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="h-7 text-[10px] text-slate-400 font-bold px-3 hover:bg-slate-100 rounded-lg"
                        onClick={() => setSelectedServices([])}
                      >
                        Limpiar
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-7 text-[10px] text-creme-brulee font-bold px-3 hover:bg-creme-brulee/10 rounded-lg"
                        onClick={() => {
                          const allS = [
                            "Wifi",
                            "Luz",
                            "Agua",
                            "Lavandería",
                            "Cocina",
                            "Baño Privado",
                            "Amoblado",
                            "Seguridad",
                            "Gimnasio",
                            "Estacionamiento",
                            "TV Cable",
                            "Mascotas",
                          ];
                          setSelectedServices(allS);
                        }}
                      >
                        Seleccionar todos
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-2">
                    {[
                      { name: "Wifi", icon: Wifi },
                      { name: "Luz", icon: Zap },
                      { name: "Agua", icon: Droplets },
                      { name: "Lavandería", icon: Shirt },
                      { name: "Cocina", icon: Utensils },
                      { name: "Baño Privado", icon: Bath },
                      { name: "Amoblado", icon: Armchair },
                      { name: "Seguridad", icon: ShieldCheck },
                      { name: "Gimnasio", icon: Dumbbell },
                      { name: "Estacionamiento", icon: Car },
                      { name: "TV Cable", icon: Tv },
                      { name: "Mascotas", icon: Dog },
                    ].map((s) => (
                      <div
                        key={s.name}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
                          selectedServices.includes(s.name)
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-slate-50 border-transparent hover:bg-slate-100"
                        }`}
                        onClick={() => {
                          setSelectedServices((prev) =>
                            prev.includes(s.name)
                              ? prev.filter((x) => x !== s.name)
                              : [...prev, s.name]
                          );
                        }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <s.icon
                            className={`w-3 h-3 shrink-0 ${
                              selectedServices.includes(s.name)
                                ? "text-emerald-600"
                                : "text-slate-400"
                            }`}
                          />
                          <span className="text-[9px] font-bold text-inkwell truncate">
                            {s.name}
                          </span>
                        </div>
                        <Checkbox
                          checked={selectedServices.includes(s.name)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 size-3.5 rounded-[4px] shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {(searchQuery ||
              nearMe ||
              selectedServices.length > 0 ||
              propertyType ||
              priceRange[0] > 0 ||
              priceRange[1] < 2000) && (
              <Button
                variant="ghost"
                className="text-slate-400 text-xs hover:text-red-500 hover:bg-red-50 flex items-center gap-1 h-12 px-3 rounded-xl transition-colors"
                onClick={() => {
                  setSearchQuery("");
                  setNearMe(false);
                  setPriceRange([0, 2000]);
                  setSelectedServices([]);
                  setPropertyType(null);
                }}
              >
                <X className="w-3 h-3" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </div>

      {loadingProperties ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-creme-brulee" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties?.map((room: any) => (
            <PropertyCard
              key={room.id}
              room={room}
              onSelect={() =>
                router.push(`/dashboard/tenant/property-details?id=${room.id}`)
              }
              isFav={isFavorite(room.id)}
              onToggleFav={() => toggleFavorite(room.id)}
            />
          ))}
        </div>
      )}
      {!loadingProperties && filteredProperties.length === 0 && (
        <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-au-lait shadow-sm">
          <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-inkwell mb-2">
            No encontramos resultados
          </h3>
          <p className="text-lunar-eclipse">
            Intenta ajustar tus filtros para encontrar lo que buscas.
          </p>
        </div>
      )}
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
          src={room.images?.[0]?.url || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"}
          alt={room.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav();
          }}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white border border-au-lait/50 transition-all cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-all ${
              isFav
                ? "fill-red-500 text-red-500 scale-110"
                : "text-slate-500 hover:text-red-400"
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
