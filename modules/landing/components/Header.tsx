"use client";

import { LogOut, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  isAuthenticated: boolean;
  registrationComplete?: boolean;
  userImage?: string | null;
  userName?: string | null;
  userInitials?: string;
  onLogin: () => void;
  onRegister: () => void;
};

export function Header({
  isAuthenticated,
  registrationComplete = false,
  userImage,
  userName,
  userInitials = "U",
  onLogin,
  onRegister,
}: Props) {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["allin-wasi", "beneficios", "estudiantes", "arrendadores"];
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm border border-gray-100">
              <Image 
                src="/logo.png" 
                alt="Allin Wasi Logo" 
                width={40} 
                height={40}
                className="object-contain rounded-full"
              />
            </div>
            <span className="text-xl md:text-2xl text-inkwell font-semibold">Allin Wasi</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => {
                document.getElementById("allin-wasi")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`text-lunar-eclipse hover:text-primary transition-colors pb-1 border-b-2 cursor-pointer ${
                activeSection === "allin-wasi" 
                  ? "border-primary text-primary font-medium" 
                  : "border-transparent"
              }`}
            >
              Nuestra Misión
            </button>
            <button 
              onClick={() => {
                document.getElementById("beneficios")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`text-lunar-eclipse hover:text-primary transition-colors pb-1 border-b-2 cursor-pointer ${
                activeSection === "beneficios" 
                  ? "border-primary text-primary font-medium" 
                  : "border-transparent"
              }`}
            >
              Beneficios
            </button>
            <button 
              onClick={() => {
                document.getElementById("estudiantes")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`text-lunar-eclipse hover:text-primary transition-colors pb-1 border-b-2 cursor-pointer ${
                activeSection === "estudiantes" 
                  ? "border-primary text-primary font-medium" 
                  : "border-transparent"
              }`}
            >
              Estudiantes
            </button>
            <button 
              onClick={() => {
                document.getElementById("arrendadores")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`text-lunar-eclipse hover:text-primary transition-colors pb-1 border-b-2 cursor-pointer ${
                activeSection === "arrendadores" 
                  ? "border-primary text-primary font-medium" 
                  : "border-transparent"
              }`}
            >
              Para Arrendadores
            </button>
          </nav>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 focus:outline-none">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt={userName ?? "Usuario"}
                        className="w-9 h-9 rounded-full object-cover border border-au-lait hover:border-creme-brulee transition-colors"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm hover:bg-primary/80 transition-colors ${userImage ? 'hidden' : ''}`}>
                      {userInitials}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 mt-2">
                  <Link href={registrationComplete ? "/dashboard" : "/complete-registration"}>
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <User className="w-4 h-4 text-gray-600" />
                      <span>{registrationComplete ? "Ir al Dashboard" : "Completar registro"}</span>
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50 p-2 rounded"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={onLogin}
                className="px-4 py-2 rounded-md bg-primary hover:bg-primary/80 text-white transition-colors"
              >
                Iniciar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
