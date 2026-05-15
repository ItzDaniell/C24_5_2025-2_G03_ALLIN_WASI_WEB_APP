"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "./components";
import {
  Search, Heart, MessageSquare, CalendarCheck, Star,
  MapPin, Calendar, Map as MapIcon, Users, Bot, Loader2, Clock,
  Sparkles, Target, Home
} from "lucide-react";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Slider } from "@/ui/slider";
import { Checkbox } from "@/ui/checkbox";
import { Label } from "@/ui/label";
import { Input } from "@/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { AlertCircle } from "lucide-react";
import {
  DollarSign, Navigation, Filter, X, ChevronDown,
  Wifi, Zap, Droplets, Utensils, Bath, Dog, Shirt,
  Tv, Wind, ShieldCheck, Dumbbell, Car, Armchair
} from "lucide-react";
import useAllProperties from "./data/queries/useAllProperties";
import useTenantRequests from "./data/queries/useTenantRequests";
import useMe from "@/modules/auth/data/queries/useMe";
import { PropertyDetailsView } from "./components/views/properties/PropertyDetailsView";
import { MessagesView } from "./components/views/messages/MessagesView";
import useFavorites from "./hooks/useFavorites";
import { ViewHeader } from "./components/ViewHeader";
import useDeleteRequest from "./data/mutations/useDeleteRequest";
import { useCreateConversation } from "@/modules/landlord/data/mutations/useChatActions";
import { Skeleton } from "@/ui/skeleton";
import { SettingsView } from "./components/views/settings";

import { ImageWithSkeleton } from "@/modules/shared/components/ImageWithSkeleton";

