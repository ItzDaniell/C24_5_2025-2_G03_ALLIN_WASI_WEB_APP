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
import { ArrowLeft, ArrowRight, Upload, MapPin, Home as HomeIcon, Camera, Check, Plus, Sparkles, Folder } from "lucide-react";
import useCreateProperty from "@/modules/dashboard/data/mutations/useCreateProperty";
import useProperty from "@/modules/dashboard/data/queries/useProperty";
import useUpdateProperty from "@/modules/dashboard/data/mutations/useUpdateProperty";
import { useMyFiles, useMediaFolders, useFilesByFolder } from "@/modules/dashboard/data/queries/useMedia";
import { toast } from "sonner";

interface CreatePropertyFormProps {
  onViewChange: (view: string) => void;
  editingPropertyId?: number | null;
}

type GeoSuggestion = {
  label: string;
  lat: string;
  lon: string;
  address?: Record<string, any>;
};

function LocationAutocomplete({
  value,
  onChangeText,
  onSelect,
  onPickLatLon,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (sug: GeoSuggestion) => void;
  onPickLatLon: (lat: number, lon: number, resolved?: GeoSuggestion) => void;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [latInput, setLatInput] = useState<string>("");
  const [lonInput, setLonInput] = useState<string>("");
  const [resolving, setResolving] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapContainerId = "pick-map-container";
  const mapId = "pick-map";
  const markerRef = React.useRef<any>(null);
  const mapRef = React.useRef<any>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const q = query?.trim();
      if (!q || q.length < 3) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(q)}&limit=5&country=pe`, {
          headers: { "Accept": "application/json" },
          cache: "no-store",
        });
        const data = await res.json();
        const items: GeoSuggestion[] = Array.isArray(data) ? data : [];
        const limaFiltered = items.filter((it) => {
          const addr = it.address || {};
          const city = (addr.city || addr.town || addr.village || "").toLowerCase();
          const state = (addr.state || "").toLowerCase();
          const display = (it.label || "").toLowerCase();
          return city.includes("lima") || state.includes("lima") || display.includes(" lima");
        });
        setSuggestions(limaFiltered);
        setOpen(true);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);
  useEffect(() => {
    if (!showDialog) return;
    const ensureLeaflet = () =>
      new Promise<void>((resolve) => {
        const hasCss = document.querySelector('link[data-leaflet="1"]');
        const hasJs = (window as any).L;
        if (!hasCss) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          link.crossOrigin = "";
          link.setAttribute("data-leaflet", "1");
          document.head.appendChild(link);
        }
        if (hasJs) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

    let disposed = false;

    (async () => {
      if (navigator.geolocation) {
        await new Promise<void>((resolveGeo) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lon = pos.coords.longitude;
              const withinLima = lat >= -12.5 && lat <= -11.5 && lon >= -77.3 && lon <= -76.5;
              if (withinLima) {
                setLatInput(String(lat));
                setLonInput(String(lon));
              }
              resolveGeo();
            },
            () => resolveGeo(),
            { maximumAge: 300000, timeout: 3000 }
          );
        });
      }

      await ensureLeaflet();
      if (disposed) return;
      const L = (window as any).L;
      if (!L) return;
      setMapReady(true);
      const container = document.getElementById(mapId);
      if (!container) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      const initialLat = Number(latInput) || -12.0464;
      const initialLon = Number(lonInput) || -77.0428;
      const map = L.map(mapId).setView([initialLat, initialLon], 12);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);
      const southWest = L.latLng(-12.6, -77.5);
      const northEast = L.latLng(-11.3, -76.3);
      const bounds = L.latLngBounds(southWest, northEast);
      map.setMaxBounds(bounds);
      map.on("drag", function () {
        map.panInsideBounds(bounds, { animate: false });
      });

      const placeMarker = (lat: number, lon: number) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lon]);
        } else {
          markerRef.current = L.marker([lat, lon], { draggable: true }).addTo(map);
          markerRef.current.on("dragend", (e: any) => {
            const p = e.target.getLatLng();
            setLatInput(String(p.lat.toFixed(6)));
            setLonInput(String(p.lng.toFixed(6)));
          });
        }
        setLatInput(String(lat.toFixed(6)));
        setLonInput(String(lon.toFixed(6)));
      };

      placeMarker(initialLat, initialLon);

      map.on("click", async (e: any) => {
        placeMarker(e.latlng.lat, e.latlng.lng);
        const lat = e.latlng.lat as number;
        const lon = e.latlng.lng as number;
        const withinLima =
          lat >= -12.5 && lat <= -11.5 && lon >= -77.3 && lon <= -76.5;
        if (!withinLima) {
          toast.error("Selecciona un punto dentro de Lima Metropolitana");
          return;
        }
        try {
          setResolving(true);
          const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lon}`, { cache: "no-store" });
          const data = await res.json();
          onPickLatLon(lat, lon, data);
          setShowDialog(false);
          toast.success("Ubicación seleccionada");
        } catch {
          onPickLatLon(lat, lon);
          setShowDialog(false);
        } finally {
          setResolving(false);
        }
      });
    })();

    return () => {
      disposed = true;
    };
  }, [showDialog]);

  return (
    <div>
      <Label htmlFor="location">Ubicación *</Label>
      <div className="mt-2 space-y-2 relative">
        <Input
          id="location"
          placeholder="Ej: Santa Anita, Lima, Perú"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChangeText(e.target.value);
          }}
          className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        {open && (loading || suggestions.length > 0) && (
          <Card className="absolute z-10 w-full mt-1 border-au-lait">
            <CardContent className="p-2 max-h-64 overflow-y-auto">
              {loading && <p className="text-sm text-lunar-eclipse px-2 py-1">Buscando...</p>}
              {!loading && suggestions.map((sug, idx) => (
                <button
                  key={`${sug.lat}-${sug.lon}-${idx}`}
                  type="button"
                  className="w-full text-left px-2 py-2 hover:bg-au-lait rounded"
                  onClick={() => {
                    onSelect(sug);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 text-inkwell" />
                    <div>
                      <p className="text-sm text-inkwell">{sug.label}</p>
                    </div>
                  </div>
                </button>
              ))}
              {!loading && suggestions.length === 0 && <p className="text-sm text-lunar-eclipse px-2 py-1">Sin resultados</p>}
            </CardContent>
          </Card>
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" className="border-creme-brulee text-creme-brulee" onClick={() => setShowDialog(true)}>
            <MapPin className="w-4 h-4 mr-1" />
            Elegir en mapa
          </Button>
        </div>
        {showDialog && (
          <div className="fixed inset-0 bg-black/40 z-20 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-4">
              <h3 className="text-inkwell mb-2">Seleccionar ubicación en el mapa</h3>
              <p className="text-sm text-lunar-eclipse mb-3">Haz clic en el mapa para colocar el marcador. Usaremos esa ubicación para obtener la dirección.</p>
              <div id={mapContainerId} className="w-full h-[480px] rounded overflow-hidden border border-au-lait">
                <div id={mapId} className="w-full h-full" />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button type="button" variant="ghost" onClick={() => setShowDialog(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
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
    city: "",
    country: "",
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
  const { data: userFiles, isLoading: filesLoading } = useMyFiles({ type: 'image' });
  const { data: foldersData } = useMediaFolders();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { data: folderFilesData, isLoading: folderFilesLoading } = useFilesByFolder(selectedFolderId);

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

  useEffect(() => {
    if (isEditing && editingPropertyId && editingData?.images) {
      const propertyId = String(editingPropertyId);
      const imageUrls = new Set(editingData.images.map((img: any) => img.url));
      
      const findAssociatedFiles = (files: any[]) => {
        return files
          .filter(file => file.type === 'image' && imageUrls.has(file.url))
          .map(file => file.id);
      };
      
      let associatedFileIds: string[] = [];
      if (selectedFolderId && folderFilesData) {
        associatedFileIds = findAssociatedFiles(folderFilesData);
      } else if (userFiles) {
        associatedFileIds = findAssociatedFiles(userFiles);
      }
      
      if (associatedFileIds.length > 0) {
        setSelectedFiles(associatedFileIds);
      }
      
      const tour360Images = editingData.images.filter((img: any) => img.is360Tour === true);
      if (tour360Images.length > 0) {
        const tour360Urls = new Set(tour360Images.map((img: any) => img.url));
        const findTour360Files = (files: any[]) => {
          return files
            .filter((file: any) => file.type === 'image' && tour360Urls.has(file.url))
            .map((file: any) => file.id);
        };
        
        let tour360FileIds: string[] = [];
        if (selectedFolderId && folderFilesData) {
          tour360FileIds = findTour360Files(folderFilesData);
        } else if (userFiles) {
          tour360FileIds = findTour360Files(userFiles);
        }
        
        if (tour360FileIds.length > 0) {
          setTour360FileIds(tour360FileIds);
        }
      }
      
      const regularImages = editingData.images.filter((img: any) => !img.is360Tour);
      const coverImage = regularImages.find((img: any) => img.order === 0) || regularImages[0];
      if (coverImage && userFiles) {
        const coverFile = userFiles.find((file: any) => file.type === 'image' && file.url === coverImage.url);
        if (coverFile && !tour360FileIds.includes(coverFile.id)) {
          setCoverImageFileId(coverFile.id);
        } else if (regularImages.length > 0 && userFiles) {
          const firstRegularFile = userFiles.find((file: any) => {
            const matchingImage = regularImages.find((img: any) => img.url === file.url);
            return file.type === 'image' && matchingImage && !tour360FileIds.includes(file.id);
          });
          if (firstRegularFile) {
            setCoverImageFileId(firstRegularFile.id);
          }
        }
      }
    }
  }, [isEditing, editingPropertyId, userFiles, editingData, selectedFolderId, folderFilesData]);

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
      <LocationAutocomplete
        value={formData.location}
        onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
        onSelect={(sug) => {
          const city = sug.address?.city || sug.address?.town || sug.address?.village || "";
          const country = sug.address?.country || "";
          setFormData(prev => ({
            ...prev,
            location: sug.label || prev.location,
            city,
            country,
            latitude: Number(sug.lat) || prev.latitude,
            longitude: Number(sug.lon) || prev.longitude,
          }));
        }}
        onPickLatLon={(lat, lon, resolved) => {
          const city = resolved?.address?.city || resolved?.address?.town || resolved?.address?.village || "";
          const country = resolved?.address?.country || "";
          setFormData(prev => ({
            ...prev,
            location: resolved?.label || prev.location,
            city,
            country,
            latitude: lat,
            longitude: lon,
          }));
        }}
      />
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

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [tour360FileIds, setTour360FileIds] = useState<string[]>([]);
  const [coverImageFileId, setCoverImageFileId] = useState<string | null>(null);

  const availableImages = React.useMemo(() => {
    const allFiles: any[] = [];
    const associatedFileIds = new Set<string>();
    const associatedFilesMap = new Map<string, any>();
    
    if (isEditing && editingData?.images && userFiles) {
      const imageUrls = new Set(editingData.images.map((img: any) => img.url));
      userFiles
        .filter(file => file.type === 'image' && imageUrls.has(file.url))
        .forEach(file => {
          associatedFileIds.add(file.id);
          associatedFilesMap.set(file.id, file);
        });
    }
    
    if (selectedFolderId) {
      if (folderFilesData && folderFilesData.length > 0) {
        const folderImages = folderFilesData.filter(file => file.type === 'image');
        allFiles.push(...folderImages);
      }
    } else if (userFiles) {
      allFiles.push(...userFiles.filter(file => file.type === 'image'));
    }
    
    if (isEditing && associatedFilesMap.size > 0) {
      associatedFilesMap.forEach((file, id) => {
        if (!allFiles.find(f => f.id === id)) {
          allFiles.push(file);
        }
      });
    }
    
    return allFiles.map(file => ({
      id: file.id,
      name: file.filename,
      url: file.url,
      thumbnail: file.url,
      property_id: file.property_id,
      isAssociated: associatedFileIds.has(file.id),
    }));
  }, [userFiles, selectedFolderId, folderFilesData, isEditing, editingPropertyId, editingData]);
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        if (coverImageFileId === fileId) {
          setCoverImageFileId(null);
        }
        return prev.filter(id => id !== fileId);
      }
      return [...prev, fileId];
    });
    setTour360FileIds(prev => prev.filter(id => id !== fileId));
  };
  const toggleTour360 = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTour360FileIds(prev => {
      const newTour360 = prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId];
      if (newTour360.includes(fileId) && coverImageFileId === fileId) {
        setCoverImageFileId(null);
        const regularImages = allSelectedRegularImages.filter(img => img.id !== fileId);
        if (regularImages.length > 0) {
          setCoverImageFileId(regularImages[0].id);
        }
      }
      return newTour360;
    });
  };
  const selectedImages = availableImages.filter(file => selectedFiles.includes(file.id));
  const selectedRegularImages = selectedImages.filter(file => !tour360FileIds.includes(file.id));
  
  const allSelectedRegularImages = React.useMemo(() => {
    if (!userFiles) return selectedRegularImages.filter(file => !tour360FileIds.includes(file.id));
    
    const allSelected = userFiles
      .filter(file => {
        const isSelected = selectedFiles.includes(file.id);
        const is360 = tour360FileIds.includes(file.id);
        const lower = file.filename?.toLowerCase() || '';
        const autoDetect360 = lower.includes('360') || lower.includes('tour') || 
                             lower.includes('equirectangular') || lower.includes('panorama') ||
                             lower.includes('panoramic') || lower.includes('vr') || lower.includes('virtual');
        return file.type === 'image' && isSelected && !is360 && !autoDetect360;
      })
      .map(file => ({
        id: file.id,
        name: file.filename,
        url: file.url,
        thumbnail: file.url,
        property_id: file.property_id,
        isAssociated: false,
      }));
    
    const combined = selectedRegularImages.filter(file => !tour360FileIds.includes(file.id));
    allSelected.forEach(file => {
      if (!combined.find(f => f.id === file.id)) {
        combined.push(file);
      }
    });
    
    return combined.filter(file => {
      const fileObj = userFiles?.find(f => f.id === file.id);
      if (!fileObj) return true;
      const lower = fileObj.filename?.toLowerCase() || '';
      const autoDetect360 = lower.includes('360') || lower.includes('tour') || 
                           lower.includes('equirectangular') || lower.includes('panorama') ||
                           lower.includes('panoramic') || lower.includes('vr') || lower.includes('virtual');
      return !autoDetect360 && !tour360FileIds.includes(file.id);
    });
  }, [userFiles, selectedFiles, tour360FileIds, selectedRegularImages]);
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Fotos de la propiedad <span className="text-red-500">*</span></Label>
          <Button
            variant="outline"
            size="sm"
            className="border-creme-brulee text-creme-brulee"
            onClick={() => onViewChange('files')}
          >
            <Plus className="w-3 h-3 mr-1" />
            Ir a Mis Archivos
          </Button>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Debes seleccionar al menos una imagen para la portada. Los tours 360° no pueden ser portada.
          ({allSelectedRegularImages.length} imágenes regulares, {tour360FileIds.length} tours 360°)
        </p>
        
        {foldersData && foldersData.length > 0 && (
          <div className="mb-4">
            <Label className="text-sm mb-2 block">Seleccionar carpeta (opcional)</Label>
            <Select value={selectedFolderId || "all"} onValueChange={(value) => setSelectedFolderId(value === "all" ? null : value)}>
              <SelectTrigger className="w-full bg-white border-2 border-gray-200 rounded-lg">
                <SelectValue placeholder="Todas las carpetas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las carpetas</SelectItem>
                {foldersData.map((folder: any) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      <span>{folder.name || folder.path?.split("/").pop() || "Carpeta"}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {(filesLoading || (selectedFolderId && folderFilesLoading)) ? (
          <div className="text-sm text-gray-500">Cargando imágenes...</div>
        ) : availableImages.length === 0 ? (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-sm text-gray-500 mb-2">
              {selectedFolderId ? "No hay imágenes en esta carpeta" : "No tienes imágenes disponibles"}
            </p>
            <Button variant="outline" size="sm" onClick={() => onViewChange('files')}>
              <Plus className="w-3 h-3 mr-1" />
              Subir imágenes
            </Button>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto">
            {availableImages.map((file) => {
              const isSelected = selectedFiles.includes(file.id);
              const isTour360 = tour360FileIds.includes(file.id);
              return (
                <Card key={file.id} className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`} onClick={() => toggleFileSelection(file.id)}>
                  <CardContent className="p-2">
                    <div className="relative">
                      <img src={file.thumbnail} alt={file.name} className="w-full h-20 object-cover rounded" onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E';
                      }} />
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-creme-brulee rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {isTour360 && (
                        <div className="absolute top-1 left-1 bg-purple-600 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          360°
                        </div>
                      )}
                      {file.isAssociated && (
                        <div className="absolute bottom-1 left-1 bg-green-600 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          Asociada
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <p className="text-xs font-medium truncate flex-1">{file.name}</p>
                      {isSelected && (
                        <Button
                          type="button"
                          size="sm"
                          variant={isTour360 ? "default" : "outline"}
                          className={`h-6 px-2 text-[10px] ${isTour360 ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'border-purple-300 text-purple-600 hover:bg-purple-50'}`}
                          onClick={(e) => toggleTour360(file.id, e)}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {isTour360 ? '360°' : 'Marcar 360°'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {selectedFiles.length > 0 && (
          <div className="mt-6 p-4 border-2 border-creme-brulee/30 rounded-lg bg-creme-brulee/5">
            <Label className="text-base font-semibold mb-2 block text-inkwell">
              Seleccionar imagen de portada <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-600 mb-4">
              La imagen de portada se mostrará en la tarjeta de la propiedad. Los tours 360° no pueden ser portada.
            </p>
            {allSelectedRegularImages.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ No hay imágenes regulares seleccionadas para portada
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Desmarca las imágenes como "360°" o selecciona imágenes regulares para poder elegir una portada.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allSelectedRegularImages
                  .filter(file => {
                    if (tour360FileIds.includes(file.id)) return false;
                    if (userFiles) {
                      const fileObj = userFiles.find(f => f.id === file.id);
                      if (fileObj) {
                        const lower = fileObj.filename?.toLowerCase() || '';
                        const autoDetect360 = lower.includes('360') || lower.includes('tour') || 
                                             lower.includes('equirectangular') || lower.includes('panorama') ||
                                             lower.includes('panoramic') || lower.includes('vr') || lower.includes('virtual');
                        return !autoDetect360;
                      }
                    }
                    return true;
                  })
                  .map((file) => {
                const isCover = coverImageFileId === file.id;
                return (
                  <Card 
                    key={file.id} 
                    className={`cursor-pointer transition-all ${isCover ? 'ring-2 ring-creme-brulee bg-creme-brulee/10' : 'hover:shadow-md'}`}
                    onClick={() => setCoverImageFileId(file.id)}
                  >
                    <CardContent className="p-2">
                      <div className="relative">
                        <img 
                          src={file.thumbnail} 
                          alt={file.name} 
                          className="w-full h-20 object-cover rounded" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E';
                          }} 
                        />
                        {isCover && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-creme-brulee rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {isCover && (
                          <div className="absolute bottom-1 left-1 bg-creme-brulee text-white px-1.5 py-0.5 rounded text-[10px] font-semibold">
                            Portada
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium truncate mt-2 text-center">{file.name}</p>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            )}
          </div>
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
    const validRegularImages = allSelectedRegularImages.filter(file => {
      if (tour360FileIds.includes(file.id)) return false;
      if (userFiles) {
        const fileObj = userFiles.find(f => f.id === file.id);
        if (fileObj) {
          const lower = fileObj.filename?.toLowerCase() || '';
          const autoDetect360 = lower.includes('360') || lower.includes('tour') || 
                               lower.includes('equirectangular') || lower.includes('panorama') ||
                               lower.includes('panoramic') || lower.includes('vr') || lower.includes('virtual');
          return !autoDetect360;
        }
      }
      return true;
    });
    
    if (validRegularImages.length === 0) {
      toast.error("Debes seleccionar al menos una imagen regular (no 360°) para la portada de la propiedad");
      return;
    }
    
    let finalCoverImageId = coverImageFileId;
    if (!finalCoverImageId || tour360FileIds.includes(finalCoverImageId)) {
      finalCoverImageId = validRegularImages[0].id;
      setCoverImageFileId(finalCoverImageId);
    }
    
    if (userFiles) {
      const coverFile = userFiles.find(f => f.id === finalCoverImageId);
      if (coverFile) {
        const lower = coverFile.filename?.toLowerCase() || '';
        const autoDetect360 = lower.includes('360') || lower.includes('tour') || 
                             lower.includes('equirectangular') || lower.includes('panorama') ||
                             lower.includes('panoramic') || lower.includes('vr') || lower.includes('virtual');
        if (autoDetect360 || tour360FileIds.includes(finalCoverImageId)) {
          finalCoverImageId = validRegularImages[0].id;
          setCoverImageFileId(finalCoverImageId);
        }
      }
    }
    
    const payload = {
      title: formData.title,
      description: formData.description,
      propertyType: mapPropertyType(formData.type),
      address: formData.location,
      city: formData.city || "Lima",
      country: formData.country || "Perú",
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
      mediaFileIds: selectedFiles.length > 0 ? selectedFiles : undefined,
      tour360FileIds: tour360FileIds.length > 0 ? tour360FileIds : undefined,
      coverImageFileId: finalCoverImageId,
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
            {currentStep === 3 && "Sube fotos y marca tours 360°"}
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
