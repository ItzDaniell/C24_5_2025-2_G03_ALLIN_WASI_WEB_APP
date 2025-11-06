"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import useMe from "@/modules/auth/data/queries/useMe";
import useUpdateLandlord from "@/modules/auth/data/mutations/useUpdateLandlord";
import { toast } from "sonner";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProfileForm() {
  const { data, isLoading } = useMe();
  const userId = (data as any)?.user?.id ?? (data as any)?.id ?? "";
  const { mutate, isPending } = useUpdateLandlord(userId);

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [preview, setPreview] = React.useState<string | undefined>(undefined);
  const [file, setFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (!isLoading && data) {
      const u: any = (data as any)?.user ?? data;
      const name = u?.fullName ?? u?.name ?? "";
      const mail = u?.email ?? "";
      const pic = u?.profilePicture ?? u?.image ?? undefined;
      const phoneVal = (data as any)?.landlord?.phone
        ?? (data as any)?.tenant?.phone
        ?? u?.phone
        ?? (data as any)?.phone
        ?? "";
      setFullName(name);
      setEmail(mail);
      setPhone(phoneVal);
      setPreview(pic);
    }
  }, [isLoading, data]);

  const onSelectFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const base64 = await fileToBase64(f);
    setPreview(base64);
  };

  const onSave = async () => {
    try {
      const profilePicture = file ? await fileToBase64(file) : preview;
      mutate(
        { fullName: fullName || undefined, profilePicture: profilePicture || undefined, phone: phone || undefined },
        {
          onSuccess: () => toast.success("Perfil actualizado"),
          onError: () => toast.error("No se pudo actualizar el perfil"),
        }
      );
    } catch (err) {
      toast.error("Error al procesar la imagen");
    }
  };

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

        <Button className="bg-creme-brulee text-white" onClick={onSave} disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </CardContent>
    </Card>
  );
}
