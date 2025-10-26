import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const syncUrl = process.env.BACKEND_SYNC_URL;
        if (!syncUrl) return true; // No backend configured, allow sign-in

        const payload = {
          email: user.email,
          name: user.name,
          image: user.image,
          provider: account?.provider,
          providerAccountId: account?.providerAccountId,
          profile,
        };

        const res = await fetch(syncUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        // Accept 2xx and 409 (already exists)
        if (res.ok || res.status === 409) return true;
        // Do not block login on backend issues
        return true;
      } catch {
        return true;
      }
    },
    async jwt({ token, account }) {
      // On initial sign in or when provider present, refresh registrationComplete from backend
      try {
        const syncUrl = process.env.BACKEND_SYNC_URL;
        const email = token?.email as string | undefined;
        if (syncUrl && email && account?.provider === "google") {
          const res = await fetch(syncUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (res.ok) {
            const data = await res.json();
            (token as any).registrationComplete = !!data.registrationComplete;
            if (data?.user?.id) (token as any).userId = data.user.id;
          }
        }
      } catch { }
      return token;
    },
    async session({ session, token }) {
      (session as any).user = {
        ...(session.user || {}),
        registrationComplete: (token as any).registrationComplete ?? false,
        id: (token as any).userId ?? (session as any).user?.id,
      } as any;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Permitir redirecciones internas
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Permitir URLs absolutas del mismo dominio
      if (new URL(url).origin === baseUrl) return url;
      // Evitar redirecciones externas
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
