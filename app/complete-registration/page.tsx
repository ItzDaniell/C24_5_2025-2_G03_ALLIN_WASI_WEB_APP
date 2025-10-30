import { getServerSession } from "next-auth/next";
import { CompleteRegistrationPage } from "@/modules/auth/complete-registration";
import { getUser } from "@/app/api/auth/[...nextauth]/getUser";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/nextAuthOptions";

export default async function Page() {
  try {
    const session = await getServerSession(nextAuthOptions);
    const accessToken = (session as any)?.accessToken;
    
    if (!accessToken) {
      throw new Error("No se encontró el token de acceso");
    }

    const response = await getUser(accessToken);
    const userData = await response.json();

    return (
      <CompleteRegistrationPage user={userData} />
    );
  } catch (error) {
    console.error("Error al cargar los datos del usuario:", error);
    // Puedes redirigir a una página de error o mostrar un mensaje
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error al cargar los datos del usuario</h1>
          <p className="text-red-500">
            {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
          </p>
        </div>
      </div>
    );
  }
}
