import { LandlordRegistration } from "./components/LandlordRegistration"
import { TenantRegistration } from "./components/TenantRegistration"
import { UserType } from "@/types/userType";

interface CompleteRegistrationPageProps {
    user: UserType;
}

export const CompleteRegistrationPage = ({ user }: CompleteRegistrationPageProps) => {
    return (
        <main>
            {user?.role === "tenant" ? (<TenantRegistration user={user} />) : (<LandlordRegistration user={user} />)}
        </main>
    )
}