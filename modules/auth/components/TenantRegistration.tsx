"use client";

import React, { useState } from "react";
import { UserType } from "@/types/userType";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { User, Phone, BookOpen, GraduationCap, DollarSign, MapPin, Shield, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TenantRegistrationProps {
  user: UserType;
}

export const TenantRegistration = ({ user }: TenantRegistrationProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: "",
    career: "",
    cicle: "",
    monthlyBudget: "",
    originDepartment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call for now or implement if service exists
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("¡Registro completado!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Error al completar el registro");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full overflow-hidden bg-white">
      {/* Left Panel - Student Hero */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-center p-12 overflow-hidden bg-inkwell text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-creme-brulee/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-creme-brulee/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <div className="relative z-10 max-w-md mx-auto">
          <div className="w-16 h-16 bg-creme-brulee rounded-2xl flex items-center justify-center mb-8 shadow-lg transform -rotate-6">
            <GraduationCap className="w-10 h-10 text-inkwell" />
          </div>
          
          <h1 className="text-4xl font-black mb-6 leading-tight tracking-tighter">
            Tu nueva etapa universitaria <span className="text-creme-brulee">comienza aquí.</span>
          </h1>
          <p className="text-lg text-gray-400 mb-12 leading-relaxed">
            Completa tu perfil para que podamos ayudarte a encontrar la habitación perfecta cerca de Tecsup.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-creme-brulee/20 flex items-center justify-center text-creme-brulee">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium">Búsqueda personalizada según tu presupuesto</p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-creme-brulee/20 flex items-center justify-center text-creme-brulee">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium">Conecta con arrendadores verificados</p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-creme-brulee/20 flex items-center justify-center text-creme-brulee">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium">Comunidad exclusiva para estudiantes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 overflow-y-auto px-6 py-12 lg:px-12">
        <div className="max-w-xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-creme-brulee font-black text-sm uppercase tracking-widest mb-2">
              <Shield className="w-4 h-4" />
              Paso Final
            </div>
            <h2 className="text-3xl font-black text-inkwell mb-2 tracking-tighter">Completa tu registro</h2>
            <p className="text-gray-500 font-medium">Solo unos datos más para personalizar tu experiencia.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-inkwell font-bold text-xs uppercase tracking-wider">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    id="fullName" 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="pl-10 h-12 bg-slate-50 border-gray-200 focus:border-creme-brulee focus:ring-creme-brulee rounded-xl transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-inkwell font-bold text-xs uppercase tracking-wider">Teléfono de contacto</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      id="phone" 
                      placeholder="987 654 321"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="pl-10 h-12 bg-slate-50 border-gray-200 focus:border-creme-brulee focus:ring-creme-brulee rounded-xl transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="career" className="text-inkwell font-bold text-xs uppercase tracking-wider">Carrera / Especialidad</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      id="career" 
                      placeholder="Ej: Diseño y Desarrollo" 
                      value={formData.career}
                      onChange={(e) => setFormData({...formData, career: e.target.value})}
                      className="pl-10 h-12 bg-slate-50 border-gray-200 focus:border-creme-brulee focus:ring-creme-brulee rounded-xl transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cicle" className="text-inkwell font-bold text-xs uppercase tracking-wider">Ciclo Actual</Label>
                  <Select onValueChange={(val) => setFormData({...formData, cicle: val})}>
                    <SelectTrigger className="h-12 bg-slate-50 border-gray-200 focus:border-creme-brulee rounded-xl transition-all">
                      <SelectValue placeholder="Selecciona tu ciclo" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((idx) => (
                        <SelectItem key={idx} value={String(idx)}>{idx}° Ciclo</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-inkwell font-bold text-xs uppercase tracking-wider">Presupuesto Sugerido (S/)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      id="budget" 
                      type="number" 
                      placeholder="Ej: 500" 
                      value={formData.monthlyBudget}
                      onChange={(e) => setFormData({...formData, monthlyBudget: e.target.value})}
                      className="pl-10 h-12 bg-slate-50 border-gray-200 focus:border-creme-brulee focus:ring-creme-brulee rounded-xl transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin" className="text-inkwell font-bold text-xs uppercase tracking-wider">Departamento de Origen</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    id="origin" 
                    placeholder="Ej: Arequipa, Cusco, Lima..." 
                    value={formData.originDepartment}
                    onChange={(e) => setFormData({...formData, originDepartment: e.target.value})}
                    className="pl-10 h-12 bg-slate-50 border-gray-200 focus:border-creme-brulee focus:ring-creme-brulee rounded-xl transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button 
                type="submit" 
                className="w-full h-14 bg-inkwell hover:bg-inkwell/90 text-white font-bold text-lg rounded-2xl shadow-xl shadow-inkwell/10 transition-all flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    Completar mi cuenta
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-xs text-gray-400 font-medium">
              Al completar tu registro aceptas nuestros términos de servicio y políticas de privacidad.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
