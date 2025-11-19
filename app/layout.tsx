import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import Providers from "@/lib/providers/providers";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/nextAuthOptions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Allin Wasi - Gestión de Propiedades",
  description: "Plataforma de gestión inmobiliaria para arrendadores. Administra tus propiedades, solicitudes y comunicación con inquilinos.",
  icons: {
    icon: '/logo.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(nextAuthOptions);
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
