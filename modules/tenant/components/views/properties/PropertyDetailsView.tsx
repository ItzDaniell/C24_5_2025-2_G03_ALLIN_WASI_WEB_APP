"use client";
import React from "react";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import {
  ArrowLeft, MapPin, DollarSign, Home, Bath, Ruler,
  MessageSquare, CalendarCheck, Heart, Camera, Sparkles, Loader2, AlertCircle, ChevronLeft, ChevronRight, X, Phone, User,
  Star
} from "lucide-react";
import useProperty from "@/modules/landlord/data/queries/useProperty";
import { toast } from "sonner";
import { PannellumViewer } from "@/modules/shared/components/PannellumViewer";
import { LoadingSpinner, PropertyDetailsSkeleton } from "@/modules/shared/components/LoadingSkeleton";
import { ImageWithSkeleton } from "@/modules/shared/components/ImageWithSkeleton";
import useCreateRequest from "@/modules/tenant/data/mutations/useCreateRequest";
import useDeleteRequest from "@/modules/tenant/data/mutations/useDeleteRequest";
import { useCreateConversation } from "@/modules/landlord/data/mutations/useChatActions";
import useFavorites from "@/modules/tenant/hooks/useFavorites";
import useTenantRequests from "@/modules/tenant/data/queries/useTenantRequests";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { ViewHeader } from "../../ViewHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { ReviewSection } from "./ReviewSection";
import { PropertyLocationMap } from "./PropertyLocationMap";
import { usePropertyAverageRating, useLandlordAverageRating } from "@/modules/tenant/data/queries/useReviews";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";

const toDataUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  return value.startsWith("data:") || value.startsWith("http") ? value : `data:image/jpeg;base64,${value}`;
};

