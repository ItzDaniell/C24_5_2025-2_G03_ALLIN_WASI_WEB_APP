"use client";
import React from "react";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { ArrowLeft, MapPin, DollarSign, Home, Bath, Ruler, Edit, Trash2, Camera, Sparkles } from "lucide-react";
import useProperty from "@/modules/landlord/data/queries/useProperty";
import { toast } from "sonner";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import useDeleteProperty from "@/modules/landlord/data/mutations/useDeleteProperty";
import { PannellumViewer } from "@/modules/shared/components/PannellumViewer";
import { LoadingSpinner } from "@/modules/shared/components/LoadingSkeleton";

interface PropertyDetailsViewProps {
  propertyId: number | string | undefined;
  onViewChange: (view: string) => void;
  onStartEdit?: (propertyId: number | string) => void;
}

const getStatusBadge = (status: string) => {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'available':
      return <Badge className="bg-creme-brulee text-white hover:bg-creme-brulee">Disponible</Badge>;
    case 'rented':
      return <Badge className="bg-lunar-eclipse text-white hover:bg-lunar-eclipse">Alquilada</Badge>;
    case 'reserved':
      return <Badge className="bg-au-lait text-inkwell hover:bg-au-lait">Reservada</Badge>;
    case 'draft':
      return <Badge variant="secondary">Borrador</Badge>;
    default:
      return <Badge variant="secondary">{status || '—'}</Badge>;
  }
};

const TYPE_LABELS: Record<string, string> = {
  room: "Habitación",
  apartment: "Departamento",
  house: "Casa",
  studio: "Estudio",
};

const BATHROOM_LABELS: Record<string, string> = {
  private: "Privado",
  shared: "Compartido",
};

const placeholderImage = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688";

