import { LandlordRegistration } from "./components/LandlordRegistration"
import { TenantRegistration } from "./components/TenantRegistration"
import { UserType, Landlord } from "@/types/userType";

interface CompleteRegistrationPageProps {
    user: UserType;
}

export const CompleteRegistrationPage = ({ user }: CompleteRegistrationPageProps) => {
    const roleName = (typeof user?.role === 'string' ? user.role : (user?.role?.name || '')).toLowerCase();
    
    if (roleName === "tenant" || roleName === "estudiante") {
        return <TenantRegistration user={user} />;
    }
    
    if (roleName === "landlord" || roleName === "arrendador") {
        return <LandlordRegistration user={user as Landlord} />;
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-au-lait">
                <h2 className="text-2xl font-bold text-inkwell mb-2">Rol no reconocido</h2>
                <p className="text-lunar-eclipse mb-4">No pudimos determinar tu tipo de usuario ({roleName}).</p>
                <a href="/" className="text-creme-brulee font-bold hover:underline">Volver al inicio</a>
            </div>
        </main>
    );
}