export default function TenantDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'dashboard';
  const selectedPropertyId = searchParams.get('propertyId');
  const [sidebarExpanded, setSidebarExpanded] = React.useState<boolean>(true);

  // Queries
  const { data: allProperties, isLoading: loadingProperties } = useAllProperties();
  const { data: myRequests, isLoading: loadingRequests } = useTenantRequests();
  const { data: userData } = useMe();
  const { favorites, toggleFavorite, isFavorite, isLoading: isLoadingFavorites } = useFavorites();
  const { mutate: deleteRequest } = useDeleteRequest();
  const { mutate: createChat, isPending: creatingChat } = useCreateConversation();

  // Filter States
  const [searchQuery, setSearchQuery] = React.useState("");
  const [priceRange, setPriceRange] = React.useState([0, 2000]);
  const [nearMe, setNearMe] = React.useState(false);
  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);
  const [propertyType, setPropertyType] = React.useState<string | null>(null);
  const [reservationFilter, setReservationFilter] = React.useState<string>("pending");
  const [requestToCancel, setRequestToCancel] = React.useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = React.useState<any[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);

  const recommendedProperties = React.useMemo(() => {
    if (!allProperties) return [];
    return [...allProperties].sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [allProperties]);

  React.useEffect(() => {
    const saved = localStorage.getItem('recently_viewed');
    if (saved) setRecentlyViewed(JSON.parse(saved));
  }, []);

  React.useEffect(() => {
    if (view === 'property-details' && selectedPropertyId && allProperties) {
      const prop = allProperties.find((p: any) => p.id === selectedPropertyId);
      if (prop) {
        setRecentlyViewed(prev => {
          const filtered = prev.filter(p => p.id !== prop.id);
          const updated = [prop, ...filtered].slice(0, 4);
          localStorage.setItem('recently_viewed', JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [view, selectedPropertyId, allProperties]);

  const filteredProperties = React.useMemo(() => {
    if (!allProperties) return [];
    return allProperties.filter((room: any) => {
      // Search text
      const matchesSearch = !searchQuery || searchQuery === "all_districts" ||
        room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.address.toLowerCase().includes(searchQuery.toLowerCase());

      // Price
      const matchesPrice = room.monthlyPrice >= priceRange[0] && room.monthlyPrice <= priceRange[1];

      // Near me (Simulated for demo)
      const matchesNearMe = !nearMe ||
        room.address.toLowerCase().includes("tecsup") ||
        room.address.toLowerCase().includes("santa anita");

      // Services with keyword mapping for better matching
      const serviceMapping: Record<string, string[]> = {
        'Wifi': ['wifi', 'internet', 'wi-fi'],
        'Luz': ['luz', 'electricidad', 'energía'],
        'Agua': ['agua', 'h2o'],
        'Lavandería': ['lavandería', 'lavadora', 'dryer', 'laundry'],
        'Cocina': ['cocina', 'kitchen', 'kitchenette'],
        'Baño Privado': ['baño privado', 'baño propio', 'private bathroom'],
        'Amoblado': ['amoblado', 'furnished', 'muebles'],
        'Seguridad': ['seguridad', 'vigilancia', 'guardianía', 'security'],
        'Gimnasio': ['gimnasio', 'gym', 'fitness'],
        'Estacionamiento': ['estacionamiento', 'cochera', 'parking', 'garage'],
        'TV Cable': ['tv cable', 'cable', 'televisión'],
        'Mascotas': ['mascotas', 'pets', 'perros', 'gatos']
      };

      const matchesServices = selectedServices.length === 0 ||
        selectedServices.every(s => {
          const keywords = serviceMapping[s] || [s.toLowerCase()];
          const roomServices = [
            ...(room.includedServices || []),
            ...(room.services || []),
            ...(room.features?.map((f: any) => f.name) || [])
          ];
          return roomServices.some((roomS: string) => 
            keywords.some(k => roomS.toLowerCase().includes(k))
          );
        });

      // Property Type
      const matchesType = !propertyType || room.propertyType === propertyType;

      return matchesSearch && matchesPrice && matchesNearMe && matchesServices && matchesType;
    });
  }, [allProperties, searchQuery, priceRange, nearMe, selectedServices, propertyType]);

  const u: any = (userData as any)?.user ?? userData;
  const userName = u?.fullName ?? u?.name ?? "Estudiante";

  const handleChangeView = React.useCallback((v: string, propertyId?: string, chatId?: string) => {
    const params = new URLSearchParams();
    params.set('view', v);
    if (propertyId) params.set('propertyId', propertyId);
    if (chatId) params.set('chatId', chatId);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router]);

  const toggleSidebar = React.useCallback(() => {
    setSidebarExpanded(prev => !prev);
  }, []);

  const renderContent = () => {
    if (view === 'property-details' && selectedPropertyId) {
      return (
        <PropertyDetailsView
          propertyId={selectedPropertyId}
          onBack={() => router.back()}
          onViewMessages={(chatId) => handleChangeView('messages', undefined, chatId)}
        />
      );
    }

    switch (view) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Search and Filters Header */}
            <div className="bg-white/40 backdrop-blur-md border border-au-lait/60 rounded-[2.5rem] p-8 lg:p-10 shadow-sm space-y-8">
              <div className="space-y-1.5">
                <h1 className="text-3xl font-bold text-inkwell tracking-tight">¡Hola, {userName.split(' ')[0]}!</h1>
                <p className="text-sm text-lunar-eclipse font-medium">Encuentra tu habitación perfecta cerca de TECSUP</p>
              </div>

              <div className="relative group w-full">
                <input
                  type="text"
                  placeholder="¿Dónde quieres vivir? (ej. Ate, Surco, La Molina...)"
                  className="w-full px-8 py-5 bg-white border border-au-lait rounded-full shadow-sm focus:ring-4 focus:ring-creme-brulee/10 focus:border-creme-brulee outline-none transition-all text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-[calc(100%-1rem)] px-10 bg-creme-brulee hover:bg-creme-brulee/90 text-white rounded-full text-xs font-black transition-all shadow-lg shadow-creme-brulee/20 active:scale-95"
                  onClick={() => handleChangeView('search')}
                >
                  Buscar
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-2xl border-au-lait/60 text-[11px] h-10 px-5 hover:border-creme-brulee hover:bg-creme-brulee/5 text-slate-700 font-semibold transition-all" onClick={() => handleChangeView('search')}>
                  <MapIcon className="w-4 h-4 mr-2 text-creme-brulee" />
                  Explorar con mapa
                </Button>
                <Button variant="outline" className="rounded-2xl border-au-lait/60 text-[11px] h-10 px-5 hover:border-creme-brulee hover:bg-creme-brulee/5 text-slate-700 font-semibold transition-all" onClick={() => { setNearMe(true); handleChangeView('search'); }}>
                  <Target className="w-4 h-4 mr-2 text-red-500" />
                  Cerca de TECSUP
                </Button>
                <Button variant="outline" className="rounded-2xl border-au-lait/60 text-[11px] h-10 px-5 hover:border-creme-brulee hover:bg-creme-brulee/5 text-slate-700 font-semibold transition-all" onClick={() => { setPriceRange([0, 500]); handleChangeView('search'); }}>
                  <DollarSign className="w-4 h-4 mr-2 text-yellow-600" />
                  Hasta S/ 500
                </Button>
                <Button variant="outline" className="rounded-2xl border-au-lait/60 text-[11px] h-10 px-5 hover:border-creme-brulee hover:bg-creme-brulee/5 text-slate-700 font-semibold transition-all" onClick={() => { setSelectedServices(['Baño Privado']); handleChangeView('search'); }}>
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
                  <p className="text-xs text-lunar-eclipse font-medium">Basadas en tu presupuesto y preferencias de ubicación</p>
                </div>
                <Button
                  variant="link"
                  className="text-creme-brulee text-xs font-bold hover:no-underline px-0 cursor-pointer"
                  onClick={() => handleChangeView('search')}
                >
                  Ver más
                </Button>
              </div>

              {loadingProperties ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => <div key={i} className="aspect-[4/5] bg-slate-100 animate-pulse rounded-3xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recommendedProperties.map((room: any) => (
                    <PropertyCard
                      key={room.id}
                      room={room}
                      onSelect={() => handleChangeView('property-details', room.id)}
                      isFav={isFavorite(room.id)}
                      onToggleFav={() => toggleFavorite(room.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Quick Access */}
            <section>
              <h3 className="text-lg font-semibold text-inkwell mb-6">Accesos rápidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Mis Mensajes',
                    desc: 'Sin mensajes nuevos',
                    icon: MessageSquare,
                    color: 'bg-blue-500',
                    badge: 0,
                    onClick: () => handleChangeView('messages')
                  },
                  {
                    title: 'Mis Reservas',
                    desc: `${myRequests?.filter((r: any) => r.status === 'pending').length || 0} pendientes`,
                    icon: CalendarCheck,
                    color: 'bg-emerald-500',
                    badge: myRequests?.filter((r: any) => r.status === 'pending').length || 0,
                    onClick: () => handleChangeView('reservations')
                  },
                  {
                    title: 'Comunidad',
                    desc: 'Próximamente',
                    icon: Users,
                    color: 'bg-violet-500',
                    badge: 0,
                    onClick: () => { }
                  }
                ].map((item, idx) => (
                  <Card
                    key={idx}
                    className="border border-au-lait/50 hover:border-creme-brulee/30 hover:shadow-md transition-all cursor-pointer bg-white group rounded-2xl"
                    onClick={item.onClick}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`relative size-12 ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg shadow-current/20`}>
                        <item.icon className="w-6 h-6" />
                        {item.badge > 0 && (
                          <div className="absolute -top-1.5 -right-1.5 size-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold">
                            {item.badge}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-inkwell text-sm group-hover:text-creme-brulee transition-colors">{item.title}</h4>
                        <p className="text-[11px] text-lunar-eclipse">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-lunar-eclipse" />
                  <h3 className="text-lg font-semibold text-inkwell">Vistos recientemente</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentlyViewed.map((room) => (
                    <Card
                      key={room.id}
                      className="border border-au-lait/50 overflow-hidden hover:shadow-md transition-all cursor-pointer bg-white group rounded-2xl"
                      onClick={() => handleChangeView('property-details', room.id)}
                    >
                      <div className="flex h-24">
                        <div className="w-32 h-full shrink-0">
                          <ImageWithSkeleton src={room.images?.[0]?.url} alt={room.title} className="w-full h-full" />
                        </div>
                        <div className="p-3 flex flex-col justify-center min-w-0">
                          <h4 className="text-sm font-semibold text-inkwell truncate group-hover:text-creme-brulee transition-colors">{room.title}</h4>
                          <p className="text-xs font-bold text-creme-brulee mt-1">S/ {room.monthlyPrice}/mes</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-2.5 h-2.5 fill-creme-brulee text-creme-brulee" />
                            <span className="text-[10px] font-semibold text-lunar-eclipse">4.4</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Popular Zones */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Navigation className="w-5 h-5 text-lunar-eclipse" />
                <h3 className="text-lg font-semibold text-inkwell">Zonas populares</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Ate Vitarte', 'La Molina', 'Surco', 'San Borja'].map((zone) => (
                  <Card
                    key={zone}
                    className="border border-au-lait/50 hover:border-creme-brulee/30 hover:shadow-md transition-all cursor-pointer bg-white group rounded-2xl text-center py-6"
                    onClick={() => { setSearchQuery(zone); handleChangeView('search'); }}
                  >
                    <h4 className="font-semibold text-inkwell text-sm group-hover:text-creme-brulee transition-colors">{zone}</h4>
                    <p className="text-[10px] font-medium text-slate-400 mt-1">Ver opciones</p>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        );
      case "search":
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
                  <Button
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-[calc(100%-1rem)] px-10 bg-creme-brulee hover:bg-creme-brulee/90 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-creme-brulee/20 active:scale-95"
                  >
                    Buscar
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* District Select */}
                    <Select value={searchQuery === "" ? "all_districts" : searchQuery} onValueChange={setSearchQuery}>
                      <SelectTrigger className="w-44 h-11 rounded-xl border-au-lait bg-white text-slate-600 font-bold text-[11px] transition-all hover:border-creme-brulee/50">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-creme-brulee" />
                          <SelectValue placeholder="Distrito" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-au-lait">
                        <SelectItem value="all_districts">Todos los distritos</SelectItem>
                      {['Ate Vitarte', 'Santa Anita', 'La Molina', 'Surco', 'San Borja', 'San Isidro', 'Miraflores'].map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Price Range Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-44 h-11 px-4 rounded-xl border-au-lait bg-white text-slate-600 font-bold text-[11px] gap-2 transition-all hover:border-creme-brulee/50">
                        <DollarSign className="w-3.5 h-3.5 text-yellow-600" />
                        S/ {priceRange[0]} - {priceRange[1]}
                        <ChevronDown className="w-3 h-3 opacity-50 ml-auto" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-6 rounded-2xl border-au-lait shadow-xl" align="start">
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-inkwell">Rango de precio</h4>
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
                        className={`w-44 h-11 px-4 rounded-xl border-au-lait gap-2 text-[11px] font-bold transition-all ${selectedServices.length > 0 ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 hover:border-creme-brulee/50'}`}
                      >
                        <Zap className={`w-3.5 h-3.5 ${selectedServices.length > 0 ? 'text-white' : 'text-slate-400'}`} />
                        Servicios
                        {selectedServices.length > 0 && (
                          <Badge className="bg-white text-emerald-600 text-[9px] min-w-4 h-4 p-0 flex items-center justify-center rounded-full ml-1 border-none font-black">
                            {selectedServices.length}
                          </Badge>
                        )}
                        <ChevronDown className="w-3 h-3 opacity-50 ml-auto" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[550px] p-6 rounded-3xl border-au-lait shadow-2xl" align="end">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase">Selecciona los servicios</h4>
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
                                  'Wifi', 'Luz', 'Agua', 'Lavandería', 'Cocina', 'Baño Privado',
                                  'Amoblado', 'Seguridad', 'Gimnasio', 'Estacionamiento', 'TV Cable', 'Mascotas'
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
                            { name: 'Wifi', icon: Wifi },
                            { name: 'Luz', icon: Zap },
                            { name: 'Agua', icon: Droplets },
                            { name: 'Lavandería', icon: Shirt },
                            { name: 'Cocina', icon: Utensils },
                            { name: 'Baño Privado', icon: Bath },
                            { name: 'Amoblado', icon: Armchair },
                            { name: 'Seguridad', icon: ShieldCheck },
                            { name: 'Gimnasio', icon: Dumbbell },
                            { name: 'Estacionamiento', icon: Car },
                            { name: 'TV Cable', icon: Tv },
                            { name: 'Mascotas', icon: Dog }
                          ].map((s) => (
                            <div
                              key={s.name}
                              className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${selectedServices.includes(s.name) ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
                              onClick={() => {
                                setSelectedServices(prev =>
                                  prev.includes(s.name) ? prev.filter(x => x !== s.name) : [...prev, s.name]
                                );
                              }}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <s.icon className={`w-3 h-3 shrink-0 ${selectedServices.includes(s.name) ? 'text-emerald-600' : 'text-slate-400'}`} />
                                <span className="text-[9px] font-bold text-inkwell truncate">{s.name}</span>
                              </div>
                              <Checkbox checked={selectedServices.includes(s.name)} className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 size-3.5 rounded-[4px] shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant="outline"
                    className={`h-11 px-5 rounded-xl border-au-lait gap-2 text-[11px] font-medium transition-all ${nearMe ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white hover:bg-slate-50 hover:border-creme-brulee/50'}`}
                    onClick={() => setNearMe(!nearMe)}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Cerca de mí
                  </Button>

                  {(searchQuery || nearMe || selectedServices.length > 0 || propertyType || priceRange[0] > 0 || priceRange[1] < 2000) && (
                    <Button
                      variant="ghost"
                      className="text-slate-400 text-xs hover:text-red-500 hover:bg-red-50 flex items-center gap-1 h-11 px-3 rounded-xl transition-colors"
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
                    onSelect={() => handleChangeView('property-details', room.id)}
                    isFav={isFavorite(room.id)}
                    onToggleFav={() => toggleFavorite(room.id)}
                  />
                ))}
              </div>
            )}
            {!loadingProperties && filteredProperties.length === 0 && (
              <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-au-lait shadow-sm">
                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-inkwell mb-2">No encontramos resultados</h3>
                <p className="text-lunar-eclipse">Intenta ajustar tus filtros para encontrar lo que buscas.</p>
              </div>
            )}
          </div>
        );
      case "reservations":
        const statusFilters = [
          { id: 'pending', label: 'Pendientes' },
          { id: 'accepted', label: 'Confirmadas' },
          { id: 'rejected', label: 'Rechazadas' },
          { id: 'all', label: 'Historial' },
        ];

        const getStatusCount = (status: string) => {
          if (!myRequests) return 0;
          if (status === 'all') return myRequests.length;
          return myRequests.filter((r: any) => r.status === status).length;
        };

        const filteredRequests = reservationFilter === 'all'
          ? myRequests
          : myRequests?.filter((r: any) => r.status === reservationFilter);

        return (
          <div className="space-y-8">
            <ViewHeader
              title="Mis Reservas"
              description="Gestiona tus solicitudes y mantente al tanto de tus futuros mudanzas."
            />

            {/* Status Tabs */}
            <div className="bg-slate-100 p-1.5 rounded-full flex gap-1.5 border border-slate-200/50 shadow-inner">
              {statusFilters.map((f) => {
                const isActive = reservationFilter === f.id;
                const count = getStatusCount(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => setReservationFilter(f.id)}
                    className={`
                      flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2
                      ${isActive
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                      }
                    `}
                  >
                    {f.label}
                    <span className={`
                      px-2 py-0.5 rounded-full text-[10px] font-bold
                      ${isActive ? 'bg-creme-brulee text-white' : 'bg-slate-200 text-slate-500'}
                    `}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {loadingRequests ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-creme-brulee" />
              </div>
            ) : !filteredRequests || filteredRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-au-lait shadow-sm">
                <CalendarCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-inkwell mb-2">No hay reservas en esta categoría</h3>
                <p className="text-lunar-eclipse mb-6">Parece que no tienes solicitudes con el estado seleccionado.</p>
                <Button onClick={() => setReservationFilter('all')} variant="outline" className="rounded-xl border-au-lait">
                  Ver todo el historial
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRequests.map((req: any) => (
                  <Card
                    key={req.id}
                    className="overflow-hidden border-slate-200 shadow-sm rounded-[2rem] bg-white border p-5 cursor-pointer hover:border-creme-brulee/50 transition-all hover:shadow-md group"
                    onClick={() => handleChangeView('property-details', req.propertyId)}
                  >
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0">
                        <ImageWithSkeleton
                          src={req.property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'}
                          alt={req.property?.title}
                          className="w-full h-full rounded-2xl"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-xl text-slate-800 truncate pr-4 group-hover:text-creme-brulee transition-colors">{req.property?.title}</h4>
                          <div className={`
                            flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shrink-0
                            ${req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : ''}
                            ${req.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                            ${req.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' : ''}
                          `}>
                            <div className={`size-1.5 rounded-full ${req.status === 'pending' ? 'bg-amber-400' :
                              req.status === 'accepted' ? 'bg-emerald-400' : 'bg-red-400'
                              }`} />
                            {req.status === 'pending' ? 'Pendiente' : req.status === 'accepted' ? 'Confirmada' : 'Rechazada'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-3">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate">{req.property?.address}</span>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="size-8 border-2 border-white shadow-sm ring-1 ring-slate-100">
                            <AvatarImage src={req.property?.landlord?.profilePicture} className="object-cover" />
                            <AvatarFallback className="text-[10px] font-bold bg-gradient-to-br from-creme-brulee/20 to-creme-brulee/40 text-creme-brulee">
                              {(req.property?.landlord?.fullName || "A")[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Arrendador</span>
                            <span className="text-sm font-bold text-slate-700 leading-none">{req.property?.landlord?.fullName || "No asignado"}</span>
                          </div>
                          <div className="ml-auto flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Precio</span>
                            <span className="text-sm font-black text-creme-brulee leading-none">S/ {req.property?.monthlyPrice}/mes</span>
                          </div>
                        </div>

                        <div className="space-y-1 mb-5">
                          <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Solicitado: {new Date(req.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <Clock className="w-3.5 h-3.5 opacity-70" />
                            <span>Mudanza: Próximamente</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            disabled={creatingChat}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (req.property?.landlordId) {
                                createChat(
                                  { participantId: req.property.landlordId },
                                  { onSuccess: (data) => handleChangeView('messages', undefined, data.id) }
                                );
                              } else {
                                handleChangeView('messages');
                              }
                            }}
                            className="rounded-xl h-10 px-6 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {creatingChat ? 'Cargando...' : 'Contactar'}
                          </Button>
                          {req.status === 'pending' ? (
                            <Button
                              variant="destructive"
                              className="rounded-xl h-10 px-6 text-xs font-bold bg-red-50 text-red-600 border-red-100 hover:bg-red-100 border transition-colors shadow-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRequestToCancel(req.id);
                              }}
                            >
                              Cancelar
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              className="rounded-xl h-10 px-6 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChangeView('property-details', req.propertyId);
                              }}
                            >
                              Detalles
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      case "settings":
        return <SettingsView />;
      case "messages":
        return <MessagesView onViewChange={handleChangeView} />;
      case "favorites":
        return (
          <div className="space-y-6">
            <ViewHeader
              title="Mis Favoritos"
              description="Tus habitaciones guardadas para verlas más tarde."
            />
            {isLoadingFavorites ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-creme-brulee" />
              </div>
            ) : !favorites || favorites.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-au-lait shadow-sm">
                <Heart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-inkwell mb-2">Aún no tienes favoritos</h3>
                <p className="text-sm text-lunar-eclipse mb-6">Guarda las habitaciones que más te gusten para verlas después.</p>
                <Button onClick={() => handleChangeView('search')} className="bg-creme-brulee hover:bg-creme-brulee/90 text-white rounded-lg px-6 text-sm">
                  Explorar ahora
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((room: any) => (
                  <PropertyCard
                    key={room.id}
                    room={room}
                    onSelect={() => handleChangeView('property-details', room.id)}
                    isFav={true}
                    onToggleFav={() => toggleFavorite(room.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-au-lait/30 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-10 h-10 text-creme-brulee opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-inkwell mb-2">Vista en desarrollo</h3>
            <p className="text-lunar-eclipse max-w-xs mx-auto">Esta sección ({view}) estará disponible próximamente con toda la funcionalidad del prototipo.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-au-lait via-white to-au-lait overflow-hidden">
      <Sidebar
        current={view}
        onChange={handleChangeView}
        expanded={sidebarExpanded}
        onToggle={toggleSidebar}
      />

      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-16'}`}
      >
        <div className="min-h-full p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <Dialog open={requestToCancel !== null} onOpenChange={(open) => !open && setRequestToCancel(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-red-50 p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-inkwell mb-2">¿Cancelar solicitud?</DialogTitle>
              <DialogDescription className="text-lunar-eclipse font-normal text-sm leading-relaxed">
                Esta acción no se puede deshacer. Si cancelas, no podrás volver a reservar esta propiedad en el futuro.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="p-4 bg-white flex flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              onClick={() => setRequestToCancel(null)}
              className="flex-1 rounded-xl font-semibold text-slate-500 hover:bg-slate-50"
            >
              Mantener reserva
            </Button>
            <Button
              onClick={() => {
                if (requestToCancel) {
                  deleteRequest(requestToCancel, {
                    onSuccess: () => setRequestToCancel(null)
                  });
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-md shadow-red-200"
            >
              Sí, cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PropertyCard({ room, onSelect, isFav, onToggleFav, showCompatibility }: { room: any, onSelect: () => void, isFav: boolean, onToggleFav: () => void, showCompatibility?: boolean }) {
  const compatibility = React.useMemo(() => Math.floor(Math.random() * (99 - 80 + 1) + 80), []);
  const rating = React.useMemo(() => (4.5 + Math.random() * 0.5).toFixed(1), []);

  return (
    <Card
      className="overflow-hidden border border-au-lait shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] group h-full flex flex-col cursor-pointer bg-white"
      onClick={onSelect}
    >
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {showCompatibility && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-emerald-500/90 text-white text-[10px] font-bold tracking-tight backdrop-blur-md px-3 py-1 rounded-full border-none shadow-sm">
              {compatibility}% compatible
            </Badge>
          </div>
        )}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            className={`p-2 rounded-full shadow-lg backdrop-blur-md transition-all border cursor-pointer ${isFav ? 'bg-red-500 text-white border-red-500' : 'bg-white/90 text-red-500 border-au-lait hover:bg-white'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFav();
            }}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="absolute bottom-4 right-4 z-10">
          <Badge className="bg-inkwell/80 text-white text-[10px] font-bold backdrop-blur-md px-3 py-1 rounded-full border-none">
            S/ {room.monthlyPrice}/mes
          </Badge>
        </div>

        <ImageWithSkeleton
          src={room.images?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'}
          className="w-full h-full transition-transform duration-700"
          alt={room.title}
        />
      </div>
      <CardContent className="pt-3 px-4 pb-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h4 className="text-base font-semibold text-inkwell group-hover:text-creme-brulee transition-colors line-clamp-2 leading-tight">{room.title}</h4>
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
            <Star className="w-3 h-3 fill-creme-brulee text-creme-brulee" />
            <span className="text-[10px] font-semibold text-inkwell">{rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-lunar-eclipse text-xs mb-4">
          <MapPin className="w-3.5 h-3.5 text-creme-brulee" />
          <span className="truncate font-medium">{room.address}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {room.includedServices?.slice(0, 3).map((s: string) => (
            <Badge key={s} variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] font-medium px-2 py-0 border-none rounded-md">
              {s}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
