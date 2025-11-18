"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function Page() {
  const router = useRouter();
  const { status } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/complete-registration");
      return;
    }

    if (status === "unauthenticated" && !isRedirecting) {
      setIsRedirecting(true);
      signIn("google", { callbackUrl: "/complete-registration" });
    }
  }, [status, router, isRedirecting]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-6">
      <p className="text-lunar-eclipse">Redirigiendo al registro...</p>
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-lunar-eclipse hover:text-inkwell transition-colors px-4 py-2 border border-au-lait rounded-lg hover:bg-au-lait"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Cancelar y volver al inicio</span>
      </button>
    </div>
  );
}

