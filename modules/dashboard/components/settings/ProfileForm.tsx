"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import useMe from "@/modules/auth/data/queries/useMe";
import useUpdateLandlord from "@/modules/auth/data/mutations/useUpdateLandlord";
import useUpdateUser from "@/modules/auth/data/mutations/useUpdateUser";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
    const image = new Image();
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
  if (image.width > MAX_UPLOAD_DIMENSION || image.height > MAX_UPLOAD_DIMENSION) {
  }
  const { width, height } = getScaledDimensions(image.width, image.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo procesar la imagen seleccionada.");
  }
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let quality = 0.9;
  let result = canvas.toDataURL("image/jpeg", quality);
  while (calculateBase64Size(result) > MAX_COMPRESSED_SIZE && quality > 0.5) {
    quality -= 0.05;
    result = canvas.toDataURL("image/jpeg", quality);
  }
  if (calculateBase64Size(result) > MAX_COMPRESSED_SIZE) {
    throw new Error("La imagen supera 500KB incluso tras compresión. Elige una más pequeña.");
  }
  return result;
}

export function ProfileForm() {
  const { data, isLoading } = useMe();
  const queryClient = useQueryClient();
  const userId = (data as any)?.user?.id ?? (data as any)?.id ?? "";
  const { mutateAsync: updateUser, isPending: savingUser } = useUpdateUser();
  const { mutateAsync: updateLandlord, isPending: savingLandlord } = useUpdateLandlord(userId);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [dni, setDni] = React.useState("");
  const [preview, setPreview] = React.useState<string | undefined>(undefined);
  const [file, setFile] = React.useState<File | null>(null);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const initialRef = React.useRef<{ fullName: string; phone: string; address: string; dni: string; preview?: string }>({
    fullName: "",
    phone: "",
    address: "",
    dni: "",
    preview: undefined,
  });

  React.useEffect(() => {
    if (!isLoading && data) {
      const u: any = (data as any)?.user ?? data;
      const name = u?.fullName ?? u?.name ?? "";
      const mail = u?.email ?? "";
      const pic = toDataUrl(u?.profilePicture ?? u?.image ?? undefined);
      const phoneVal = (data as any)?.landlord?.phone
        ?? (data as any)?.tenant?.phone
        ?? u?.phone
        ?? (data as any)?.phone
        ?? "";
      setFullName(name);
      setEmail(mail);
      setPhone(phoneVal);
      setPreview(pic);
      setAddress((data as any)?.landlord?.address ?? "");
      setDni((data as any)?.landlord?.dni ?? "");
      // Guardar snapshot inicial para detectar cambios
      initialRef.current = {
        fullName: name || "",
        phone: phoneVal || "",
        address: (data as any)?.landlord?.address ?? "",
        dni: (data as any)?.landlord?.dni ?? "",
        preview: pic,
      };
    }
  }, [isLoading, data]);

  const onSelectFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    setImageError(null);
    const input = e.target;
    const f = input.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setImageError("Solo se permiten archivos de imagen.");
      input.value = "";
      return;
    }
    if (f.size > MAX_UPLOAD_SIZE) {
      setImageError("La imagen debe ser de 1MB o menor.");
      input.value = "";
      return;
    }
    try {
      const compressedDataUrl = await prepareImageDataUrl(f);
      setFile(f);
      setPreview(compressedDataUrl);
    } catch (error: any) {
      setImageError(error?.message || "No se pudo procesar la imagen seleccionada.");
      setFile(null);
      setPreview(undefined);
    }
  };

  const onSave = async () => {
    try {
      const profilePictureBase64 = preview ? extractBase64(preview) : undefined;
      // 1) Actualiza usuario (nombre/foto)
      await updateUser({
        fullName: fullName || undefined,
        profilePicture: profilePictureBase64 || undefined,
      });
      // 2) Actualiza landlord
      await updateLandlord({
        landlord: {
          phone: phone || undefined,
          address: address || undefined,
          dni: dni || undefined,
        },
      });
      // Invalida el perfil para que recargue al volver a la vista
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await queryClient.refetchQueries({ queryKey: ["me"] });
      toast.success("Perfil actualizado correctamente");
    } catch (err) {
      toast.error("No se pudo actualizar el perfil");
    }
  };

  const isDirty =
    fullName !== initialRef.current.fullName ||
    phone !== initialRef.current.phone ||
    address !== initialRef.current.address ||
    dni !== initialRef.current.dni ||
    (preview || "") !== (initialRef.current.preview || "");

  return (
    <Card className="border-au-lait">
      <CardHeader>
        <CardTitle className="text-inkwell">Perfil de Usuario</CardTitle>
        <p className="text-sm text-lunar-eclipse">Actualiza tu información personal</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-au-lait flex items-center justify-center">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lunar-eclipse text-sm">Sin foto</span>
            )}
          </div>
          <div>
            <Label htmlFor="avatar" className="mb-2 block">Foto de perfil</Label>
            <Input id="avatar" type="file" accept="image/*" onChange={onSelectFile} className="bg-white border-2 border-gray-200" />
            {imageError && <p className="text-red-500 text-xs mt-1">{imageError}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="name">Nombre completo</Label>
          <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre" className="mt-2 bg-white border-2 border-gray-200" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled className="mt-2 bg-white border-2 border-gray-200 opacity-80" />
        </div>
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Tu teléfono" className="mt-2 bg-white border-2 border-gray-200" />
        </div>
        <div>
          <Label htmlFor="address">Dirección</Label>
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Tu dirección" className="mt-2 bg-white border-2 border-gray-200" />
        </div>
        <div>
          <Label htmlFor="dni">DNI</Label>
          <Input id="dni" value={dni} onChange={(e) => setDni(e.target.value)} placeholder="Tu DNI" className="mt-2 bg-white border-2 border-gray-200" />
        </div>

        <Button
          className={`${isDirty ? "bg-creme-brulee text-white" : "bg-au-lait text-lunar-eclipse cursor-not-allowed"} `}
          onClick={onSave}
          disabled={!isDirty || savingUser || savingLandlord}
        >
          {savingUser || savingLandlord ? "Guardando..." : "Guardar cambios"}
        </Button>
      </CardContent>
    </Card>
  );
}
