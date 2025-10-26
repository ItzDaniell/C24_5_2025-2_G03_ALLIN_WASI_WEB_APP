 "use client";

 import { useEffect, useMemo } from "react";
 import { useRouter } from "next/navigation";
 import { useSession } from "next-auth/react";
 import { useUserStore } from "../../app/store/user";
 import { Header, Hero, Benefits, LandlordCTA, Testimonials, Footer } from "./components";

 export default function LandingPage() {
   const router = useRouter();
   const { data: session } = useSession();
   const setUser = useUserStore.getState().setUser;

   const onLogin = () => router.push("/login");
   const onRegister = () => router.push("/register");

   const userInitials = useMemo(() => {
     return session?.user?.name
       ? session.user.name
           .split(" ")
           .map((n) => n[0])
           .slice(0, 2)
           .join("")
           .toUpperCase()
       : "U";
   }, [session?.user?.name]);

   useEffect(() => {
     if (session?.user) {
       setUser({
         name: session.user.name ?? null,
         email: session.user.email ?? null,
         image: session.user.image ?? null,
       });
     } else {
       setUser(null);
     }
   }, [session, setUser]);

   return (
     <div className="min-h-screen bg-white">
       <Header
         isAuthenticated={!!session?.user}
         userImage={session?.user?.image}
         userName={session?.user?.name}
         userInitials={userInitials}
         onLogin={onLogin}
         onRegister={onRegister}
       />
       <Hero onRegister={onRegister} onLogin={onLogin} />
       <Benefits />
       <LandlordCTA onRegister={onRegister} />
       <Testimonials />
       <Footer />
     </div>
   );
 }

