"use client";

import { useRouter } from "next/navigation";
import { Header, Hero, Benefits, AllinWasiMeaning, LandlordCTA, Footer } from "./components";

export default function LandingPage() {
  const router = useRouter();

  const onLogin = () => router.push("/login");
  const onRegister = () => router.push("/register");

  return (
    <div className="min-h-screen bg-white">
      <Header
        isAuthenticated={false}
        onLogin={onLogin}
        onRegister={onRegister}
      />
      <Hero onRegister={onRegister} onLogin={onLogin} />
      <AllinWasiMeaning />
      <Benefits />
      <LandlordCTA onRegister={onRegister} />
      <Footer />
    </div>
  );
}

