"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface RegistrationErrorProps {
  errorMessage: string;
}

export function RegistrationError({ errorMessage }: RegistrationErrorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoToLogin = async () => {
    setIsLoading(true);
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: "/login"
      });
      router.push("/login");
      router.refresh();
    } catch (error) {
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Error al cargar los datos del usuario</h1>
        <p className="text-red-500 mb-4">
          {errorMessage}
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Por favor, cierra sesión e intenta iniciar sesión nuevamente.
        </p>
        <button
          onClick={handleGoToLogin}
          disabled={isLoading}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Cargando..." : "Volver al inicio de sesión"}
        </button>
      </div>
    </div>
  );
}

