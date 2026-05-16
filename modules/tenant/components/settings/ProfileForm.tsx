"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Camera, Save, User, MapPin, Phone, GraduationCap, Info } from "lucide-react";
import useMe from "@/modules/auth/data/queries/useMe";
import useUpdateTenant from "@/modules/auth/data/mutations/useUpdateTenant";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Badge } from "@/ui/badge";
import { CAREERS, STUDENT_CYCLES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

import { motion, useMotionValue } from "framer-motion";
import Cropper, { Area } from "react-easy-crop";

const MAX_UPLOAD_DIMENSION = 1000; // Increased for better quality edit
const MAX_COMPRESSED_SIZE = 500 * 1024;
const MAX_UPLOAD_SIZE = 1 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo seleccionado."));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = typeof window !== 'undefined' ? new window.Image() : ({} as HTMLImageElement);
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Archivo de image inválido."));
    image.src = dataUrl;
  });
}

function extractBase64(dataUrl: string): string {
  const parts = dataUrl.split(",");
  return parts.length > 1 ? parts[1] : dataUrl;
}

function calculateBase64Size(dataUrl: string): number {
  const base64 = extractBase64(dataUrl);
  return Math.ceil((base64.length * 3) / 4);
}

function toDataUrl(value?: string): string | undefined {
  if (!value) return undefined;
  return value.startsWith("data:") ? value : `data:image/jpeg;base64,${value}`;
}

export function ProfileForm() {
  const { data, isLoading } = useMe();
  const { update: updateSession } = useSession();
  const queryClient = useQueryClient();
  const { mutateAsync: updateTenant, isPending: saving } = useUpdateTenant();

  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [career, setCareer] = React.useState("");
  const [cicle, setCicle] = React.useState("");
  const [code, setCode] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [newImagePreview, setNewImagePreview] = React.useState<string | undefined>(undefined);
  const [isEditingImage, setIsEditingImage] = React.useState(false);
  const [tempImage, setTempImage] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);
  
  const constraintsRef = React.useRef(null);
  const imageRef = React.useRef<HTMLImageElement>(null);

  const u = (data as any)?.user ?? data;
  const t = (data as any)?.tenant;

  React.useEffect(() => {
    if (!isLoading && data) {
      setFullName(u?.fullName ?? u?.name ?? "");
      setPhone(t?.phone ?? u?.phone ?? "");
      setCareer(t?.career ?? "");
      setCicle(t?.cicle ?? "");
      setCode(t?.code ?? "");
      setBio(t?.bio ?? "");
    }
  }, [isLoading, data, u, t]);

  const onSelectFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const dataUrl = await readFileAsDataUrl(f);
      setTempImage(dataUrl);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setIsEditingImage(true);
      // Reset input
      e.target.value = "";
    } catch (error: any) {
      toast.error(error?.message || "Error al procesar imagen");
    }
  };

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleApplyCrop = async () => {
    if (!tempImage || !croppedAreaPixels) return;

    try {
      const image = await loadImage(tempImage);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const size = 400;
      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        size,
        size
      );

      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setNewImagePreview(croppedDataUrl);
      setIsEditingImage(false);
      setTempImage(null);
    } catch (e) {
      console.error(e);
      toast.error("Error al recortar la imagen");
    }
  };

  const onSave = async () => {
    // ...
    try {
      const profilePictureBase64 = newImagePreview ? extractBase64(newImagePreview) : undefined;

      await updateTenant({
        user: {
          fullName: fullName || undefined,
          profilePicture: profilePictureBase64 || undefined,
        },
        tenant: {
          phone: phone || undefined,
          career: career || undefined,
          cicle: cicle || undefined,
          code: code || undefined,
          bio: bio || undefined,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await updateSession({
        name: fullName || undefined,
        image: newImagePreview || toDataUrl(u?.profilePicture) || undefined,
      });

      toast.success("Perfil actualizado correctamente");
      setNewImagePreview(undefined);
    } catch (err) {
      // toast.error is handled by the hook
    }
  };

  return (
    <Card className="border-au-lait shadow-sm rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-inkwell flex items-center gap-2">
          <User className="w-5 h-5 text-creme-brulee" />
          Perfil de Estudiante
        </CardTitle>
        <CardDescription>Actualiza tu información pública y preferencias.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="w-20 h-20 border-2 border-white shadow-md">
              <AvatarImage src={newImagePreview || toDataUrl(u?.profilePicture)} />
              <AvatarFallback className="bg-creme-brulee text-white text-xl font-bold">
                {fullName?.[0] ?? "U"}
              </AvatarFallback>
            </Avatar>
            <Label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-all">
              <Camera className="w-3.5 h-3.5" />
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={onSelectFile} />
            </Label>
          </div>
          <div>
            <h3 className="font-bold text-inkwell">{fullName || "Estudiante"}</h3>
            <p className="text-sm text-slate-500">{(data as any)?.user?.email}</p>
            <Badge variant="secondary" className="mt-2 bg-emerald-50 text-emerald-700 border-emerald-100 font-bold text-[10px]">
              Perfil Estudiantil
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500">Nombre completo</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11 rounded-xl bg-white border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500">Teléfono</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. +51 987 654 321"
              className="h-11 rounded-xl bg-white border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500">Carrera Universitaria</Label>
            <Select value={career} onValueChange={setCareer}>
              <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200">
                <SelectValue placeholder="Selecciona tu carrera" />
              </SelectTrigger>
              <SelectContent>
                {CAREERS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500">Ciclo actual</Label>
            <Select value={cicle} onValueChange={setCicle}>
              <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200">
                <SelectValue placeholder="Selecciona tu ciclo" />
              </SelectTrigger>
              <SelectContent>
                {STUDENT_CYCLES.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}° Ciclo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500">Código de Estudiante</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej. 123456"
              className="h-11 rounded-xl bg-white border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500">Correo (No editable)</Label>
            <Input
              value={u?.email ?? ""}
              disabled
              className="h-11 rounded-xl bg-slate-50 border-slate-200 opacity-70"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-bold text-slate-500">Sobre mí</Label>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {bio.length}/200
            </span>
          </div>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Cuéntale a los arrendadores un poco sobre ti..."
            maxLength={200}
            className="min-h-[100px] rounded-xl bg-white border-slate-200 resize-none"
          />
        </div>

        <Button
          onClick={onSave}
          disabled={saving}
          className="w-full sm:w-auto px-8 h-11 bg-creme-brulee hover:bg-creme-brulee/90 text-white font-bold rounded-xl shadow-lg shadow-creme-brulee/20 gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </CardContent>

      <Dialog open={isEditingImage} onOpenChange={setIsEditingImage}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Ajustar Foto de Perfil</DialogTitle>
            <DialogDescription>
              Arrastra la imagen para posicionarla y usa el control para el tamaño.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-6 py-4">
            <div className="relative w-full h-64 bg-slate-900 rounded-2xl overflow-hidden shadow-inner">
              {tempImage && (
                <Cropper
                  image={tempImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={true}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>

            <div className="w-full space-y-4 px-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500 min-w-10">Zoom</span>
                <input 
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <span className="text-[10px] font-bold text-slate-400 w-8">{Math.round(zoom * 100)}%</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setIsEditingImage(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleApplyCrop} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8">
              Aplicar y Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
