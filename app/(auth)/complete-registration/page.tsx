import { getServerSession } from "next-auth/next";
import { CompleteRegistrationPage } from "@/modules/auth/complete-registration";
import { getUser } from "@/app/api/auth/[...nextauth]/getUser";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/nextAuthOptions";
import { RegistrationError } from "@/modules/auth/components/RegistrationError";

export default async function Page() {
  try {
    const session = await getServerSession(nextAuthOptions);
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) {
      return <RegistrationError errorMessage="No se encontró el token de acceso. Por favor, inicia sesión nuevamente." />;
    }
    
    const response = await getUser(accessToken);
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.error || errorData?.message || errorMessage;
      } catch {
        const text = await response.text().catch(() => "");
        if (text) {
          errorMessage = text.length > 100 ? `${text.substring(0, 100)}...` : text;
        }
      }
            if (response.status === 401) {
        errorMessage = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
      }
      return <RegistrationError errorMessage={errorMessage} />;
    }
    
    const userData = await response.json();
    if (!userData || !userData.id) {
      return <RegistrationError errorMessage="No se pudieron obtener los datos del usuario. Por favor, intenta iniciar sesión nuevamente." />;
    }
    
    return (
      <CompleteRegistrationPage user={userData} />
    );
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Ocurrió un error inesperado';
    return <RegistrationError errorMessage={errorMessage} />;
  }
}
