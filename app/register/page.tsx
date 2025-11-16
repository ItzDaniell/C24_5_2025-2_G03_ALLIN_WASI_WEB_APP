"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function Page() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    // Si ya está autenticado, lo mandamos directo al formulario de registro
    if (status === "authenticated") {
      router.replace("/complete-registration");
      return;
    }

    if (status === "unauthenticated") {
      // Registro = iniciar sesión con Google y luego completar datos
      signIn("google", { callbackUrl: "/complete-registration" });
    }
  }, [status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <p className="text-lunar-eclipse">Redirigiendo al registro...</p>
    </div>
  );
}

