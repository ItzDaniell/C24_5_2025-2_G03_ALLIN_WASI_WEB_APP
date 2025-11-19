"use client";
import React from "react";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Checkbox } from "@/ui/checkbox";
import useMyProperties from "@/modules/dashboard/data/queries/useMyProperties";
import useDeleteProperty from "@/modules/dashboard/data/mutations/useDeleteProperty";
import { toast } from "sonner";
import { Building, Search, MapPin, Plus, DollarSign, Filter, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/ui/dropdown-menu";
import useUpdatePropertyById from "@/modules/dashboard/data/mutations/useUpdatePropertyById";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import useDebouncedValue from "@/modules/dashboard/hooks/useDebouncedValue";
import { ConfirmDialog } from "../../common/ConfirmDialog";
import { useMyFiles } from "@/modules/dashboard/data/queries/useMedia";
import { PropertyCardSkeleton, StatCardSkeleton } from "../../shared/LoadingSkeleton";

interface PropertiesViewProps {
  onViewChange: (view: string) => void;
  onStartEdit?: (propertyId: string | number) => void;
  onViewDetails?: (propertyId: string | number) => void;
  initialProperties?: any[];
}

const placeholderImage = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688";

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

export function PropertiesView({ onViewChange, onStartEdit, onViewDetails, initialProperties }: PropertiesViewProps) {
  const { data, isLoading } = useMyProperties(initialProperties);
  const properties = Array.isArray(data) ? data : [];
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: userFiles } = useMyFiles({ type: 'image' });
  const propertyImagesMap = React.useMemo(() => {
    if (!userFiles) return new Map<string, string>();
    const map = new Map<string, string>();
    const propertyImages = userFiles.filter(
      (file) => file.type === 'image' && file.property_id
    );
    const sortedFiles = [...propertyImages].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
    sortedFiles.forEach((file) => {
      const propId = String(file.property_id);
      if (!map.has(propId)) {
        map.set(propId, file.url);
      }
    });
    return map;
  }, [userFiles]);
  const [minPrice, setMinPrice] = React.useState<string>("");
  const [maxPrice, setMaxPrice] = React.useState<string>("");
  const [enablePrice, setEnablePrice] = React.useState<boolean>(false);
  const [enableStatus, setEnableStatus] = React.useState<boolean>(false);
  const [enableType, setEnableType] = React.useState<boolean>(false);
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>(["available","rented","reserved","draft"]);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [tMinPrice, tSetMinPrice] = React.useState<string>("");
  const [tMaxPrice, tSetMaxPrice] = React.useState<string>("");
  const [tEnablePrice, tSetEnablePrice] = React.useState<boolean>(false);
  const [tEnableStatus, tSetEnableStatus] = React.useState<boolean>(true);
  const [tEnableType, tSetEnableType] = React.useState<boolean>(true);
  const [tSelectedStatuses, tSetSelectedStatuses] = React.useState<string[]>(["available","rented","reserved","draft"]);
  const [tSelectedTypes, tSetSelectedTypes] = React.useState<string[]>([]);
  const [deletePropertyDialog, setDeletePropertyDialog] = React.useState<{ open: boolean; propertyId: string | null }>({
    open: false,
    propertyId: null,
  });
  const [filtersOpen, setFiltersOpen] = React.useState<boolean>(false);

  const STATUS_LABELS: Record<string, string> = {
    available: "Disponible",
    rented: "Alquilada",
    reserved: "Reservada",
    draft: "Borrador",
  };
  const TYPE_LABELS: Record<string, string> = {
    room: "Habitación",
    apartment: "Departamento",
    house: "Casa",
    studio: "Estudio",
  };

  const toggleArrayValue = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
  const filteredProperties = React.useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const min = Number(minPrice) || undefined;
    const max = Number(maxPrice) || undefined;
    if (!q && !enablePrice && !enableStatus && !enableType) return properties;
    return properties.filter((p: any) => {
      const title = String(p.title || "").toLowerCase();
      const priceVal = Number(p.monthlyPrice ?? p.price ?? NaN);
      const matchesText = !q || title.includes(q);
      const matchesMin = !enablePrice || !min || (Number.isFinite(priceVal) && priceVal >= min);
      const matchesMax = !enablePrice || !max || (Number.isFinite(priceVal) && priceVal <= max);
      const statusVal = String(p.status || '').toLowerCase();
      const matchesStatus = !enableStatus || selectedStatuses.includes(statusVal);
      const typeVal = String(p.propertyType || '').toLowerCase();
      const matchesType = !enableType || (selectedTypes.length === 0 ? true : selectedTypes.includes(typeVal));
      return matchesText && matchesMin && matchesMax && matchesStatus && matchesType;
    });
  }, [properties, search, minPrice, maxPrice, enablePrice, enableStatus, enableType, selectedStatuses, selectedTypes]);
  const { mutate: deleteProperty, isPending: deleting } = useDeleteProperty();
  const { mutate: updatePropertyById } = useUpdatePropertyById();

  const confirmDeleteProperty = () => {
    if (!deletePropertyDialog.propertyId) return;
    deleteProperty(deletePropertyDialog.propertyId, {
      onSuccess: () => toast.success("Propiedad eliminada"),
      onError: (err: any) => toast.error(err?.response?.data?.message || "No se pudo eliminar"),
    });
  };

  const hasActiveFilters = Boolean(search.trim()) || enablePrice || enableStatus || enableType;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-au-lait/50">
          <div className="h-8 bg-au-lait/30 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-au-lait/30 rounded w-64 animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <PropertyCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-au-lait/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-inkwell mb-1">Mis Propiedades</h1>
            <p className="text-sm sm:text-base text-lunar-eclipse">Gestiona y supervisa todas tus propiedades de alquiler</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-creme-brulee to-creme-brulee/80 text-white hover:from-creme-brulee/90 hover:to-creme-brulee/70 shadow-md hover:shadow-lg transition-all"
            onClick={() => onViewChange('create-property')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Propiedad
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-au-lait/50 hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lunar-eclipse">Total Propiedades</p>
                <p className="text-2xl font-bold text-inkwell mt-1">{properties.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-lunar-eclipse to-lunar-eclipse/80 rounded-xl flex items-center justify-center shadow-md">
                <Building className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-au-lait/50 hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lunar-eclipse">Disponibles</p>
                <p className="text-2xl font-bold text-inkwell mt-1">{properties.filter((p: any) => (p.status || '').toLowerCase() === 'available').length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-creme-brulee to-creme-brulee/80 rounded-xl flex items-center justify-center shadow-md">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-au-lait/50 hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lunar-eclipse">Alquiladas</p>
                <p className="text-2xl font-bold text-inkwell mt-1">{properties.filter((p: any) => (p.status || '').toLowerCase() === 'rented').length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-inkwell to-lunar-eclipse rounded-xl flex items-center justify-center shadow-md">
                <Building className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-au-lait/50 hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lunar-eclipse">Borradores</p>
                <p className="text-2xl font-bold text-inkwell mt-1">{properties.filter((p: any) => (p.status || '').toLowerCase() === 'draft').length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-au-lait to-au-lait/60 rounded-xl flex items-center justify-center shadow-md">
                <Building className="w-6 h-6 text-inkwell" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-au-lait/50 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-lunar-eclipse" />
              </span>
              <Input 
                placeholder="Buscar por nombre de propiedad"
                className="pl-10 h-11 bg-white border-2 border-au-lait/50 rounded-lg pr-4 focus:border-creme-brulee focus:ring-2 focus:ring-creme-brulee/20 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <DropdownMenu
              open={filtersOpen}
              onOpenChange={(open: boolean) => {
                setFiltersOpen(open);
                if (open) {
                  tSetMinPrice(minPrice);
                  tSetMaxPrice(maxPrice);
                  tSetEnablePrice(true);
                  tSetEnableStatus(true);
                  tSetEnableType(true);
                  tSetSelectedStatuses(selectedStatuses);
                  tSetSelectedTypes(selectedTypes);
                }
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 flex items-center gap-2 border-au-lait text-inkwell hover:bg-au-lait whitespace-nowrap">
                  <Filter className="w-4 h-4" />
                  Filtros
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-inkwell">Precio</div>
                  <Checkbox id="enablePrice" checked={tEnablePrice} onCheckedChange={(v) => tSetEnablePrice(Boolean(v))} />
                </div>
                <div className={`grid grid-cols-2 gap-3 ${tEnablePrice ? '' : 'opacity-50 pointer-events-none'}`}>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-lunar-eclipse pointer-events-none">S/</span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      min={0}
                      step={50}
                      placeholder="Mín"
                      className="pl-10 h-10 bg-white border-2 border-gray-200 rounded-lg pr-3 focus:border-creme-brulee focus:ring-2 focus:ring-creme-brulee focus:ring-opacity-20 transition-all"
                      value={tMinPrice}
                      onChange={(e) => { tSetMinPrice(e.target.value); if (e.target.value !== "") tSetEnablePrice(true); }}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-lunar-eclipse pointer-events-none">S/</span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      min={0}
                      step={50}
                      placeholder="Máx"
                      className="pl-10 h-10 bg-white border-2 border-gray-200 rounded-lg pr-3 focus:border-creme-brulee focus:ring-2 focus:ring-creme-brulee focus:ring-opacity-20 transition-all"
                      value={tMaxPrice}
                      onChange={(e) => { tSetMaxPrice(e.target.value); if (e.target.value !== "") tSetEnablePrice(true); }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-sm font-medium text-inkwell">Estado</div>
                  <Checkbox id="enableStatus" checked={tEnableStatus} onCheckedChange={(v) => tSetEnableStatus(Boolean(v))} />
                </div>
                <div className={`grid grid-cols-2 gap-2 ${tEnableStatus ? '' : 'opacity-50 pointer-events-none'}`}>
                  {(["available","rented","reserved","draft"] as const).map(s => (
                    <label key={s} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={tSelectedStatuses.includes(s)} onCheckedChange={() => { tSetSelectedStatuses(prev => toggleArrayValue(prev, s)); tSetEnableStatus(true); }} />
                      <span className="capitalize">{STATUS_LABELS[s] || s}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-sm font-medium text-inkwell">Tipo</div>
                  <Checkbox id="enableType" checked={tEnableType} onCheckedChange={(v) => tSetEnableType(Boolean(v))} />
                </div>
                <div className={`grid grid-cols-2 gap-2 ${tEnableType ? '' : 'opacity-50 pointer-events-none'}`}>
                  {(["room","apartment","house","studio"] as const).map(t => (
                    <label key={t} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={tSelectedTypes.includes(t)} onCheckedChange={() => { tSetSelectedTypes(prev => toggleArrayValue(prev, t)); tSetEnableType(true); }} />
                      <span className="capitalize">{TYPE_LABELS[t] || t}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between gap-2 pt-2">
                  <Button size="sm" variant="outline" className="border-au-lait"
                    onClick={() => {
                      tSetEnablePrice(false); tSetMinPrice(""); tSetMaxPrice("");
                      tSetEnableStatus(false); tSetSelectedStatuses(["available","rented","reserved","draft"]);
                      tSetEnableType(false); tSetSelectedTypes([]);
                      setEnablePrice(false); setMinPrice(""); setMaxPrice("");
                      setEnableStatus(false); setSelectedStatuses(["available","rented","reserved","draft"]);
                      setEnableType(false); setSelectedTypes([]);
                      setFiltersOpen(false);
                    }}
                  >Limpiar todo</Button>
                  <Button
                    size="sm"
                    className="bg-creme-brulee text-white hover:bg-opacity-90"
                    onClick={() => {
                      setEnablePrice(tEnablePrice); setMinPrice(tMinPrice); setMaxPrice(tMaxPrice);
                      setEnableStatus(tEnableStatus); setSelectedStatuses(tSelectedStatuses);
                      setEnableType(tEnableType); setSelectedTypes(tSelectedTypes);
                      setFiltersOpen(false);
                    }}
                  >Aplicar</Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="text-lunar-eclipse">Cargando propiedades...</div>
      ) : filteredProperties.length === 0 ? (
        <Card className="border-au-lait">
          <CardContent className="p-6 text-lunar-eclipse">
            {hasActiveFilters
              ? "No se encontraron propiedades que coincidan con tus filtros."
              : "Aún no tienes propiedades. Crea tu primera propiedad para comenzar."}
            <div className="mt-4">
              <Button className="bg-lunar-eclipse text-white" onClick={() => onViewChange('create-property')}>
                <Plus className="w-4 h-4 mr-2" /> Nueva Propiedad
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property: any) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow border-au-lait">
            <div className="relative">
              <img
                src={(() => {
                  if (property.images && property.images.length > 0) {
                    const coverImage = property.images.find((img: any) => img.order === 0 && !img.is360Tour);
                    if (coverImage) {
                      return coverImage.url;
                    }
                    const sortedImages = [...property.images]
                      .filter((img: any) => !img.is360Tour)
                      .sort((a, b) => (a.order || 0) - (b.order || 0));
                    if (sortedImages.length > 0) {
                      return sortedImages[0].url;
                    }
                  }
                  return placeholderImage;
                })()}
                alt={property.title || 'Propiedad'}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== placeholderImage) {
                    target.src = placeholderImage;
                  } else {
                    target.style.visibility = 'hidden';
                  }
                }}
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {getStatusBadge(property.status || 'available')}
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="text-inkwell mb-2">{property.title || 'Propiedad sin título'}</h3>
              
              <div className="flex items-center gap-1 text-sm text-lunar-eclipse mb-3">
                <MapPin className="w-4 h-4" />
                {property.city && property.country ? `${property.city}, ${property.country}` : (property.address || 'Sin ubicación')}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-creme-brulee">
                  S/{(property.monthlyPrice || property.price || 0).toLocaleString()}/mes
                </p>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-lunar-eclipse">Estado:</span>
                    <Select
                      value={(property.status || 'available').toLowerCase()}
                      onValueChange={(val) => {
                        const current = (property.status || '').toLowerCase();
                        if (val === current) return;
                        updatePropertyById({ id: property.id, payload: { status: val } }, {
                          onSuccess: () => toast.success(`Estado cambiado a ${STATUS_LABELS[val] || val}`),
                          onError: (err: any) => toast.error(err?.response?.data?.message || "No se pudo cambiar el estado"),
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 min-w-[140px] bg-white border-au-lait">
                        <SelectValue placeholder="Selecciona estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {(["available","reserved","rented"] as const).map(target => (
                          <SelectItem
                            key={target}
                            value={target}
                            disabled={(property.status || '').toLowerCase() === target}
                          >
                            {STATUS_LABELS[target] || target}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      className="bg-creme-brulee text-white hover:bg-creme-brulee/90"
                      onClick={() => onViewDetails?.(property.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver detalles
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-white text-inkwell border border-au-lait hover:bg-au-lait"
                      onClick={() => onStartEdit?.(property.id)}
                    >
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-white text-red-600 border border-red-200 hover:bg-red-50"
                      onClick={() => setDeletePropertyDialog({ open: true, propertyId: String(property.id) })}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
      <ConfirmDialog
        open={deletePropertyDialog.open}
        onOpenChange={(open) => setDeletePropertyDialog({ ...deletePropertyDialog, open })}
        title="¿Eliminar propiedad?"
        description="¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteProperty}
        isLoading={deleting}
      />
    </div>
  );
}
