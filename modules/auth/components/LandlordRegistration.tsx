"use client";
import { useState, useRef, type FormEvent, useEffect } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import {
  Mail, User, Phone, Home, CreditCard, MapPin, Building,
  Shield, AlertTriangle, Upload, X, FileText,
  CheckCircle2, Loader2, ArrowRight, LogOut, LayoutDashboard, ChevronLeft
} from 'lucide-react';

import { Landlord } from '@/types/userType';
import Link from 'next/link';
import useUpdateLandlord from '../data/mutations/useUpdateLandlord';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import Image from 'next/image';

interface LandlordRegistrationProps {
  user: Landlord;
}

interface DocumentUrls {
  dniFront: string | null;
  dniBack: string | null;
  utilityBill: string | null;
}

interface PresignResponse {
  dniFront: { uploadUrl: string; resourceUrl: string; key: string };
  dniBack: { uploadUrl: string; resourceUrl: string; key: string };
  utilityBill: { uploadUrl: string; resourceUrl: string; key: string };
  expiresIn: number;
}

export const LandlordRegistration = ({ user }: LandlordRegistrationProps) => {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [dni, setDni] = useState(user?.dni ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [propertyCount, setPropertyCount] = useState(String(user?.propertyCount ?? ''));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Document states
  const [dniFrontFile, setDniFrontFile] = useState<File | null>(null);
  const [dniBackFile, setDniBackFile] = useState<File | null>(null);
  const [utilityBillFile, setUtilityBillFile] = useState<File | null>(null);
  const [dniFrontPreview, setDniFrontPreview] = useState<string | null>(null);
  const [dniBackPreview, setDniBackPreview] = useState<string | null>(null);
  const [utilityBillPreview, setUtilityBillPreview] = useState<string | null>(null);

  // Checkbox states
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [declarationOfTruth, setDeclarationOfTruth] = useState(false);

  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Refs for file inputs
  const dniFrontRef = useRef<HTMLInputElement>(null);
  const dniBackRef = useRef<HTMLInputElement>(null);
  const utilityBillRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { data: session, update } = useSession();
  const authUserId = (session as any)?.user?.id ?? user?.id;
  const { mutate, isPending } = useUpdateLandlord(authUserId as string);

  const [selectedPlan, setSelectedPlan] = useState<string>('basic');

  useEffect(() => {
    const plan = sessionStorage.getItem('selectedPlan');
    if (plan) {
      setSelectedPlan(plan);
    }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName) newErrors.fullName = 'El nombre completo es requerido';
    if (!phone || phone.length !== 9) newErrors.phone = 'Teléfono de 9 dígitos requerido';
    if (!dni || dni.length !== 8) newErrors.dni = 'DNI de 8 dígitos requerido';
    if (!address) newErrors.address = 'La dirección es requerida';
    if (!dniFrontFile) newErrors.dniFront = 'DNI (frontal) requerido';
    if (!dniBackFile) newErrors.dniBack = 'DNI (trasero) requerido';
    if (!utilityBillFile) newErrors.utilityBill = 'Recibo de servicios requerido';
    if (!acceptTerms) newErrors.terms = 'Debes aceptar los términos';
    if (!declarationOfTruth) newErrors.declaration = 'Debes aceptar la declaración';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Formato no válido. Usa JPG, PNG o PDF.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Archivo demasiado grande (máx 5MB)');
        return;
      }

      setFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview('pdf');
      }
    }
  };

  const uploadDocuments = async (): Promise<DocumentUrls> => {
    setUploadProgress('Obteniendo URLs...');
    const response = await axiosInstance.post<PresignResponse>(
      '/api/storage/presign/landlord-documents',
      {
        dni: dni,
        dniFrontContentType: dniFrontFile!.type,
        dniBackContentType: dniBackFile!.type,
        utilityBillContentType: utilityBillFile!.type,
      }
    );

    const { dniFront, dniBack, utilityBill } = response.data;

    setUploadProgress('Subiendo documentos...');
    await Promise.all([
      fetch(dniFront.uploadUrl, { method: 'PUT', body: dniFrontFile, headers: { 'Content-Type': dniFrontFile!.type } }),
      fetch(dniBack.uploadUrl, { method: 'PUT', body: dniBackFile, headers: { 'Content-Type': dniBackFile!.type } }),
      fetch(utilityBill.uploadUrl, { method: 'PUT', body: utilityBillFile, headers: { 'Content-Type': utilityBillFile!.type } }),
    ]);

    return {
      dniFront: dniFront.resourceUrl,
      dniBack: dniBack.resourceUrl,
      utilityBill: utilityBill.resourceUrl,
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsUploading(true);
    try {
      const documentUrls = await uploadDocuments();
      setUploadProgress('Guardando datos...');

      mutate(
        { 
          user: { fullName: fullName.trim() }, 
          landlord: {
            phone: phone.trim(),
            dni: dni.trim(),
            address: address.trim(),
            propertiesCount: propertyCount,
            dniFrontUrl: documentUrls.dniFront!,
            dniBackUrl: documentUrls.dniBack!,
            utilityBillUrl: documentUrls.utilityBill!,
          } 
        },
        {
          onSuccess: async () => {
            await update({ registrationComplete: true });
            toast.success('¡Registro completado!');
            router.push('/dashboard');
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al guardar');
          },
        }
      );
    } catch (error: any) {
      toast.error('Error al subir documentos');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const FileUploadZone = ({ label, file, preview, inputRef, errorKey, onFileChange, onRemove }: any) => (
    <div className="space-y-2">
      <Label className="text-xs font-bold uppercase text-slate-500">{label}</Label>
      <div
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[120px]
          ${file ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-emerald-600 bg-slate-50'}
          ${errors[errorKey] ? 'border-red-500 bg-red-50' : ''}`}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" className="hidden" onChange={onFileChange} />
        {!file ? (
          <div className="text-center">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-900">Seleccionar archivo</p>
            <p className="text-[10px] text-slate-500 mt-1">JPG, PNG o PDF (Máx. 5MB)</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full">
            {preview === 'pdf' ? <FileText className="w-8 h-8 text-red-500" /> : 
             <img src={preview} className="w-10 h-10 object-cover rounded shadow" />}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
              <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <X className="w-4 h-4 text-slate-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); onRemove(); }} />
          </div>
        )}
      </div>
      {errors[errorKey] && <p className="text-[10px] text-red-500 font-bold uppercase">{errors[errorKey]}</p>}
    </div>
  );

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
          <h2 className="text-4xl font-bold mb-4">Verificación de Perfil</h2>
          <p className="text-lg mb-8 opacity-90">
            Completa tu verificación para comenzar a publicar propiedades y conectar con estudiantes.
          </p>
          <div className="space-y-4 text-left w-full max-w-sm mx-auto">
            {[
              { n: 1, t: "Datos Personales", d: "Información básica de tu perfil" },
              { n: 2, t: "Documentos", d: "DNI y recibo de servicios" },
              { n: 3, t: "Activación", d: "Plan seleccionado y acceso total" }
            ].map((item) => (
              <div key={item.n} className="flex items-start gap-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  {item.n}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{item.t}</h3>
                  <p className="text-xs opacity-70">{item.d}</p>
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
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Verificación de Arrendador</h1>
            <p className="text-slate-500 font-medium">Completa tus datos para activar tu plan.</p>
            
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
              <span className="text-xs font-black text-emerald-700 uppercase">
                {selectedPlan === 'featured' ? '⭐ Plan Destacado - S/ 20.00' : 'Plan Básico - S/ 10.00'}
              </span>
            </div>
          </div>

          <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">Seguridad de la Comunidad</h3>
                <p className="text-xs text-amber-800 mt-1">
                  Tu documentación será revisada manualmente. El fraude o suplantación de identidad resultará en la inhabilitación permanente de la cuenta.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b pb-2">1. Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Nombre completo</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="!h-14 bg-slate-50 rounded-2xl focus:ring-emerald-600 transition-all text-slate-900" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Email Registrado</Label>
                  <Input value={email} readOnly className="!h-14 bg-slate-100 text-slate-400 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Teléfono</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="!h-14 bg-slate-50 rounded-2xl focus:ring-emerald-600 transition-all text-slate-900" placeholder="987654321" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">DNI</Label>
                  <Input value={dni} onChange={(e) => setDni(e.target.value)} maxLength={8} className="!h-14 bg-slate-50 rounded-2xl focus:ring-emerald-600 transition-all text-slate-900" placeholder="12345678" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Dirección del domicilio</Label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} className="!h-14 bg-slate-50 rounded-2xl focus:ring-emerald-600 transition-all text-slate-900" placeholder="Av. Cascanueces 2221, Santa Anita" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b pb-2">2. Documentación Requerida</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUploadZone label="DNI (Frontal)" file={dniFrontFile} preview={dniFrontPreview} inputRef={dniFrontRef} errorKey="dniFront" 
                  onFileChange={(e:any) => handleFileChange(e, setDniFrontFile, setDniFrontPreview)} onRemove={() => { setDniFrontFile(null); setDniFrontPreview(null); }} />
                <FileUploadZone label="DNI (Trasero)" file={dniBackFile} preview={dniBackPreview} inputRef={dniBackRef} errorKey="dniBack" 
                  onFileChange={(e:any) => handleFileChange(e, setDniBackFile, setDniBackPreview)} onRemove={() => { setDniBackFile(null); setDniBackPreview(null); }} />
              </div>
              <FileUploadZone label="Recibo de Servicios (Luz/Agua)" file={utilityBillFile} preview={utilityBillPreview} inputRef={utilityBillRef} errorKey="utilityBill" 
                onFileChange={(e:any) => handleFileChange(e, setUtilityBillFile, setUtilityBillPreview)} onRemove={() => { setUtilityBillFile(null); setUtilityBillPreview(null); }} />
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <input type="checkbox" checked={declarationOfTruth} onChange={(e) => setDeclarationOfTruth(e.target.checked)} className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <label className="text-xs text-slate-600 font-medium leading-relaxed">
                  Declaro bajo juramento que la información y documentos proporcionados son verdaderos. Entiendo que la falsedad resultará en la suspensión definitiva de mi cuenta.
                </label>
              </div>
              
              <div className="flex items-start gap-3 px-4">
                <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <label className="text-xs text-slate-500">Acepto los términos de servicio y política de privacidad.</label>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl transition-all disabled:opacity-50 cursor-pointer" disabled={isPending || isUploading}>
              {isUploading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />{uploadProgress}</> : 
               isPending ? "Guardando..." : <><Shield className="w-5 h-5 mr-2" />Completar Registro<ArrowRight className="w-5 h-5 ml-2" /></>}
            </Button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};
