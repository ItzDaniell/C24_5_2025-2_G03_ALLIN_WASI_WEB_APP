import { getServerSession } from "next-auth/next";
import { CompleteRegistrationPage } from "@/modules/auth/complete-registration";
import { getUser } from "@/app/api/auth/[...nextauth]/getUser";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/nextAuthOptions";

export default async function Page() {
  try {
    const session = await getServerSession(nextAuthOptions);
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) {
      throw new Error("No se encontró el token de acceso. Por favor, inicia sesión nuevamente.");
    }
    const response = await getUser(accessToken);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || errorData?.message || `Error ${response.status}: ${response.statusText}`);
    }
    const userData = await response.json();
    if (!userData || !userData.id) {
      throw new Error("No se pudieron obtener los datos del usuario. Por favor, intenta iniciar sesión nuevamente.");
    }
    return (
      <CompleteRegistrationPage user={userData} />
    );
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Error al cargar los datos del usuario</h1>
          <p className="text-red-500 mb-4">
            {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
          </p>
          <a 
            href="/login" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    );
  }
}
