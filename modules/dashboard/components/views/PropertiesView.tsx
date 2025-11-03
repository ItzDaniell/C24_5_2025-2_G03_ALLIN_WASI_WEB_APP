"use client";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { 
  Building, 
  Search, 
  MapPin, 
  Plus, 
  Edit3,
  Eye,
  DollarSign,
  BarChart3,
  Filter
} from "lucide-react";

interface PropertiesViewProps {
  onViewChange: (view: string) => void;
  onEditProperty: (propertyId: number) => void;
}

const properties = [
  { id: 1, title: "Habitación en Santa Anita - Cerca de TECSUP", location: "Santa Anita, Lima", price: 450, status: "alquilada", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", bedrooms: 1, bathrooms: 1, size: "12 m²", views: 523, tours: 45 },
  { id: 2, title: "Cuarto amoblado con baño privado", location: "Santa Anita, Lima", price: 550, status: "libre", image: "https://images.unsplash.com/photo-1556912173-46c336c7fd55", bedrooms: 1, bathrooms: 1, size: "15 m²", views: 387, tours: 31 },
  { id: 3, title: "Departamento compartido - 2 habitaciones", location: "Ate, Lima", price: 350, status: "libre", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688", bedrooms: 2, bathrooms: 1, size: "8 m²", views: 412, tours: 28 },
  { id: 4, title: "Habitación individual con escritorio", location: "La Molina, Lima", price: 500, status: "reservada", image: "https://images.unsplash.com/photo-1540518614846-7eded433c457", bedrooms: 1, bathrooms: 1, size: "14 m²", views: 298, tours: 22 },
  { id: 5, title: "Mini departamento cerca del campus", location: "Santa Anita, Lima", price: 650, status: "alquilada", image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9", bedrooms: 1, bathrooms: 1, size: "20 m²", views: 615, tours: 53 },
  { id: 6, title: "Cuarto con terraza y baño compartido", location: "Ate, Lima", price: 380, status: "libre", image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d", bedrooms: 1, bathrooms: 1, size: "10 m²", views: 387, tours: 31 },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'alquilada':
      return <Badge className="bg-lunar-eclipse text-white hover:bg-lunar-eclipse">Alquilada</Badge>;
    case 'libre':
      return <Badge className="bg-creme-brulee text-white hover:bg-creme-brulee">Disponible</Badge>;
    case 'reservada':
      return <Badge className="bg-au-lait text-inkwell hover:bg-au-lait">Reservada</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function PropertiesView({ onViewChange, onEditProperty }: PropertiesViewProps) {
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
                <p className="text-inkwell">8</p>
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
                <p className="text-inkwell">3</p>
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
                <p className="text-inkwell">1,596</p>
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
                <p className="text-inkwell">116</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow border-au-lait">
            <div className="relative">
              <img 
                src={property.image} 
                alt={property.title}
                className="w-full h-48 object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
              />
              <div className="absolute top-3 right-3">
                {getStatusBadge(property.status)}
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-white text-inkwell hover:bg-au-lait"
                  onClick={() => onEditProperty(property.id)}
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Ver estadísticas
                </Button>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="text-inkwell mb-2">{property.title}</h3>
              
              <div className="flex items-center gap-1 text-sm text-lunar-eclipse mb-3">
                <MapPin className="w-4 h-4" />
                {property.location}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-creme-brulee">
                  S/{property.price.toLocaleString()}/mes
                </p>
                <div className="flex items-center gap-3 text-xs text-lunar-eclipse">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {property.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {property.tours}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