interface PropertyDetailsViewProps {
  propertyId: string | undefined;
  onBack: () => void;
  onViewMessages: (chatId?: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  room: "Habitación",
  apartment: "Departamento",
  house: "Casa",
  studio: "Estudio",
};

const placeholderImage = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688";

export function PropertyDetailsView({ propertyId, onBack, onViewMessages }: PropertyDetailsViewProps) {
  const { data: property, isLoading: loadingProperty } = useProperty(propertyId);
  const { data: myRequests, isLoading: loadingRequests } = useTenantRequests();
  const { mutate: createRequest, isPending: creatingRequest } = useCreateRequest();
  const { mutate: deleteRequest, isPending: deletingRequest } = useDeleteRequest();
  const { mutate: createConversation, isPending: creatingConversation } = useCreateConversation();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { data: propertyAvg } = usePropertyAverageRating(propertyId);
  const { data: landlordAvg } = useLandlordAverageRating(property?.landlordId);
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;

  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number | null>(null);
  const [selectedTour360, setSelectedTour360] = React.useState<{ url: string, title: string } | null>(null);
  const [contactingType, setContactingType] = React.useState<'card' | 'sidebar' | 'landlord-card' | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = React.useState(false);
  const [isLandlordOnline, setIsLandlordOnline] = React.useState(false);
  const [landlordLastActiveAt, setLandlordLastActiveAt] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (property?.landlord) {
      const activeAt = property.landlord.lastActiveAt || property.landlord.updatedAt || property.landlord.createdAt;
      if (activeAt) setLandlordLastActiveAt(new Date(activeAt));
    }
  }, [property?.landlord]);
  
  React.useEffect(() => {
    if (!accessToken || !property?.landlordId) return;
    const socket = io(`${API_BASE_URL}/chat`, {
      auth: { token: accessToken },
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on('connect', () => {
      console.log("[PropertyDetailsView] Socket connected, getting initial status for:", property.landlordId);
      socket.emit('user:status:get', { userId: property.landlordId }, (res: any) => {
        console.log("[PropertyDetailsView] Initial status received:", res);
        if (res?.userId === property.landlordId) {
          setIsLandlordOnline(res.isOnline);
          const fallbackDate = property.landlord?.updatedAt || property.landlord?.createdAt;
          setLandlordLastActiveAt(res.lastActiveAt ? new Date(res.lastActiveAt) : (fallbackDate ? new Date(fallbackDate) : null));
        }
      });
    });

    socket.on('user:status', (data: { userId: string, isOnline: boolean, lastActiveAt?: string }) => {
      console.log("[PropertyDetailsView] Real-time status update:", data);
      if (data.userId === property.landlordId) {
        setIsLandlordOnline(data.isOnline);
        if (data.lastActiveAt) {
          setLandlordLastActiveAt(new Date(data.lastActiveAt));
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, property?.landlordId]);

  const existingRequest = React.useMemo(() => {
    if (!myRequests || !propertyId) return null;
    return myRequests.find((r: any) => r.propertyId === propertyId);
  }, [myRequests, propertyId]);

  const handleReserve = () => {
    if (!propertyId) return;
    createRequest({ propertyId: String(propertyId), message: "Hola, estoy interesado en esta habitación." });
  };

  const handleCancelRequest = () => {
    setShowConfirmCancel(true);
  };

  const confirmCancel = () => {
    if (!existingRequest) return;
    deleteRequest(existingRequest.id, {
      onSuccess: () => {
        setShowConfirmCancel(false);
      }
    });
  };

  const handleContact = (type: 'card' | 'sidebar' | 'landlord-card') => {
    if (!property?.landlordId) return;
    setContactingType(type);
    createConversation({ participantId: property.landlordId }, {
      onSuccess: (data) => {
        onViewMessages(data.id);
      },
      onSettled: () => setContactingType(null)
    });
  };


  const fav = propertyId ? isFavorite(propertyId) : false;

  if (loadingProperty || loadingRequests) return <PropertyDetailsSkeleton />;
  if (!property) return <div className="p-8 text-center text-lunar-eclipse font-medium">Propiedad no encontrada</div>;

  const tours = property.images?.filter((img: any) => img.is360Tour) || [];
  const regularImages = property.images?.filter((img: any) => !img.is360Tour).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <ViewHeader
        title={`Detalles de ${property.title}`}
        description={`${property.city || ''}, ${property.country || 'Perú'} - ${property.address}`}
        action={
          <Button variant="outline" onClick={onBack} className="rounded-lg border-au-lait text-inkwell hover:bg-slate-50 text-xs font-semibold cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Volver
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Gallery */}
          <Card className="overflow-hidden border border-au-lait rounded-2xl shadow-md">
            <div className="relative aspect-video bg-slate-100">
              <ImageWithSkeleton
                src={regularImages[0]?.url || placeholderImage}
                alt={property.title}
                className="w-full h-full"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-md rounded-lg text-inkwell font-semibold shadow-sm text-xs h-9 cursor-pointer"
                  onClick={() => setSelectedImageIndex(0)}
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  Galería ({regularImages.length})
                </Button>
                {tours.length > 0 && (
                  <Button
                    className="bg-creme-brulee text-white rounded-lg font-semibold shadow-sm text-xs h-9 cursor-pointer"
                    onClick={() => setSelectedTour360({ url: tours[0].url, title: property.title })}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Tour 360°
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Tabs Container */}
          <Tabs defaultValue="detalles" className="w-full mt-8">
            <TabsList className="inline-flex items-center p-1.5 bg-slate-100 rounded-2xl mb-8 h-auto w-full overflow-x-auto no-scrollbar">
              <TabsTrigger 
                value="detalles" 
                className="rounded-xl px-6 py-2.5 text-sm font-bold text-lunar-eclipse data-[state=active]:bg-white data-[state=active]:text-inkwell data-[state=active]:shadow-sm transition-all whitespace-nowrap flex-1 cursor-pointer"
              >
                Información
              </TabsTrigger>
              <TabsTrigger 
                value="resenas" 
                className="rounded-xl px-6 py-2.5 text-sm font-bold text-lunar-eclipse data-[state=active]:bg-white data-[state=active]:text-inkwell data-[state=active]:shadow-sm transition-all whitespace-nowrap flex-1 cursor-pointer"
              >
                Reseñas
              </TabsTrigger>
            </TabsList>


            <TabsContent value="detalles" className="space-y-6 mt-0 animate-in fade-in-50 duration-500">
              <Card className="border border-au-lait rounded-2xl p-6 shadow-md bg-white">
                <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase mb-4">Propietario</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Avatar className="size-16 border-2 border-slate-100 shadow-sm">
                      <AvatarImage src={toDataUrl(property.landlord?.profilePicture)} className="object-cover" />
                      <AvatarFallback className="bg-creme-brulee/10 text-creme-brulee text-xl font-bold">
                        {(property.landlord?.fullName || "A")[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isLandlordOnline && (
                      <span className="absolute bottom-0.5 right-0.5 size-3.5 bg-emerald-500 border-2 border-white rounded-full z-10" title="Activo ahora" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-inkwell truncate flex items-center gap-2">
                      {property.landlord?.fullName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <div className="flex items-center gap-1 text-creme-brulee font-bold text-xs">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{landlordAvg || "4.9"}</span>
                      </div>
                      {isLandlordOnline ? (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Activo
                        </span>
                      ) : landlordLastActiveAt ? (
                        <span className="text-[11px] text-lunar-eclipse font-medium">
                          Activo hace {formatDistanceToNow(landlordLastActiveAt, { locale: es })}
                        </span>
                      ) : null}
                      <span className="text-[11px] text-lunar-eclipse font-medium">
                        {(() => {
                          const activeCount = property.landlord?.properties?.filter((p: any) => p.status === 'available').length || 0;
                          return `${activeCount} ${activeCount === 1 ? 'propiedad activa' : 'propiedades activas'}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-11 border-au-lait text-inkwell hover:bg-slate-50 font-bold text-xs gap-2 cursor-pointer"
                    onClick={() => handleContact('landlord-card')}
                    disabled={creatingConversation}
                  >
                    {contactingType === 'landlord-card' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5 text-creme-brulee" />}
                    {contactingType === 'landlord-card' ? 'Cargando...' : 'Mensaje'}
                  </Button>
                </div>
              </Card>

              <Card className="border border-au-lait rounded-2xl p-6 shadow-sm bg-white">
                <h3 className="text-lg font-bold text-inkwell mb-3">Descripción</h3>
                <p className="text-sm text-lunar-eclipse leading-relaxed whitespace-pre-wrap">{property.description || "Sin descripción adicional."}</p>
              </Card>

              <Card className="border border-au-lait rounded-2xl p-6 shadow-sm bg-white">
                <h3 className="text-lg font-bold text-inkwell mb-3">Servicios e Instalaciones</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(() => {
                    const services = [...(property.includedServices || []), ...(property.services || [])];
                    const features = property.features?.map((f: any) => f.name) || [];
                    const allServices = Array.from(new Set([...services, ...features]));
                    
                    if (allServices.length > 0) {
                      return allServices.map((service: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-au-lait/50">
                          <div className="w-1.5 h-1.5 rounded-full bg-creme-brulee" />
                          <span className="text-xs font-semibold text-inkwell">{service}</span>
                        </div>
                      ));
                    }
                    return <p className="text-xs text-lunar-eclipse italic col-span-full">No se han especificado servicios adicionales.</p>;
                  })()}
                </div>
              </Card>

              {property.houseRules && (
                <Card className="border border-au-lait rounded-2xl p-6 shadow-sm bg-white">
                  <h3 className="text-lg font-bold text-inkwell mb-3">Reglas de la Casa</h3>
                  <p className="text-sm text-lunar-eclipse leading-relaxed whitespace-pre-wrap">{property.houseRules}</p>
                </Card>
              )}

              {/* Mapa de ubicación y servicios cercanos */}
              <PropertyLocationMap
                latitude={property.latitude}
                longitude={property.longitude}
                address={property.address}
                title={property.title}
                city={property.city}
              />
            </TabsContent>

            <TabsContent value="resenas" className="mt-0 animate-in fade-in-50 duration-500">
              {propertyId && <ReviewSection propertyId={propertyId} />}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border border-au-lait rounded-2xl p-6 shadow-md bg-white sticky top-6">
            <div className="mb-6">
              <p className="text-[10px] uppercase font-bold tracking-widest text-lunar-eclipse mb-1">Precio Mensual</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-inkwell">S/ {property.monthlyPrice}</span>
                <span className="text-xs text-lunar-eclipse font-semibold">/ mes</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-au-lait/50">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-creme-brulee" />
                  <span className="text-xs font-semibold text-inkwell">Tipo</span>
                </div>
                <span className="text-xs font-bold text-inkwell">{TYPE_LABELS[property.propertyType] || property.propertyType}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-au-lait/50">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-creme-brulee" />
                  <span className="text-xs font-semibold text-inkwell">Área</span>
                </div>
                <span className="text-xs font-bold text-inkwell">{property.size} m²</span>
              </div>
              {property.bedrooms > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-au-lait/50">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-creme-brulee" />
                    <span className="text-xs font-semibold text-inkwell">Habitaciones</span>
                  </div>
                  <span className="text-xs font-bold text-inkwell">{property.bedrooms}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-au-lait/50">
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4 text-creme-brulee" />
                  <span className="text-xs font-semibold text-inkwell">Baño</span>
                </div>
                <span className="text-xs font-bold text-inkwell">{property.bathroomType === 'private' ? 'Privado' : 'Compartido'}</span>
              </div>
            </div>

            <div className="grid gap-2.5">
              {existingRequest ? (
                <div className="space-y-2.5">
                  <div className={`p-3 rounded-xl border flex items-center justify-center gap-2 ${existingRequest.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      existingRequest.status === 'accepted' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        existingRequest.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                          'bg-slate-100 border-slate-300 text-slate-600'
                    }`}>
                    <CalendarCheck className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {existingRequest.status === 'pending' ? 'Reserva Pendiente' :
                        existingRequest.status === 'accepted' ? 'Reserva Aceptada' :
                          existingRequest.status === 'rejected' ? 'Reserva Rechazada' :
                            'Reserva Cancelada'}
                    </span>
                  </div>
                  {existingRequest.status === 'pending' && (
                    <Button
                      variant="outline"
                      onClick={handleCancelRequest}
                      disabled={deletingRequest}
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl h-12 text-sm font-bold shadow-sm cursor-pointer"
                    >
                      {deletingRequest ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cancelar Solicitud'}
                    </Button>
                  )}
                  {existingRequest.status === 'cancelled' && (
                    <p className="text-[10px] text-center text-slate-500 font-medium px-2 italic">
                      Ya has cancelado esta solicitud y no puedes volver a reservar esta propiedad.
                    </p>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleReserve}
                  disabled={creatingRequest}
                  className="w-full bg-creme-brulee hover:bg-creme-brulee/90 text-white rounded-xl h-12 text-sm font-bold shadow-sm cursor-pointer"
                >
                  {creatingRequest ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <CalendarCheck className="w-4 h-4 mr-2" />
                      Reservar ahora
                    </>
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => handleContact('sidebar')}
                disabled={creatingConversation}
                className="w-full border border-au-lait rounded-xl h-12 text-sm font-bold text-inkwell hover:bg-slate-50 shadow-sm cursor-pointer"
              >
                {contactingType === 'sidebar' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2 text-creme-brulee" />
                    Contactar arrendador
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => propertyId && toggleFavorite(propertyId)}
                className={`w-full rounded-xl h-10 text-xs font-bold transition-all cursor-pointer ${fav ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-lunar-eclipse hover:text-red-500 hover:bg-red-50'
                  }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${fav ? 'fill-current' : ''}`} />
                {fav ? 'En tus favoritos' : 'Añadir a favoritos'}
              </Button>
            </div>
          </Card>


        </div>
      </div>

      <PannellumViewer
        open={selectedTour360 !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTour360(null);
        }}
        imageUrl={selectedTour360?.url || ""}
        title={selectedTour360?.title || "Tour 360°"}
      />
      {/* Confirmation Modal */}
      <Dialog open={showConfirmCancel} onOpenChange={setShowConfirmCancel}>
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
              onClick={() => setShowConfirmCancel(false)}
              className="flex-1 rounded-xl font-semibold text-slate-500 hover:bg-slate-50"
            >
              Mantener reserva
            </Button>
            <Button
              onClick={confirmCancel}
              disabled={deletingRequest}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-md shadow-red-200"
            >
              {deletingRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sí, cancelar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gallery Dialog */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={(open) => !open && setSelectedImageIndex(null)}>
        <DialogContent className="max-w-[100vw] sm:max-w-[95vw] md:max-w-5xl h-[100dvh] sm:h-[90vh] p-0 overflow-hidden bg-zinc-950 sm:bg-zinc-950/95 border-none shadow-2xl flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>Galería de imágenes</DialogTitle>
            <DialogDescription>
              Visualizador de fotos de la propiedad {property.title}
            </DialogDescription>
          </DialogHeader>

          <div className="relative flex-1 min-h-0 flex items-center justify-center group bg-black/20">
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-4 right-4 z-[60] p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all border border-white/10 backdrop-blur-sm sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              className="absolute left-2 md:left-4 z-50 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all border border-white/10 backdrop-blur-sm sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(prev => prev !== null && prev > 0 ? prev - 1 : regularImages.length - 1);
              }}
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            <div className="w-full h-full p-4 md:p-8 flex items-center justify-center">
              <img
                src={regularImages[selectedImageIndex ?? 0]?.url || placeholderImage}
                className="max-w-full max-h-full object-contain select-none shadow-2xl"
                alt={`Imagen ${selectedImageIndex! + 1}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholderImage;
                }}
              />
            </div>

            <button
              className="absolute right-2 md:right-4 z-50 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all border border-white/10 backdrop-blur-sm sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(prev => prev !== null && prev < regularImages.length - 1 ? prev + 1 : 0);
              }}
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md border border-white/5 px-4 py-1 rounded-full text-white/90 text-[11px] font-bold tracking-widest uppercase pointer-events-none">
              {(selectedImageIndex ?? 0) + 1} / {regularImages.length}
            </div>
          </div>

          <div className="p-4 md:p-6 bg-zinc-900/50 border-t border-white/5 backdrop-blur-xl">
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2.5 px-2 justify-start sm:justify-center">
              {regularImages.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative size-16 md:size-20 rounded-xl overflow-hidden transition-all shrink-0 cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'ring-2 ring-creme-brulee ring-offset-2 ring-offset-zinc-950 scale-105 z-10'
                      : 'opacity-40 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <img
                    src={img.url}
                    className="w-full h-full object-cover"
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = placeholderImage;
                    }}
                  />
                  <div
                    className={`absolute inset-0 rounded-xl border-2 transition-all ${
                      selectedImageIndex === idx ? 'border-creme-brulee bg-creme-brulee/10' : 'border-transparent'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
