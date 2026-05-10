"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "./components";
import { 
  Search, Heart, MessageSquare, CalendarCheck, Star, 
  MapPin, Calendar, Map as MapIcon, Users, Bot, Loader2 
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
  DollarSign, Navigation, Filter, X, ChevronDown, 
  Wifi, Zap, Droplets, Utensils, Bath, Dog, Shirt 
} from "lucide-react";
import useAllProperties from "./data/queries/useAllProperties";
import useTenantRequests from "./data/queries/useTenantRequests";
import useMe from "@/modules/auth/data/queries/useMe";
import { PropertyDetailsView } from "./components/views/properties/PropertyDetailsView";
import { MessagesView } from "./components/views/messages/MessagesView";
import useFavorites from "./hooks/useFavorites";
import { ViewHeader } from "./components/ViewHeader";

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

  // Filter States
  const [searchQuery, setSearchQuery] = React.useState("");
  const [priceRange, setPriceRange] = React.useState([0, 2000]);
  const [nearMe, setNearMe] = React.useState(false);
  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);
  const [propertyType, setPropertyType] = React.useState<string | null>(null);

  const filteredProperties = React.useMemo(() => {
    if (!allProperties) return [];
    return allProperties.filter((room: any) => {
      // Search text
      const matchesSearch = !searchQuery || 
        room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Price
      const matchesPrice = room.monthlyPrice >= priceRange[0] && room.monthlyPrice <= priceRange[1];
      
      // Near me (Simulated for demo: check if address contains Tecsup or Santa Anita)
      const matchesNearMe = !nearMe || 
        room.address.toLowerCase().includes("tecsup") || 
        room.address.toLowerCase().includes("santa anita");

      // Services
      const matchesServices = selectedServices.length === 0 || 
        selectedServices.every(s => room.includedServices?.includes(s));
      
      // Property Type
      const matchesType = !propertyType || room.propertyType === propertyType;

      return matchesSearch && matchesPrice && matchesNearMe && matchesServices && matchesType;
    });
  }, [allProperties, searchQuery, priceRange, nearMe, selectedServices, propertyType]);

  const u: any = (userData as any)?.user ?? userData;
  const userName = u?.fullName ?? u?.name ?? "Estudiante";

  const handleChangeView = React.useCallback((v: string, propertyId?: string) => {
    const params = new URLSearchParams();
    params.set('view', v);
    if (propertyId) params.set('propertyId', propertyId);
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
          onBack={() => handleChangeView('search')}
          onViewMessages={() => handleChangeView('messages')}
        />
      );
    }

    switch (view) {
      case "dashboard":
        return (
          <>
            <ViewHeader 
              title={`¡Hola, ${userName}! 👋`}
              description={`Explora las ${allProperties?.length || 0} habitaciones disponibles cerca de TECSUP.`}
              action={
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-au-lait flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-creme-brulee" />
                  <span className="text-xs font-semibold text-inkwell">Ciclo 2024-II</span>
                </div>
              }
            />

            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-inkwell flex items-center gap-2">
                  <Star className="w-4 h-4 text-creme-brulee fill-creme-brulee" />
                  Recomendados para ti
                </h3>
                <Button variant="link" className="text-creme-brulee text-sm font-semibold" onClick={() => handleChangeView('search')}>Ver todas</Button>
              </div>
              
              {loadingProperties ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-creme-brulee" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {allProperties?.slice(0, 3).map((room: any) => (
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
          </>
        );
      case "search":
        return (
          <div className="space-y-6">
            <ViewHeader 
              title="Explorar Habitaciones"
              description="Filtra por zona, precio o servicios para encontrar tu lugar ideal."
            />
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Zonas, precios o servicios..." 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-au-lait rounded-xl shadow-sm focus:ring-1 focus:ring-creme-brulee outline-none transition-all text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`rounded-xl border-au-lait gap-2 text-xs h-11 px-4 ${priceRange[0] > 0 || priceRange[1] < 2000 ? 'bg-creme-brulee/10 border-creme-brulee text-creme-brulee' : 'bg-white hover:bg-slate-50'}`}
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>S/ {priceRange[0]} - S/ {priceRange[1]}</span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-6 rounded-2xl border-au-lait shadow-xl" align="end">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-inkwell">Rango de precio</h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] text-slate-400 hover:text-red-500"
                            onClick={() => setPriceRange([0, 2000])}
                          >
                            Reiniciar
                          </Button>
                        </div>
                        
                        <Slider 
                          defaultValue={[0, 2000]} 
                          max={2000} 
                          step={50} 
                          value={priceRange}
                          onValueChange={setPriceRange}
                          className="py-4"
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Mínimo</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">S/</span>
                              <Input 
                                type="number" 
                                value={priceRange[0]} 
                                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                className="pl-7 h-9 text-xs border-au-lait rounded-lg focus-visible:ring-creme-brulee/20"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Máximo</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">S/</span>
                              <Input 
                                type="number" 
                                value={priceRange[1]} 
                                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                className="pl-7 h-9 text-xs border-au-lait rounded-lg focus-visible:ring-creme-brulee/20"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button 
                    variant="outline" 
                    className={`rounded-xl border-au-lait gap-2 text-xs h-11 px-4 transition-all ${nearMe ? 'bg-creme-brulee text-white border-creme-brulee shadow-md' : 'bg-white hover:bg-slate-50'}`}
                    onClick={() => setNearMe(!nearMe)}
                  >
                    <Navigation className={`w-3.5 h-3.5 ${nearMe ? 'animate-pulse' : ''}`} />
                    Cerca de mí
                  </Button>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`rounded-xl border-au-lait gap-2 text-xs h-11 px-4 ${selectedServices.length > 0 || propertyType ? 'bg-creme-brulee/10 border-creme-brulee text-creme-brulee' : 'bg-white hover:bg-slate-50'}`}
                      >
                        <Filter className="w-3.5 h-3.5" />
                        <span>Filtros</span>
                        {(selectedServices.length > 0) && (
                          <Badge className="ml-1 bg-creme-brulee text-white text-[9px] px-1.5 h-4 min-w-4 flex items-center justify-center rounded-full border-none">{selectedServices.length}</Badge>
                        )}
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-5 rounded-2xl border-au-lait shadow-xl" align="end">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase">Servicios</h4>
                            {(selectedServices.length > 0) && (
                              <Button 
                                variant="ghost" 
                                className="h-5 text-[9px] text-red-500 p-0" 
                                onClick={() => setSelectedServices([])}
                              >
                                Limpiar
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 gap-2.5">
                            {[
                              { name: 'Wifi', icon: Wifi },
                              { name: 'Luz', icon: Zap },
                              { name: 'Agua', icon: Droplets },
                              { name: 'Lavandería', icon: Shirt },
                              { name: 'Cocina', icon: Utensils },
                              { name: 'Baño Privado', icon: Bath },
                              { name: 'Mascotas', icon: Dog }
                            ].map((service) => (
                              <div 
                                key={service.name} 
                                className={`
                                  flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer group
                                  ${selectedServices.includes(service.name) 
                                    ? 'bg-creme-brulee/5 border-creme-brulee/30' 
                                    : 'bg-white border-transparent hover:bg-slate-50'
                                  }
                                `}
                                onClick={() => {
                                  setSelectedServices(prev => 
                                    prev.includes(service.name) ? prev.filter(s => s !== service.name) : [...prev, service.name]
                                  );
                                }}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`p-1.5 rounded-lg ${selectedServices.includes(service.name) ? 'bg-creme-brulee text-white' : 'bg-slate-100 text-slate-400 group-hover:text-creme-brulee'}`}>
                                    <service.icon className="w-3.5 h-3.5" />
                                  </div>
                                  <span className={`text-xs font-medium ${selectedServices.includes(service.name) ? 'text-inkwell' : 'text-slate-500'}`}>{service.name}</span>
                                </div>
                                <Checkbox 
                                  checked={selectedServices.includes(service.name)}
                                  className="border-au-lait data-[state=checked]:bg-creme-brulee data-[state=checked]:border-creme-brulee"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-au-lait/50">
                          <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase">Tipo de Lugar</h4>
                          <div className="flex flex-wrap gap-2">
                            {['room', 'apartment', 'house'].map((type) => (
                              <Badge 
                                key={type}
                                className={`
                                  cursor-pointer capitalize px-3 py-1 rounded-full border text-[10px] font-semibold transition-all
                                  ${propertyType === type 
                                    ? 'bg-creme-brulee text-white border-creme-brulee shadow-sm' 
                                    : 'bg-white text-lunar-eclipse border-au-lait hover:border-creme-brulee/50'
                                  }
                                `}
                                onClick={() => setPropertyType(propertyType === type ? null : type)}
                              >
                                {type === 'room' ? 'Habitación' : type === 'apartment' ? 'Depa' : 'Casa'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

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
        return (
          <div className="space-y-6">
            <ViewHeader 
              title="Mis Reservas"
              description="Seguimiento de tus solicitudes de alquiler y su estado actual."
            />
            
            {loadingRequests ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-creme-brulee" />
              </div>
            ) : !myRequests || myRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-au-lait shadow-sm">
                <CalendarCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-inkwell mb-2">No tienes reservas activas</h3>
                <p className="text-lunar-eclipse mb-6">Explora habitaciones y envía una solicitud para empezar.</p>
                <Button onClick={() => handleChangeView('search')} className="bg-creme-brulee hover:bg-creme-brulee/90 text-white rounded-xl px-8">
                  Buscar Habitación
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {myRequests.map((req: any) => (
                  <div key={req.id} className="bg-white p-6 rounded-3xl border border-au-lait shadow-sm flex items-center gap-6 hover:shadow-md transition-all">
                    <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-au-lait/50">
                      <img 
                        src={req.property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'} 
                        className="w-full h-full object-cover" 
                        alt="" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-inkwell">{req.property?.title}</h4>
                        <Badge className={`
                          ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                          ${req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : ''}
                          ${req.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                          px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase
                        `}>
                          {req.status === 'pending' ? 'Pendiente' : req.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                        </Badge>
                      </div>
                      <p className="text-sm text-lunar-eclipse flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-creme-brulee" />
                        {req.property?.address}
                      </p>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-bold text-inkwell">S/ {req.property?.monthlyPrice}</p>
                        <span className="text-slate-300">|</span>
                        <p className="text-xs text-lunar-eclipse">Solicitado el {new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="rounded-xl border-au-lait text-inkwell hover:bg-slate-50"
                      onClick={() => handleChangeView('property-details', req.propertyId)}
                    >
                      Ver detalles
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
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
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarExpanded ? 'ml-64' : 'ml-16'
        }`}
      >
        <div className="min-h-full p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

function PropertyCard({ room, onSelect, isFav, onToggleFav }: { room: any, onSelect: () => void, isFav: boolean, onToggleFav: () => void }) {
  return (
    <Card 
      className="overflow-hidden border border-au-lait shadow-sm hover:shadow-md transition-all rounded-xl group h-full flex flex-col cursor-pointer bg-white"
      onClick={onSelect}
    >
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-white/90 text-inkwell text-[9px] font-bold tracking-wider backdrop-blur-md px-2 py-0.5 border border-au-lait/50">VERIFICADO</Badge>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <button 
            className={`p-1.5 rounded-full shadow-sm backdrop-blur-md transition-colors border ${isFav ? 'bg-red-500 text-white border-red-500' : 'bg-white/90 text-red-500 border-au-lait'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFav();
            }}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>
        <img 
          src={room.images?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          alt={room.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="flex items-center gap-1 text-white text-xs font-semibold">
            <Star className="w-3 h-3 fill-creme-brulee text-creme-brulee" />
            <span>4.8</span>
          </div>
          <div className="text-white text-right">
            <p className="text-[11px] font-bold">S/ {room.monthlyPrice}</p>
          </div>
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <h4 className="text-sm font-semibold text-inkwell mb-1 group-hover:text-creme-brulee transition-colors line-clamp-1">{room.title}</h4>
        <div className="flex items-center gap-1.5 text-lunar-eclipse text-[11px] mt-auto">
          <MapPin className="w-3 h-3 text-creme-brulee" />
          <span className="truncate">{room.address}</span>
        </div>
      </CardContent>
    </Card>
  );
}
