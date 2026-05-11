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

const MAX_UPLOAD_DIMENSION = 500;
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
    image.onerror = () => reject(new Error("Archivo de imagen inválido."));
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

function getScaledDimensions(width: number, height: number): { width: number; height: number } {
  const largestSide = Math.max(width, height);
  if (largestSide <= MAX_UPLOAD_DIMENSION) {
    return { width, height };
  }
  const scale = MAX_UPLOAD_DIMENSION / largestSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

async function prepareImageDataUrl(file: File): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const { width, height } = getScaledDimensions(image.width, image.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo procesar la imagen seleccionada.");
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let quality = 0.9;
  let result = canvas.toDataURL("image/jpeg", quality);
  while (calculateBase64Size(result) > MAX_COMPRESSED_SIZE && quality > 0.5) {
    quality -= 0.05;
    result = canvas.toDataURL("image/jpeg", quality);
  }
  return result;
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
  const [imageError, setImageError] = React.useState<string | null>(null);

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
      const compressedDataUrl = await prepareImageDataUrl(f);
      setNewImagePreview(compressedDataUrl);
    } catch (error: any) {
      toast.error(error?.message || "Error al procesar imagen");
    }
  };

  const onSave = async () => {
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
            <Input
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              placeholder="Ej. Diseño y Desarrollo de Software"
              className="h-11 rounded-xl bg-white border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500">Ciclo actual</Label>
            <Input
              value={cicle}
              onChange={(e) => setCicle(e.target.value)}
              placeholder="Ej. 5to Ciclo"
              className="h-11 rounded-xl bg-white border-slate-200"
            />
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
          <Label className="text-xs font-bold text-slate-500">Sobre mí</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Cuéntale a los arrendadores un poco sobre ti..."
            className="min-h-[100px] rounded-xl bg-white border-slate-200 resize-none"
          />
        </div>

        <Button
          onClick={onSave}
          disabled={saving}
          className="w-full sm:w-auto px-8 h-11 bg-creme-brulee hover:bg-creme-brulee/90 text-white font-bold rounded-xl shadow-lg shadow-creme-brulee/20 gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </CardContent>
    </Card>
  );
}
