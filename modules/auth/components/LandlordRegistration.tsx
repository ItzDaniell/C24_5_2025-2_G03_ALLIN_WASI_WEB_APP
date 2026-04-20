"use client";
import { useState, useRef, type FormEvent, useEffect } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import {
  Mail, User, Phone, Home, CreditCard, MapPin, Building,
  Shield, AlertTriangle, Upload, X, FileText, Image as ImageIcon,
  CheckCircle2, Loader2
} from 'lucide-react';

import { Landlord } from '@/types/userType';
import Link from 'next/link';
import useUpdateLandlord from '../data/mutations/useUpdateLandlord';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

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
  const [fullName, setFullName] = useState(user?.fullName);
  const [email, setEmail] = useState(user?.email);
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

  // Get selected plan from sessionStorage
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
    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    if (!phone) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{9}$/.test(phone)) {
      newErrors.phone = 'El teléfono debe tener 9 dígitos';
    }
    if (!dni) {
      newErrors.dni = 'El DNI es requerido';
    } else if (!/^\d{8}$/.test(dni)) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    }
    if (!address) newErrors.address = 'La dirección es requerida';

    // Validate documents
    if (!dniFrontFile) newErrors.dniFront = 'La foto del DNI (cara frontal) es requerida';
    if (!dniBackFile) newErrors.dniBack = 'La foto del DNI (cara trasera) es requerida';
    if (!utilityBillFile) newErrors.utilityBill = 'El recibo de servicios es requerido';

    // Validate checkboxes
    if (!acceptTerms) newErrors.terms = 'Debes aceptar los términos y condiciones';
    if (!declarationOfTruth) newErrors.declaration = 'Debes aceptar la declaración jurada';

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
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Formato no válido. Usa JPG, PNG o PDF.');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo es muy grande. Máximo 5MB.');
        return;
      }

      setFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview('pdf');
      }
    }
  };

  const removeFile = (
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const uploadDocuments = async (): Promise<DocumentUrls> => {
    if (!dniFrontFile || !dniBackFile || !utilityBillFile) {
      throw new Error('Faltan documentos por subir');
    }

    setUploadProgress('Obteniendo URLs de subida...');

    // Get presigned URLs
    const presignResponse = await axiosInstance.post<PresignResponse>(
      '/api/storage/presign/landlord-documents',
      {
        dni: dni,
        dniFrontContentType: dniFrontFile.type,
        dniBackContentType: dniBackFile.type,
        utilityBillContentType: utilityBillFile.type,
      }
    );

    const { dniFront, dniBack, utilityBill } = presignResponse.data;

    // Upload DNI Front
    setUploadProgress('Subiendo DNI (cara frontal)...');
    await fetch(dniFront.uploadUrl, {
      method: 'PUT',
      body: dniFrontFile,
      headers: {
        'Content-Type': dniFrontFile.type,
      },
    });

    // Upload DNI Back
    setUploadProgress('Subiendo DNI (cara trasera)...');
    await fetch(dniBack.uploadUrl, {
      method: 'PUT',
      body: dniBackFile,
      headers: {
        'Content-Type': dniBackFile.type,
      },
    });

    // Upload Utility Bill
    setUploadProgress('Subiendo recibo de servicios...');
    await fetch(utilityBill.uploadUrl, {
      method: 'PUT',
      body: utilityBillFile,
      headers: {
        'Content-Type': utilityBillFile.type,
      },
    });

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
      // Upload documents first
      const documentUrls = await uploadDocuments();

      setUploadProgress('Guardando datos...');

      const userData = { fullName: fullName?.trim() || '' };
      const landlordData: any = {
        phone: phone.trim(),
        dni: dni.trim(),
        address: address.trim(),
        dniFrontUrl: documentUrls.dniFront,
        dniBackUrl: documentUrls.dniBack,
        utilityBillUrl: documentUrls.utilityBill,
      };

      if (propertyCount && propertyCount.trim() !== '') {
        landlordData.propertiesCount = propertyCount.trim();
      }

      mutate(
        { user: userData, landlord: landlordData },
        {
          onSuccess: async () => {
            try {
              await update({ registrationComplete: true } as any);
              toast.success('¡Registro completado! Redirigiendo al dashboard...');
            } catch (error) {
              console.error('Error updating session:', error);
            }
            // TODO: Redirect to payment gateway
            router.push('/dashboard');
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al guardar los datos');
          },
        }
      );
    } catch (error: any) {
      console.error('Error uploading documents:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      const errorMessage = error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || 'Error al subir los documentos';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const FileUploadZone = ({
    label,
    helpText,
    file,
    preview,
    inputRef,
    errorKey,
    onFileChange,
    onRemove,
  }: {
    label: string;
    helpText: string;
    file: File | null;
    preview: string | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
    errorKey: string;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer hover:border-[#A37F6E] ${errors[errorKey] ? 'border-red-400 bg-red-50' : 'border-gray-300'
          } ${file ? 'border-green-400 bg-green-50' : ''}`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,application/pdf"
          className="hidden"
          onChange={onFileChange}
        />

        {!file ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 text-center">
              Haz clic para seleccionar o arrastra el archivo
            </p>
            <p className="text-xs text-gray-400 mt-1">{helpText}</p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {preview === 'pdf' ? (
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-8 h-8 text-red-500" />
              </div>
            ) : preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : null}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 hover:bg-gray-200 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
        )}
      </div>
      {errors[errorKey] && <p className="text-xs text-red-500">{errors[errorKey]}</p>}
    </div>
  );

  return (
    <div className="h-screen flex w-full overflow-hidden">
      {/* Left Panel - Hero (Static) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-12 overflow-hidden h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <div className="relative z-10 text-white max-w-lg mx-auto">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-4xl font-semibold mb-6 text-center">Verificación de Perfil</h2>
          <p className="text-lg mb-12 opacity-90 text-center leading-relaxed">
            Completa tu verificación para comenzar a publicar propiedades y conectar con estudiantes de TECSUP.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Datos Personales</h3>
                <p className="text-sm opacity-80">Información básica de tu perfil</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Documentos de Respaldo</h3>
                <p className="text-sm opacity-80">DNI y recibo de servicios</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Pago y Activación</h3>
                <p className="text-sm opacity-80">Finaliza tu suscripción</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form (Scrollable) */}
      <div className="flex-1 lg:w-1/2 h-full overflow-y-auto bg-white scroll-smooth">
        <div className="w-full max-w-2xl mx-auto p-8 py-12">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Volver al inicio</span>
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900">Allin Wasi</span>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 text-center mb-4">
              Verificación de Perfil de Arrendador
            </h1>
            <p className="text-slate-600 text-center max-w-lg mx-auto">
              Completa tus datos y sube la documentación requerida para activar tu plan y comenzar a publicar.
            </p>

            {/* Selected Plan Badge */}
            <div className="flex justify-center mt-6">
              <span className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${selectedPlan === 'featured'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'bg-slate-100 text-slate-700'
                }`}>
                {selectedPlan === 'featured' ? '⭐ Plan Destacado - S/ 20.00' : 'Plan Básico - S/ 10.00'}
              </span>
            </div>
          </div>

          {/* Security Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-amber-800 font-bold mb-2">
                  🛡️ Importante antes de continuar
                </h3>
                <p className="text-sm text-amber-800/90 leading-relaxed">
                  Para proteger a la comunidad, el pago de tu suscripción cubre los gastos administrativos de la <strong>validación de tu identidad y propiedad</strong>.
                </p>
                <p className="text-sm text-amber-800/90 mt-2 leading-relaxed">
                  Por favor, ten a la mano tu <strong>DNI</strong> y un <strong>Recibo de Servicios</strong>. Si nuestro equipo detecta documentación falsa o intentos de fraude, la cuenta será inhabilitada.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section: Personal Data */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                Datos Personales
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-700">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="fullName"
                      placeholder="Juan Pérez García"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`pl-10 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${errors.fullName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-red-500 font-medium">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email Registrado</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      readOnly
                      className={'pl-10 h-12 bg-slate-50 text-slate-500 border-slate-200'}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="phone"
                      placeholder="987654321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`pl-10 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dni" className="text-slate-700">Número de DNI</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="dni"
                      placeholder="12345678"
                      maxLength={8}
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      className={`pl-10 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${errors.dni ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.dni && <p className="text-xs text-red-500 font-medium">{errors.dni}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-700">Dirección del domicilio</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="address"
                    placeholder="Av. Cascanueces 2221, Santa Anita"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`pl-10 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${errors.address ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.address && <p className="text-xs text-red-500 font-medium">{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyCount" className="text-slate-700">
                  Número de propiedades que planea publicar (opcional)
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                  <Select value={propertyCount} onValueChange={setPropertyCount}>
                    <SelectTrigger className="pl-10 h-12 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 propiedad</SelectItem>
                      <SelectItem value="2-3">2-3 propiedades</SelectItem>
                      <SelectItem value="4-5">4-5 propiedades</SelectItem>
                      <SelectItem value="6+">Más de 6 propiedades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section: Documents */}
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Documentos para Validación
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Tus datos son confidenciales y solo serán revisados por el equipo de administración.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FileUploadZone
                  label="Foto de DNI (Cara Frontal)"
                  helpText="Formatos: JPG, PNG o PDF. Máx. 5MB"
                  file={dniFrontFile}
                  preview={dniFrontPreview}
                  inputRef={dniFrontRef}
                  errorKey="dniFront"
                  onFileChange={(e) => handleFileChange(e, setDniFrontFile, setDniFrontPreview)}
                  onRemove={() => removeFile(setDniFrontFile, setDniFrontPreview, dniFrontRef)}
                />

                <FileUploadZone
                  label="Foto de DNI (Cara Trasera)"
                  helpText="Formatos: JPG, PNG o PDF. Máx. 5MB"
                  file={dniBackFile}
                  preview={dniBackPreview}
                  inputRef={dniBackRef}
                  errorKey="dniBack"
                  onFileChange={(e) => handleFileChange(e, setDniBackFile, setDniBackPreview)}
                  onRemove={() => removeFile(setDniBackFile, setDniBackPreview, dniBackRef)}
                />
              </div>

              <FileUploadZone
                label="Recibo de Servicios (Luz o Agua)"
                helpText="Debe corresponder a la dirección del inmueble. Formatos: JPG, PNG o PDF. Máx. 5MB"
                file={utilityBillFile}
                preview={utilityBillPreview}
                inputRef={utilityBillRef}
                errorKey="utilityBill"
                onFileChange={(e) => handleFileChange(e, setUtilityBillFile, setUtilityBillPreview)}
                onRemove={() => removeFile(setUtilityBillFile, setUtilityBillPreview, utilityBillRef)}
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              {/* Terms and Conditions */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer">
                  Acepto los{' '}
                  <button type="button" className="text-emerald-600 font-medium hover:underline">
                    términos y condiciones
                  </button>{' '}
                  y la{' '}
                  <button type="button" className="text-emerald-600 font-medium hover:underline">
                    política de privacidad
                  </button>
                </label>
              </div>
              {errors.terms && <p className="text-xs text-red-500 ml-8">{errors.terms}</p>}

              {/* Declaration of Truth */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="declaration"
                    checked={declarationOfTruth}
                    onChange={(e) => setDeclarationOfTruth(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="declaration" className="text-sm text-slate-900 font-medium cursor-pointer">
                    Declaro bajo juramento que la información y documentos proporcionados son verdaderos.
                  </label>
                </div>
                <p className="text-xs text-slate-500 mt-2 ml-8 leading-relaxed">
                  Entiendo y acepto que Allin Wasi realizará una verificación de estos datos. En caso de detectarse <strong>falsificación de documentos, suplantación de identidad o intento de estafa</strong>, acepto la suspensión definitiva de mi cuenta.
                </p>
              </div>
              {errors.declaration && <p className="text-xs text-red-500">{errors.declaration}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold shadow-lg shadow-emerald-500/20"
              disabled={isPending || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {uploadProgress}
                </>
              ) : isPending ? (
                'Guardando...'
              ) : (
                'Completar Registro'
              )}
            </Button>

            <p className="text-xs text-center text-slate-500">
              Al hacer clic, tus datos serán guardados y podrás comenzar a publicar propiedades.
            </p>

            <div className="text-center pt-4 border-t border-slate-100">
              <span className="text-slate-600">¿Ya tienes una cuenta? </span>
              <Link href="/login" className="text-emerald-600 font-medium hover:text-emerald-700 hover:underline">
                Inicia sesión aquí
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
