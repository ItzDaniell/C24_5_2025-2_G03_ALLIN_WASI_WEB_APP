"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", confirmPassword: "" });

  const validateEmail = (value: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: "Ingrese un email válido" }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value && value.length < 6) {
      setErrors((prev) => ({ ...prev, password: "La contraseña debe tener al menos 6 caracteres" }));
    } else {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
    // Validar confirmación si ya hay valor
    if (confirmPassword && value !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Las contraseñas no coinciden" }));
    } else if (confirmPassword && value === confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value && value !== password) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Las contraseñas no coinciden" }));
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos los campos
    const newErrors = { email: "", password: "", confirmPassword: "" };
    let hasErrors = false;

    if (!email || !validateEmail(email)) {
      newErrors.email = "Ingrese un email válido";
      hasErrors = true;
    }

    if (!password || password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      hasErrors = true;
    }

    if (!confirmPassword || password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Por ahora redirigir a Google OAuth para registro
    // TODO: Implementar registro con email/contraseña cuando esté listo el backend
    signIn("google", { callbackUrl: "/complete-registration" });
  };

  return (
    <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-6 sm:px-12 bg-white">
      <div className="w-full max-w-md mx-auto">
        <button
          onClick={() => router.push("/login")}
          className="group flex items-center gap-2 text-lunar-eclipse hover:text-inkwell transition-all duration-200 mb-6 px-3 py-1.5 rounded-lg hover:bg-au-lait/50"
        >
          <svg className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Volver</span>
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm">
            <Image 
              src="/logo.png" 
              alt="Allin Wasi Logo" 
              width={48} 
              height={48}
              className="object-contain rounded-full"
            />
          </div>
          <span className="text-xl text-inkwell font-semibold">Allin Wasi</span>
        </div>

        <div className="mb-8">
          <h1 className="text-inkwell mb-2">Crea tu cuenta</h1>
          <p className="text-lunar-eclipse">Completa tus datos para comenzar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-inkwell mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-lunar-eclipse" />
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="tu.email@tecsup.edu.pe"
                className={`w-full pl-12 pr-4 py-3 bg-au-lait border-2 ${errors.email ? "border-red-400" : "border-transparent"} rounded-lg focus:outline-none focus:ring-2 focus:ring-creme-brulee focus:border-transparent transition-all text-inkwell placeholder:text-lunar-eclipse`}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-inkwell mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-lunar-eclipse" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-12 pr-12 py-3 bg-au-lait border-2 ${errors.password ? "border-red-400" : "border-transparent"} rounded-lg focus:outline-none focus:ring-2 focus:ring-creme-brulee focus:border-transparent transition-all text-inkwell placeholder:text-lunar-eclipse`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-lunar-eclipse hover:text-inkwell transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-inkwell mb-2">Confirmar Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-lunar-eclipse" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-12 pr-12 py-3 bg-au-lait border-2 ${errors.confirmPassword ? "border-red-400" : "border-transparent"} rounded-lg focus:outline-none focus:ring-2 focus:ring-creme-brulee focus:border-transparent transition-all text-inkwell placeholder:text-lunar-eclipse`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-lunar-eclipse hover:text-inkwell transition-colors"
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="w-full bg-lunar-eclipse hover:bg-inkwell text-white py-4 rounded-lg transition-all">
            Crear Cuenta
          </button>

          <div className="text-center">
            <p className="text-lunar-eclipse">
              ¿Ya tienes una cuenta?{" "}
              <button
                type="button"
                className="text-creme-brulee hover:underline"
                onClick={() => router.push("/login")}
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-au-lait" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-lunar-eclipse">O continúa con</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/complete-registration" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-au-lait rounded-lg hover:bg-au-lait transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span className="text-inkwell">Continuar con Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}

