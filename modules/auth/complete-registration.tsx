import { LandlordRegistration } from "./components/LandlordRegistration"
import { TenantRegistration } from "./components/TenantRegistration"
import { UserType } from "@/types/userType";

interface CompleteRegistrationPageProps {
    user: UserType;
}

export const CompleteRegistrationPage = ({ user }: CompleteRegistrationPageProps) => {
    const roleName = typeof user?.role === 'string' ? user.role : (user?.role?.name || '');
    return (
        <main>
            {roleName === "tenant" ? (<TenantRegistration user={user} />) : (<LandlordRegistration user={user} />)}
        </main>
    )
}