export function PropertyDetailsView({ propertyId, onViewChange, onStartEdit }: PropertyDetailsViewProps) {
  const { data: property, isLoading, error } = useProperty(propertyId);
  const { mutate: deleteProperty, isPending: deleting } = useDeleteProperty();
  const [deleteDialogoen, setDeleteDialogoen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number | null>(null);
  const [selectedTour360, setSelectedTour360] = React.useState<{ url: string; title: string } | null>(null);

  if (!propertyId || (typeof propertyId === 'string' && propertyId === 'undefined')) {
    return (
      <div className="text-center py-12">
        <p className="text-lunar-eclipse mb-4">ID de propiedad inválido</p>
        <Button onClick={() => onViewChange("properties")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a propiedades
        </Button>
      </div>
    );
  }

  const property360Tours = React.useMemo(() => {
    if (!property?.images) return [];
    return property.images.filter((img: any) => img.is360Tour === true);
  }, [property?.images]);

  const propertyRegularImages = React.useMemo(() => {
    if (!property?.images) return [];
    const sorted = [...property.images]
      .filter((img: any) => !img.is360Tour)
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    return sorted;
  }, [property?.images]);

  const allImages = React.useMemo(() => {
    return [...propertyRegularImages, ...property360Tours];
  }, [propertyRegularImages, property360Tours]);

  const handleDelete = () => {
    if (!property?.id) return;
    deleteProperty(String(property.id), {
      onSuccess: () => {
        toast.success("Propiedad eliminada");
        onViewChange("properties");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "No se pudo eliminar");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-2 font-semibold">Error al cargar la propiedad</p>
        <p className="text-lunar-eclipse mb-4 text-sm">
          {(error as any)?.response?.data?.message || (error as any)?.message || 'No se pudo cargar la información de la propiedad'}
        </p>
        <Button onClick={() => onViewChange("properties")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a propiedades
        </Button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-lunar-eclipse mb-4">Propiedad no encontrada</p>
        <Button onClick={() => onViewChange("properties")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a propiedades
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => onViewChange("properties")}
          className="text-inkwell hover:bg-au-lait"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="flex items-center gap-2">
          {getStatusBadge(property.status || 'available')}
          <Button
            size="sm"
            className="bg-white text-inkwell border border-au-lait hover:bg-au-lait"
            onClick={() => onStartEdit?.(property.id as number)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            size="sm"
            className="bg-white text-red-600 border border-red-200 hover:bg-red-50"
            onClick={() => setDeleteDialogoen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <Card className="border-au-lait bg-gradient-to-br from-white to-au-lait/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-inkwell mb-2">{property.title || 'Propiedad sin título'}</h1>
              <div className="flex items-center gap-2 text-lunar-eclipse mb-4">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {property.city && property.country ? `${property.city}, ${property.country}` : (property.address || 'Sin ubicación')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-creme-brulee" />
                <span className="text-3xl font-bold text-creme-brulee">
                  S/{(property.monthlyPrice || property.price || 0).toLocaleString()}/mes
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {allImages.length > 0 ? (
            <Card className="border-au-lait">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-inkwell font-semibold text-lg">Galería de Imágenes</h3>
                  <Badge variant="secondary" className="bg-creme-brulee/10 text-inkwell">
                    {allImages.length} {allImages.length === 1 ? 'imagen' : 'imágenes'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {allImages.map((img: any, index: number) => (
                    <div
                      key={img.id || index}
                      className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg border-2 border-transparent hover:border-creme-brulee transition-all shadow-sm hover:shadow-md"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={img.url}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = placeholderImage;
                        }}
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-creme-brulee text-white text-xs">Principal</Badge>
                        </div>
                      )}
                      {img.is360Tour && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-purple-600 text-white text-xs shadow-md">
                            <Sparkles className="w-3 h-3 mr-1" />
                            360°
                          </Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-8 h-8 text-white drop-shadow-lg" />
                          <p className="text-white text-xs mt-1 text-center font-medium">Ver más grande</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-au-lait border-dashed">
              <CardContent className="p-12 text-center">
                <Camera className="w-12 h-12 text-lunar-eclipse mx-auto mb-3 opacity-50" />
                <p className="text-lunar-eclipse">No hay imágenes disponibles</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-au-lait">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-inkwell font-semibold text-lg">Tours Virtuales 360°</h3>
                    <p className="text-xs text-lunar-eclipse">
                      {property360Tours.length > 0 
                        ? `${property360Tours.length} ${property360Tours.length === 1 ? 'tour disponible' : 'tours disponibles'}`
                        : 'No hay tours disponibles'}
                    </p>
                  </div>
                </div>
              </div>
              {property360Tours.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property360Tours.map((tour: any, index: number) => (
                    <div
                      key={tour.id || index}
                      className="p-4 border-2 border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-white hover:from-purple-100 hover:to-purple-50 transition-all cursor-pointer group"
                      onClick={() => {
                        setSelectedTour360({
                          url: tour.url,
                          title: tour.filename || `Tour 360° ${index + 1}`,
                        });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-inkwell truncate">Tour 360° {index + 1}</p>
                          <p className="text-xs text-lunar-eclipse truncate">{tour.filename || 'Tour virtual'}</p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-purple-600 text-white hover:bg-purple-700 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTour360({
                              url: tour.url,
                              title: tour.filename || `Tour 360° ${index + 1}`,
                            });
                          }}
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-purple-200 rounded-lg bg-purple-50/30">
                  <Camera className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
                  <p className="text-lunar-eclipse mb-4">No hay tours 360° disponibles</p>
                  <p className="text-xs text-lunar-eclipse">Usa el botón de arriba para probar con una imagen de ejemplo</p>
                </div>
              )}
            </CardContent>
          </Card>

          {property.description && (
            <Card className="border-au-lait">
              <CardContent className="p-6">
                <h3 className="text-inkwell font-semibold mb-4 text-lg">Descripción</h3>
                <p className="text-lunar-eclipse leading-relaxed whitespace-pre-wrap">{property.description}</p>
              </CardContent>
            </Card>
          )}

          {property.houseRules && (
            <Card className="border-au-lait">
              <CardContent className="p-6">
                <h3 className="text-inkwell font-semibold mb-4 text-lg">Reglas de la Casa</h3>
                <p className="text-lunar-eclipse leading-relaxed whitespace-pre-wrap">{property.houseRules}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-au-lait sticky top-6">
            <CardContent className="p-6">
              <h3 className="text-inkwell font-semibold mb-4 text-lg">Características</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-au-lait/30">
                  <div className="w-10 h-10 bg-creme-brulee/10 rounded-lg flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5 text-creme-brulee" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-lunar-eclipse mb-0.5">Tipo</p>
                    <p className="text-inkwell font-semibold truncate">{TYPE_LABELS[property.propertyType] || property.propertyType || '—'}</p>
                  </div>
                </div>
                {property.size && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-au-lait/30">
                    <div className="w-10 h-10 bg-creme-brulee/10 rounded-lg flex items-center justify-center shrink-0">
                      <Ruler className="w-5 h-5 text-creme-brulee" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-lunar-eclipse mb-0.5">Tamaño</p>
                      <p className="text-inkwell font-semibold">{property.size} m²</p>
                    </div>
                  </div>
                )}
                {property.bedrooms !== undefined && property.bedrooms !== null && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-au-lait/30">
                    <div className="w-10 h-10 bg-creme-brulee/10 rounded-lg flex items-center justify-center shrink-0">
                      <Home className="w-5 h-5 text-creme-brulee" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-lunar-eclipse mb-0.5">Habitaciones</p>
                      <p className="text-inkwell font-semibold">{property.bedrooms}</p>
                    </div>
                  </div>
                )}
                {property.bathrooms !== undefined && property.bathrooms !== null && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-au-lait/30">
                    <div className="w-10 h-10 bg-creme-brulee/10 rounded-lg flex items-center justify-center shrink-0">
                      <Bath className="w-5 h-5 text-creme-brulee" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-lunar-eclipse mb-0.5">Baños</p>
                      <p className="text-inkwell font-semibold">{property.bathrooms}</p>
                    </div>
                  </div>
                )}
                {property.bathroomType && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-au-lait/30">
                    <div className="w-10 h-10 bg-creme-brulee/10 rounded-lg flex items-center justify-center shrink-0">
                      <Bath className="w-5 h-5 text-creme-brulee" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-lunar-eclipse mb-0.5">Tipo de Baño</p>
                      <p className="text-inkwell font-semibold truncate">{BATHROOM_LABELS[property.bathroomType] || property.bathroomType}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {property.includedServices && Array.isArray(property.includedServices) && property.includedServices.length > 0 && (
            <Card className="border-au-lait">
              <CardContent className="p-6">
                <h3 className="text-inkwell font-semibold mb-4 text-lg">Servicios Incluidos</h3>
                <div className="flex flex-wrap gap-2">
                  {property.includedServices.map((service: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-creme-brulee/10 text-inkwell border border-creme-brulee/20 hover:bg-creme-brulee/20 transition-colors">
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            <img
              src={allImages[selectedImageIndex]?.url || placeholderImage}
              alt={`Imagen ${selectedImageIndex + 1}`}
              className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="ghost"
              size="lg"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 p-0"
              onClick={() => setSelectedImageIndex(null)}
            >
              ✕
            </Button>
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 p-0 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1);
                  }}
                >
                  ‹
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 p-0 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0);
                  }}
                >
                  ›
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <PannellumViewer
        open={selectedTour360 !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTour360(null);
        }}
        imageUrl={selectedTour360?.url || ""}
        title={selectedTour360?.title || "Tour 360°"}
      />

      <ConfirmDialog
        open={deleteDialogoen}
        onOpenChange={setDeleteDialogoen}
        title="¿Eliminar propiedad?"
        description="¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}

