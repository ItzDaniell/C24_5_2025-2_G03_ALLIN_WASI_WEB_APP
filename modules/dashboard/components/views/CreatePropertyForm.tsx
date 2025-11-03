"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import { Badge } from "@/ui/badge";
import { Checkbox } from "@/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { 
  ArrowLeft,
  ArrowRight,
  Upload,
  MapPin,
  Home as HomeIcon,
  Camera,
  Check,
  X,
  Plus
} from "lucide-react";
import useCreateProperty from "@/modules/dashboard/data/mutations/useCreateProperty";
import useProperty from "@/modules/dashboard/data/queries/useProperty";
import useUpdateProperty from "@/modules/dashboard/data/mutations/useUpdateProperty";
import { toast } from "sonner";

interface CreatePropertyFormProps {
  onViewChange: (view: string) => void;
  editingPropertyId?: number | null;
}

const mockProperties = [
  { id: 1, title: "Habitación moderna cerca de UNALM", type: "habitacion", description: "", location: "Santa Anita, Lima", privateBathroom: true, size: "25", services: ["Internet WiFi", "Agua caliente"], price: "750", rules: "" },
  { id: 2, title: "Departamento compartido - UNI", type: "departamento", description: "", location: "Rímac, Lima", privateBathroom: false, size: "80", services: ["Internet WiFi", "Cocina"], price: "600", rules: "" }
];

