"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header, Hero, Benefits, AllinWasiMeaning, LandlordCTA, TenantCTA, LegalNotice, Footer } from "./components";

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const isAuthenticated = !!session?.user;
  const registrationComplete = (session as any)?.registrationComplete === true;
  const userImage = session?.user?.image ?? null;
  const userName = session?.user?.name ?? null;
  const userInitials = userName
    ? userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const onLogin = () => router.push("/login");
  const onRegister = () => router.push("/register");

  return (
    <div className="min-h-screen bg-white">
      <Header
        isAuthenticated={isAuthenticated}
        registrationComplete={registrationComplete}
        userImage={userImage}
        userName={userName}
        userInitials={userInitials}
        onLogin={onLogin}
        onRegister={onRegister}
      />
      <Hero onRegister={onRegister} onLogin={onLogin} />
      <AllinWasiMeaning />
      <Benefits />
      <TenantCTA onRegister={onRegister} />
      <LandlordCTA onRegister={onRegister} />
      <LegalNotice />
      <Footer />
    </div>
  );
}


