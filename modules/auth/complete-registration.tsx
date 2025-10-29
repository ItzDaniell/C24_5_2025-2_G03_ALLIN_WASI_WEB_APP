import { LandlordRegistration } from "./components/LandlordRegistration"
import { TenantRegistration } from "./components/TenantRegistration"

interface CompleteRegistrationPageProps {
    user: any;
}

export const CompleteRegistrationPage = ({ user }: CompleteRegistrationPageProps) => {
    return (
        <main>
            {user?.role === "tenant" ? <TenantRegistration /> : <LandlordRegistration />}
        </main>
    )
}