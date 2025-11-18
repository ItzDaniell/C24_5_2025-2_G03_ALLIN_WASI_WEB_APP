"use client";
import { useState, type FormEvent } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Eye, EyeOff, Mail, Lock, User, Phone, Home, CreditCard, MapPin, Building} from 'lucide-react';

import { Landlord } from '@/types/userType';
import Link from 'next/link';
import useUpdateLandlord from '../data/mutations/useUpdateLandlord';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface LandlordRegistrationProps {
    user: Landlord;
}

export const LandlordRegistration = ({ user }: LandlordRegistrationProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName);
  const [email, setEmail] = useState(user?.email);
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [dni, setDni] = useState(user?.dni ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [propertyCount, setPropertyCount] = useState(String(user?.propertyCount ?? ''));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { data: session, update } = useSession();
  const authUserId = (session as any)?.user?.id ?? user?.id;
  const { mutate, isPending } = useUpdateLandlord(authUserId as string);
  const onRegister = (type: 'tenant' | 'landlord', userEmail: string) => {
  };
  const onSwitchToLogin = () => {
  };

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const userData = { fullName: fullName?.trim() || '' };
    const landlordData: any = {
      phone: phone.trim(),
      dni: dni.trim(),
      address: address.trim(),
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
          } catch (error) {
          }
          router.push('/dashboard');
        },
        onError: (error: any) => {
        },
      }
    );
  };
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block lg:w-2/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2F4F4F] via-[#A37F6E] to-[#D0D7C8]">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-white">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Home className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl mb-4">Únete a nuestra comunidad</h2>
            <p className="text-lg mb-8 opacity-90">
              Miles de estudiantes ya encontraron su hogar ideal con nosotros
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">✓</span>
                </div>
                <div>
                  <h3 className="mb-1">Búsqueda inteligente</h3>
                  <p className="text-sm opacity-80">Encuentra el lugar perfecto con IA</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">✓</span>
                </div>
                <div>
                  <h3 className="mb-1">Seguridad verificada</h3>
                  <p className="text-sm opacity-80">Zonas seguras y propiedades verificadas</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">✓</span>
                </div>
                <div>
                  <h3 className="mb-1">Comunidad estudiantil</h3>
                  <p className="text-sm opacity-80">Conecta con otros estudiantes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-2xl py-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[#2F4F4F] hover:text-[#A37F6E] transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Volver al inicio</span>
          </button>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#2F4F4F] flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl text-[#2D3638]">
                Allin Wasi
              </span>
            </div>
            <h1 className="text-3xl mb-1 text-[#2D3638] text-center mt-8 font-semibold">¡Solo un paso más!</h1>
            <p className="text-[#2F4F4F] text-center mt-4 mb-4">Completa tus datos para continuar y poder usar la plataforma</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="fullName"
                    placeholder="Juan Pérez García"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`pl-10 h-11 ${errors.fullName ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Registrado
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    className={'pl-10 h-11'}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="987654321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`pl-10 h-11 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="dni"
                    placeholder="12345678"
                    maxLength={8}
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    className={`pl-10 h-11 ${errors.dni ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.dni && <p className="text-xs text-red-500">{errors.dni}</p>}
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Dirección del domicilio</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="address"
                    placeholder="Av. Cascanueces 2221, Santa Anita"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`pl-10 h-11 ${errors.address ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyCount">
                  Número de propiedades que planea publicar
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Select value={propertyCount} onValueChange={setPropertyCount}>
                    <SelectTrigger className="pl-10 h-11">
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
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 rounded border-[#2F4F4F] text-[#2F4F4F] focus:ring-[#2F4F4F]"
                required
              />
              <label htmlFor="terms" className="text-sm text-[#2F4F4F]">
                Acepto los{' '}
                <button type="button" className="text-[#A37F6E] hover:underline">
                  términos y condiciones
                </button>{' '}
                y la{' '}
                <button type="button" className="text-[#A37F6E] hover:underline">
                  política de privacidad
                </button>
              </label>
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-[#2F4F4F] hover:bg-[#2D3638] text-white"
              disabled={isPending}
            >
              {isPending ? 'Guardando...' : 'Crear cuenta'}
            </Button>
            <div className="text-center">
              <span className="text-[#2F4F4F]">¿Ya tienes una cuenta? </span>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#A37F6E] hover:text-[#8B6B5A]"
              >
                <Link href={'/login'}>
                  Inicia sesión aquí
                </Link>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};