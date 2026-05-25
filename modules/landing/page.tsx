"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useMe from "@/modules/auth/data/queries/useMe";
import { Header, Hero, Benefits, AllinWasiMeaning, LandlordCTA, TenantCTA, LegalNotice, Footer } from "./components";

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: userData } = useMe();

  const isAuthenticated = !!session?.user;
  const registrationComplete = (session as any)?.registrationComplete === true;
  const u: any = (userData as any)?.user ?? userData;
  const userImage = u?.profilePicture ? (u.profilePicture.startsWith("data:") || u.profilePicture.startsWith("http") ? u.profilePicture : `data:image/jpeg;base64,${u.profilePicture}`) : null;
  const userName = u?.fullName ?? null;
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
      <TenantCTA onAction={onLogin} />
      <LandlordCTA onAction={onLogin} />
      <LegalNotice />
      <Footer />
    </div>
  );
}


