"use client";

import { useSession } from "next-auth/react";

export default function CompleteRegistrationPage() {
  const { data } = useSession();
  const user: any = data?.user;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Completar registro</h1>
      <p className="mt-2 text-gray-600">Necesitamos algunos datos adicionales para continuar.</p>
      <div className="mt-6 space-y-2 text-sm text-gray-700">
        <div>Email: {user?.email}</div>
        <div>Nombre: {user?.name}</div>
      </div>
      <p className="mt-6 text-gray-500">TODO: Agregar formulario para teléfono, DNI y dirección.</p>
    </main>
  );
}
