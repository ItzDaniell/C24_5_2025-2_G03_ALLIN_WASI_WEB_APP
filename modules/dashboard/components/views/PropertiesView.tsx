"use client";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import useMyProperties from "@/modules/dashboard/data/queries/useMyProperties";
import useDeleteProperty from "@/modules/dashboard/data/mutations/useDeleteProperty";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/ui/dropdown-menu";
import { 
  Building, 
  Search, 
  MapPin, 
  Plus, 
  Edit3,
  Eye,
  DollarSign,
  BarChart3,
  Filter,
  MoreVertical
} from "lucide-react";

interface PropertiesViewProps {
  onViewChange: (view: string) => void;
  onEditProperty: (propertyId: number) => void; // view stats
  onStartEdit?: (propertyId: number) => void; // open edit form
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

export function PropertiesView({ onViewChange, onEditProperty, onStartEdit, initialProperties }: PropertiesViewProps) {
  const { data, isLoading, error } = useMyProperties(initialProperties);
  const properties = Array.isArray(data) ? data : [];
  const { mutate: deleteProperty, isPending: deleting } = useDeleteProperty();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="mb-2 text-inkwell">Mis Propiedades</h1>
          <p className="text-lunar-eclipse">Gestiona y supervisa todas tus propiedades de alquiler</p>
        </div>
        <Button 
          className="bg-lunar-eclipse text-white hover:bg-inkwell"
          onClick={() => onViewChange('create-property')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Propiedad
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-au-lait">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-lunar-eclipse">Total Propiedades</p>
                <p className="text-inkwell">{properties.length}</p>
              </div>
              <Building className="w-8 h-8 text-lunar-eclipse" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-au-lait">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-lunar-eclipse">Disponibles</p>
                <p className="text-inkwell">{properties.filter((p: any) => (p.status || '').toLowerCase() === 'available').length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-creme-brulee" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-au-lait">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-lunar-eclipse">Visualizaciones</p>
                <p className="text-inkwell">—</p>
              </div>
              <Eye className="w-8 h-8 text-creme-brulee" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-au-lait">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-lunar-eclipse">Tours 360°</p>
                <p className="text-inkwell">—</p>
              </div>
              <BarChart3 className="w-8 h-8 text-lunar-eclipse" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-au-lait">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-lunar-eclipse" />
              <Input 
                placeholder="Buscar propiedades por título o ubicación..."
                className="pl-10 bg-white border-2 border-au-lait rounded-lg px-4 py-3 focus:border-creme-brulee focus:ring-2 focus:ring-creme-brulee focus:ring-opacity-20 transition-all"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2 border-au-lait text-inkwell hover:bg-au-lait">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="text-lunar-eclipse">Cargando propiedades...</div>
      ) : properties.length === 0 ? (
        <Card className="border-au-lait">
          <CardContent className="p-6 text-lunar-eclipse">
            Aún no tienes propiedades. Crea tu primera propiedad para comenzar.
            <div className="mt-4">
              <Button className="bg-lunar-eclipse text-white" onClick={() => onViewChange('create-property')}>
                <Plus className="w-4 h-4 mr-2" /> Nueva Propiedad
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property: any) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow border-au-lait">
            <div className="relative">
              <img
                src={property.images?.[0]?.url || placeholderImage}
                alt={property.title || 'Propiedad'}
                className="w-full h-48 object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {getStatusBadge(property.status || 'available')}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[160px]">
                    <DropdownMenuItem onClick={() => onStartEdit?.(property.id as number)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-700"
                      onClick={() => {
                        const ok = confirm("¿Eliminar esta propiedad? Esta acción no se puede deshacer.");
                        if (!ok) return;
                        deleteProperty(String(property.id), {
                          onSuccess: () => toast.success("Propiedad eliminada"),
                          onError: (err: any) => toast.error(err?.response?.data?.message || "No se pudo eliminar"),
                        });
                      }}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                <div className="flex items-center gap-3 text-xs text-lunar-eclipse">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {property.views ?? '—'}
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {property.tours ?? '—'}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Button 
                  size="sm" 
                  className="w-full bg-white text-inkwell border border-au-lait hover:bg-au-lait"
                  onClick={() => onEditProperty(property.id as number)}
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Ver estadísticas
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
