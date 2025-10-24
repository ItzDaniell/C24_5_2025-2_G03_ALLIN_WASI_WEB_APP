"use client";

import React, { useState } from "react";
import { Home, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrors({
        email: !email ? "El email es requerido" : "",
        password: !password ? "La contraseña es requerida" : "",
      });
      return;
    }
    if (errors.email || errors.password) return;
    // TODO: integrar acción de autenticación
    alert("Login enviado (placeholder)");
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-lunar-eclipse rounded-xl flex items-center justify-center">
              {/* Home icon */}
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl text-inkwell">TECSUP Rooms</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-inkwell mb-2">Bienvenido de nuevo</h1>
            <p className="text-lunar-eclipse">Inicia sesión para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-inkwell mb-2">Email</label>
              <div className="relative">
                {/* Mail icon */}
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

            {/* Password */}
            <div>
              <label className="block text-inkwell mb-2">Contraseña</label>
              <div className="relative">
                {/* Lock icon */}
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
                  {/* Eye/EyeOff icon */}
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-au-lait text-creme-brulee focus:ring-2 focus:ring-creme-brulee"
                />
                <span className="text-sm text-lunar-eclipse">Recordarme</span>
              </label>
              <button type="button" className="text-sm text-creme-brulee hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" className="w-full bg-lunar-eclipse hover:bg-inkwell text-white py-4 rounded-lg transition-all">
              Iniciar Sesión
            </button>

            {/* Register */}
            <div className="text-center">
              <p className="text-lunar-eclipse">
                ¿No tienes una cuenta?{" "}
                <button type="button" className="text-creme-brulee hover:underline">Regístrate aquí</button>
              </p>
            </div>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-au-lait" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-lunar-eclipse">O continúa con</span>
              </div>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-au-lait rounded-lg hover:bg-au-lait transition-colors"
              >
                {/* Google icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <span className="text-inkwell">Google</span>
              </button>
              <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-au-lait rounded-lg hover:bg-au-lait transition-colors">
                {/* Facebook icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span className="text-inkwell">Facebook</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-lunar-eclipse via-creme-brulee to-au-lait items-center justify-center p-12 relative">
        <div className="text-center text-white space-y-8">
          <div>
            <h2 className="text-5xl mb-4">Encuentra tu espacio ideal</h2>
            <p className="text-xl opacity-90">
              La mejor plataforma para estudiantes de TECSUP<br />
              que buscan alojamiento cerca del campus
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
              <div className="text-4xl mb-2">500+</div>
              <div className="text-sm opacity-90">Cuartos</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
              <div className="text-4xl mb-2">1,200+</div>
              <div className="text-sm opacity-90">Estudiantes</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
              <div className="text-4xl mb-2">98%</div>
              <div className="text-sm opacity-90">Satisfacción</div>
            </div>
          </div>
        </div>

        {/* Help Button */}
        <button className="absolute bottom-8 right-8 w-12 h-12 bg-inkwell rounded-full flex items-center justify-center text-white hover:bg-opacity-90 transition-all shadow-lg">
          <span className="text-xl">?</span>
        </button>
      </div>
    </div>
  );
}