export function CreatePropertyForm({ onViewChange, editingPropertyId }: CreatePropertyFormProps) {
  const isEditing = editingPropertyId !== null && editingPropertyId !== undefined;
  const { data: editingData } = useProperty(isEditing ? editingPropertyId! : undefined);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    location: "",
    privateBathroom: false,
    size: "",
    services: [] as string[],
    price: "",
    rules: "",
    photos: [] as File[],
    tour360: null as File | null,
    latitude: -12.0464,
    longitude: -77.0428,
  });
  const { mutate, isPending } = useCreateProperty();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateProperty(isEditing ? editingPropertyId! : undefined);

  // Prefill when editing
  useEffect(() => {
    if (editingData) {
      const reverseType = (apiType?: string) => {
        const t = (apiType || '').toLowerCase();
        if (t === 'room') return 'habitacion';
        if (t === 'apartment') return 'departamento';
        if (t === 'house') return 'casa';
        return '';
      };
      setFormData(prev => ({
        ...prev,
        title: editingData.title || '',
        type: reverseType(editingData.propertyType),
        description: editingData.description || '',
        location: editingData.address || '',
        privateBathroom: (editingData.bathroomType || '').toLowerCase() === 'private',
        size: String(editingData.size ?? ''),
        services: Array.isArray(editingData.includedServices) ? editingData.includedServices : [],
        price: String(editingData.monthlyPrice ?? ''),
        rules: editingData.houseRules || '',
        latitude: typeof editingData.latitude === 'number' ? editingData.latitude : prev.latitude,
        longitude: typeof editingData.longitude === 'number' ? editingData.longitude : prev.longitude,
      }));
    }
  }, [editingData]);

  const steps = [
    { number: 1, title: "Información básica", icon: HomeIcon },
    { number: 2, title: "Características", icon: Check },
    { number: 3, title: "Fotos y Tour 360°", icon: Camera },
  ];

  const services = [
    "Internet WiFi", "Agua caliente", "Lavadora", "Cocina", "Refrigerador",
    "Aire acondicionado", "Calefacción", "TV por cable", "Estacionamiento",
    "Seguridad 24/7", "Gym", "Alberca",
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      const valid =
        formData.title.trim().length > 0 &&
        formData.type.trim().length > 0 &&
        formData.description.trim().length > 0 &&
        formData.location.trim().length > 0;
      if (!valid) {
        toast.error("Completa Título, Tipo, Descripción y Ubicación para continuar.");
        return;
      }
    }
    if (currentStep === 2) {
      const sizeNum = Number(formData.size);
      const priceNum = Number(formData.price);
      const valid = priceNum > 0 && sizeNum > 0;
      if (!valid) {
        toast.error("Ingresa un Tamaño (m²) y Precio mensual válidos.");
        return;
      }
    }
    setCurrentStep((s) => Math.min(3, s + 1));
  };
  const handlePrev = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Título del anuncio *</Label>
        <Input id="title" placeholder="Ej: Habitación moderna" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className="mt-2 bg-white border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
      </div>
      <div>
        <Label htmlFor="type">Tipo de propiedad *</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger className="mt-2 bg-white border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all">
            <SelectValue placeholder="Selecciona el tipo de propiedad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="habitacion">Habitación en casa compartida</SelectItem>
            <SelectItem value="estudio">Estudio completo</SelectItem>
            <SelectItem value="departamento">Departamento completo</SelectItem>
            <SelectItem value="casa">Casa completa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="description">Descripción *</Label>
        <Textarea id="description" placeholder="Describe tu propiedad" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="mt-2 min-h-[120px] bg-white border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none" />
      </div>
      <div>
        <Label htmlFor="location">Ubicación *</Label>
        <div className="mt-2 space-y-3">
          <Input id="location" placeholder="Ej: Santa Anita, Lima, Perú" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
          <Card className="p-4 bg-au-lait border-au-lait">
            <div className="flex items-center gap-3 text-lunar-eclipse">
              <MapPin className="w-5 h-5" />
              <p className="text-sm">Ingrese su dirección de forma manual.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Tipo de baño *</Label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="private" checked={formData.privateBathroom} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, privateBathroom: !!checked }))} />
              <Label htmlFor="private">Baño privado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="shared" checked={!formData.privateBathroom} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, privateBathroom: !checked }))} />
              <Label htmlFor="shared">Baño compartido</Label>
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="size">Tamaño (m²)</Label>
          <Input id="size" type="number" placeholder="Ej: 25" value={formData.size} onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))} className="mt-2 bg-white border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
      </div>
      <div>
        <Label>Servicios incluidos</Label>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
          {services.map((service) => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox id={service} checked={formData.services.includes(service)} onCheckedChange={() => handleServiceToggle(service)} />
              <Label htmlFor={service} className="text-sm">{service}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="price">Precio mensual (PEN) *</Label>
        <Input id="price" type="number" placeholder="Ej: 800" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} className="mt-2 bg-white border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
      </div>
      <div>
        <Label htmlFor="rules">Reglas de la casa</Label>
        <Textarea id="rules" placeholder="Ej: No se permiten mascotas, no fumar, etc." value={formData.rules} onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))} className="mt-2 min-h-[100px] bg-white border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none" />
      </div>
    </div>
  );

  const availableFiles = [
    { id: 1, name: "habitacion-principal-1.jpg", type: "image", folder: "Habitación Principal", thumbnail: "https://images.unsplash.com/photo-1611234688667-76b6d8fadd75?auto=format&w=300&q=80" },
    { id: 2, name: "habitacion-principal-2.jpg", type: "image", folder: "Habitación Principal", thumbnail: "https://images.unsplash.com/photo-1721274505817-e3ccb4fc6390?auto=format&w=300&q=80" },
    { id: 3, name: "tour-360-habitacion.mp4", type: "tour360", folder: "Habitación Principal", thumbnail: "" },
  ];

  const [selectedFiles, setSelectedFiles] = useState<number[]>([2, 3]);
  const toggleFileSelection = (fileId: number) => {
    setSelectedFiles(prev => prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]);
  };

  const selectedImages = availableFiles.filter(file => selectedFiles.includes(file.id) && file.type === 'image');
  const selectedTours = availableFiles.filter(file => selectedFiles.includes(file.id) && file.type === 'tour360');

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card className="bg-au-lait border-au-lait">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-creme-brulee rounded-full flex items-center justify-center flex-shrink-0">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-inkwell">Selecciona de tus archivos subidos</h4>
              <p className="text-sm text-lunar-eclipse mt-1">Escoge las fotos y tours 360° que ya has subido a tu biblioteca de archivos.</p>
              <Button variant="outline" size="sm" className="mt-2 border-creme-brulee text-creme-brulee" onClick={() => onViewChange('files')}>
                <Plus className="w-3 h-3 mr-1" />
                Ir a Mis Archivos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Label>Fotos de la propiedad *</Label>
        <p className="text-sm text-gray-500 mt-1">Selecciona al menos 3 fotos de tu biblioteca ({selectedImages.length} seleccionadas)</p>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto">
          {availableFiles.filter(file => file.type === 'image').map((file) => (
            <Card key={file.id} className={`cursor-pointer transition-all ${selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`} onClick={() => toggleFileSelection(file.id)}>
              <CardContent className="p-2">
                <div className="relative">
                  <img src={file.thumbnail} alt={file.name} className="w-full h-20 object-cover rounded" />
                  {selectedFiles.includes(file.id) && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-creme-brulee rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-xs font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.folder}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Label>Tour Virtual 360° *</Label>
        <p className="text-sm text-gray-500 mt-1">Selecciona un tour 360° de tu biblioteca (OBLIGATORIO - {selectedTours.length} seleccionado)</p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableFiles.filter(file => file.type === 'tour360').map((file) => (
            <Card key={file.id} className={`cursor-pointer transition-all ${selectedFiles.includes(file.id) ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-md'}`} onClick={() => toggleFileSelection(file.id)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center relative">
                    <Camera className="w-8 h-8 text-white" />
                    {selectedFiles.includes(file.id) && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-lunar-eclipse rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-inkwell">{file.name}</p>
                    <p className="text-sm text-lunar-eclipse">{file.folder}</p>
                    <Badge className="mt-1 bg-lunar-eclipse bg-opacity-10 text-lunar-eclipse">Tour 360°</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {selectedTours.length === 0 && (
          <Card className="bg-au-lait border-creme-brulee mt-3">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-inkwell">
                <X className="w-5 h-5" />
                <p className="text-sm font-medium">Debes seleccionar al menos un tour 360° para continuar</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const mapPropertyType = (t: string) => {
    if (t === "habitacion") return "room";
    if (t === "estudio") return "studio";
    if (t === "departamento") return "apartment";
    if (t === "casa") return "house";
    return "room";
  };

  const handleSubmit = () => {
    const imagesOk = selectedImages.length >= 1;
    const toursOk = selectedTours.length >= 1;
    if (!imagesOk || !toursOk) {
      toast.error("Selecciona al menos 1 foto y 1 tour 360° antes de publicar.");
      return;
    }
    const payload = {
      title: formData.title,
      description: formData.description,
      propertyType: mapPropertyType(formData.type),
      address: formData.location,
      city: "Lima",
      country: "Perú",
      latitude: formData.latitude,
      longitude: formData.longitude,
      monthlyPrice: Number(formData.price) || 0,
      currency: "PEN",
      size: Number(formData.size) || 0,
      bathroomType: formData.privateBathroom ? "private" : "shared",
      bedrooms: 1,
      bathrooms: 1,
      includedServices: formData.services,
      houseRules: formData.rules,
      status: "available",
      tour360Url: undefined as string | undefined,
    };
    if (isEditing) {
      updateMutate(payload as any, {
        onSuccess: () => {
          toast.success("Propiedad actualizada exitosamente");
          onViewChange('properties');
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message || err?.message || "Error al actualizar la propiedad";
          toast.error(message);
        }
      });
    } else {
      mutate(payload as any, {
        onSuccess: () => {
          toast.success("Propiedad creada exitosamente");
          onViewChange('properties');
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message || err?.message || "Error al crear la propiedad";
          toast.error(message);
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1>{isEditing ? 'Editar Propiedad' : 'Crear Nueva Propiedad'}</h1>
          <p className="text-gray-600">{isEditing ? 'Actualiza la información de tu propiedad' : 'Completa la información para publicar tu anuncio'}</p>
        </div>
        <Button variant="ghost" onClick={() => onViewChange('properties')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver a propiedades
        </Button>
      </div>

      {/* Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex w-full h-28 items-center justify-center">
            <div className="flex items-center justify-center gap-8 max-w-3xl mx-auto w-full">
              {steps.map((step, index) => {
                const Icon = step.icon as any;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                return (
                  <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className={`text-sm mt-2 text-center ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>{step.title}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-1 w-24 sm:w-40 mx-4 self-center ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Paso {currentStep} de 3</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Proporciona la información básica de tu propiedad"}
            {currentStep === 2 && "Define las características y servicios incluidos"}
            {currentStep === 3 && "Sube fotos y crea un tour virtual 360°"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </CardContent>
      </Card>

      {/* Nav buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        {currentStep < 3 ? (
          <Button onClick={handleNext} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center gap-2">
            Siguiente
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isPending || isUpdating} className="bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center gap-2">
            <Check className="w-4 h-4" />
            {isPending || isUpdating ? (isEditing ? 'Guardando...' : 'Publicando...') : (isEditing ? 'Guardar Cambios' : 'Publicar Anuncio')}
          </Button>
        )}
      </div>
    </div>
  );
}
