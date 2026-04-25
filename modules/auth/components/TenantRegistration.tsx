"use client";

import React, { useState, useRef } from "react";
import { UserType } from "@/types/userType";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { 
  User, Phone, BookOpen, GraduationCap, DollarSign, 
  MapPin, Shield, CheckCircle2, Loader2, ArrowRight,
  Upload, Home, LogOut, LayoutDashboard, ChevronLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import useUpdateTenant from "../data/mutations/useUpdateTenant";
import axiosInstance from "@/lib/axios";
import Image from "next/image";

interface TenantRegistrationProps {
  user: UserType;
}

const CAREERS = [
  'Administración de Redes y Comunicaciones',
  'Diseño Industrial',
  'Electrónica y Automatización Industrial',
  'Gestión y Mantenimiento de Maquinaria Pesada',
  'Mantenimiento de Maquinaria de Planta',
  'Mecatrónica Industrial',
  'Tecnología de Análisis Químico',
  'Tecnologías de la Información',
];

const DEPARTMENTS = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 
  'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 
  'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
];

export const TenantRegistration = ({ user }: TenantRegistrationProps) => {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: "",
    studentCode: "",
    career: "",
    semester: "",
    budget: "",
    originRegion: "",
  });

  const [studentIDCard, setStudentIDCard] = useState<File | null>(null);
  const [studentIDCardPreview, setStudentIDCardPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useUpdateTenant();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "El nombre completo es requerido";
    if (!formData.phone || formData.phone.length !== 9) newErrors.phone = "Teléfono de 9 dígitos requerido";
    if (!formData.studentCode) newErrors.studentCode = "El código de estudiante es requerido";
    if (!formData.career) newErrors.career = "La carrera es requerida";
    if (!formData.semester) newErrors.semester = "El ciclo es requerido";
    if (!formData.budget) newErrors.budget = "El presupuesto es requerido";
    if (!studentIDCard) newErrors.studentIDCard = "La foto del carnet es requerida";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo es demasiado grande (máx 5MB)");
        return;
      }
      setStudentIDCard(file);
      const reader = new FileReader();
      reader.onloadend = () => setStudentIDCardPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadIDCard = async (): Promise<string> => {
    if (!studentIDCard) throw new Error("No hay archivo");
    
    setUploadProgress("Preparando subida...");
    const response = await axiosInstance.post("/api/storage/presign/tenant-documents", {
      studentCode: formData.studentCode,
      contentType: studentIDCard.type
    });

    const { uploadUrl, resourceUrl } = response.data;
    
    setUploadProgress("Subiendo carnet...");
    await fetch(uploadUrl, {
      method: 'PUT',
      body: studentIDCard,
      headers: { 'Content-Type': studentIDCard.type }
    });

    return resourceUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsUploading(true);
    try {
      const studentIDCardUrl = await uploadIDCard();
      
      setUploadProgress("Guardando perfil...");
      mutate({
        user: { fullName: formData.fullName },
        tenant: {
          phone: formData.phone,
          code: formData.studentCode,
          career: formData.career,
          cicle: formData.semester,
          monthly_budget: parseInt(formData.budget.split('-')[0]),
          origin_department: formData.originRegion,
          studentIDCardUrl
        }
      }, {
        onSuccess: async () => {
          await update({ registrationComplete: true });
          toast.success("¡Registro completado!");
          router.push("/dashboard");
        }
      });
    } catch (error) {
      toast.error("Error al completar el registro");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const registrationComplete = (session as any)?.registrationComplete === true;

  return (
    <div className="min-h-screen flex flex-col w-full bg-white">

      {/* Main Content */}
      <div className="flex flex-1">

      {/* Left Side - Hero (Static) */}
      <div className="hidden lg:block lg:w-2/5 relative overflow-hidden bg-slate-900 min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800 opacity-90"></div>
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-white text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white p-2 shadow-xl flex items-center justify-center overflow-hidden">
            <Image src="/logo.png" alt="Allin Wasi" width={80} height={80} className="object-contain" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Únete a nuestra comunidad</h2>
          <p className="text-lg mb-8 opacity-90">
            Miles de estudiantes ya encontraron su hogar ideal con nosotros.
          </p>
          <div className="space-y-4 text-left w-full max-w-sm mx-auto">
            {[
              { title: "Búsqueda inteligente", desc: "Encuentra el lugar perfecto con IA" },
              { title: "Seguridad verificada", desc: "Zonas seguras y propiedades verificadas" },
              { title: "Comunidad estudiantil", desc: "Conecta con otros estudiantes" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{item.title}</h3>
                  <p className="text-xs opacity-70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form (Scrollable) */}
      <div className="w-full lg:w-3/5 min-h-screen flex flex-col items-center p-8 bg-white">
        <div className="w-full max-w-2xl py-8">
          <div className="mb-8">
            <button
              onClick={() => router.push("/")}
              className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all duration-200 px-3 py-2 rounded-xl hover:bg-slate-50 mb-6 -ml-3 w-fit cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
              <span className="text-base font-semibold">Volver</span>
            </button>
             <div className="flex items-center gap-2.5 mb-6">
              <div className="flex items-center justify-center overflow-hidden">
                <Image src="/logo.png" alt="Allin Wasi" width={32} height={32} className="object-contain" />
              </div>
              <span className="text-xl font-semibold text-slate-800 tracking-tight">Allin Wasi</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Completa tu registro</h1>
            <p className="text-slate-500 font-medium">Verificación de estudiante TECSUP</p>
          </div>

          <div className="mb-8 p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-lg">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Paso Final de Seguridad</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Todos los estudiantes deben verificar su identidad con su correo institucional y su carnet físico para garantizar una comunidad segura.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                  <Input 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className={`pl-12 !h-14 bg-slate-50 border-slate-200 rounded-2xl focus:ring-emerald-600 transition-all text-slate-900 ${errors.fullName ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.fullName && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                  <Input 
                    placeholder="987654321"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`pl-12 !h-14 bg-slate-50 border-slate-200 rounded-2xl focus:ring-emerald-600 transition-all text-slate-900 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Código de estudiante</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                  <Input 
                    placeholder="C20240123"
                    value={formData.studentCode}
                    onChange={(e) => setFormData({...formData, studentCode: e.target.value})}
                    className={`pl-12 !h-14 bg-slate-50 border-slate-200 rounded-2xl focus:ring-emerald-600 transition-all text-slate-900 ${errors.studentCode ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.studentCode && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.studentCode}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Carrera</Label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10 pointer-events-none" />
                  <Select onValueChange={(val) => setFormData({...formData, career: val})}>
                    <SelectTrigger className={`pl-12 !h-14 flex items-center bg-slate-50 border-slate-200 rounded-2xl focus:ring-emerald-600 transition-all text-slate-900 ${errors.career ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAREERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Ciclo</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10 pointer-events-none" />
                  <Select onValueChange={(val) => setFormData({...formData, semester: val})}>
                    <SelectTrigger className={`pl-12 !h-14 flex items-center bg-slate-50 border-slate-200 rounded-2xl focus:ring-emerald-600 transition-all text-slate-900 ${errors.semester ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6].map(i => <SelectItem key={i} value={String(i)}>{i}° Ciclo</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Presupuesto (S/)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10 pointer-events-none" />
                  <Select onValueChange={(val) => setFormData({...formData, budget: val})}>
                    <SelectTrigger className={`pl-12 !h-14 flex items-center bg-slate-50 border-slate-200 rounded-2xl focus:ring-emerald-600 transition-all text-slate-900 ${errors.budget ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Presupuesto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300-500">S/ 300 - S/ 500</SelectItem>
                      <SelectItem value="500-700">S/ 500 - S/ 700</SelectItem>
                      <SelectItem value="700-1000">S/ 700 - S/ 1,000</SelectItem>
                      <SelectItem value="1000+">S/ 1,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Región de origen</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10 pointer-events-none" />
                  <Select onValueChange={(val) => setFormData({...formData, originRegion: val})}>
                    <SelectTrigger className="pl-12 !h-14 flex items-center bg-slate-50 border-slate-200 rounded-2xl focus:ring-emerald-600 transition-all text-slate-900">
                      <SelectValue placeholder="Selecciona tu región" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Student ID Card Upload */}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                Carnet de estudiante TECSUP <span className="text-red-500">*</span>
              </Label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center text-center
                  ${studentIDCard ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-emerald-600 bg-slate-50'}
                  ${errors.studentIDCard ? 'border-red-500 bg-red-50' : ''}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
                
                {studentIDCardPreview ? (
                  <div className="space-y-4">
                    <img src={studentIDCardPreview} alt="Preview" className="w-32 h-20 object-cover rounded-lg shadow-md mx-auto" />
                    <p className="text-sm font-bold text-slate-900">{studentIDCard?.name}</p>
                    <p className="text-xs text-slate-500">Haz clic para cambiar la imagen</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-1">Sube una foto clara de tu carnet</p>
                    <p className="text-xs text-slate-500">PNG, JPG hasta 5MB</p>
                  </>
                )}
              </div>
              {errors.studentIDCard && <p className="text-[10px] text-red-500 font-bold uppercase text-center">{errors.studentIDCard}</p>}
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-center gap-3 py-2">
              <input 
                type="checkbox" 
                id="terms" 
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                required
              />
              <label htmlFor="terms" className="text-sm text-slate-600 font-medium cursor-pointer">
                Acepto los términos y condiciones y la política de privacidad
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl transition-all disabled:opacity-50 cursor-pointer"
              disabled={isPending || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {uploadProgress}
                </>
              ) : isPending ? (
                "Guardando..."
              ) : (
                <>
                  Completar mi cuenta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Información cifrada y segura
            </p>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};
