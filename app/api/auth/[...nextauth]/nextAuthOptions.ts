import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
        fullName: { label: "FullName", type: "text" },
        action: { label: "Action", type: "text" } // "login" o "register"
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        const BASE_URL = process.env.BACKEND_API_URL || "http://localhost:4000";
        const action = credentials.action || "login";
        
        try {
          if (action === "register") {
            const res = await fetch(`${BASE_URL}/auth/register`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
                fullName: credentials.fullName,
                role: credentials.role,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              return {
                id: data.user.id,
                email: data.user.email,
                name: data.user.fullName,
                accessToken: data.access_token,
                role: typeof data.user.role === 'string' ? data.user.role : (data.user.role?.name || "tenant"),
                registrationComplete: data.registrationComplete,
              } as any;
            }
            const errorMsg = await res.text();
            throw new Error(errorMsg || "Error en el registro");
          } else {
            // Login action
            const res = await fetch(`${BASE_URL}/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              return {
                id: data.user.id,
                email: data.user.email,
                name: data.user.fullName,
                accessToken: data.access_token,
                role: typeof data.user.role === 'string' ? data.user.role : (data.user.role?.name || "tenant"),
                registrationComplete: data.registrationComplete,
              } as any;
            }
            throw new Error("Credenciales inválidas");
          }
        } catch (error: any) {
          throw new Error(error?.message || "Error al autenticar");
        }
      }
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const syncUrl = process.env.BACKEND_SYNC_URL;
        if (!syncUrl) return true;
        const payload = {
          email: user.email,
          name: user.name,
          image: user.image,
          provider: account?.provider,
          providerAccountId: account?.providerAccountId,
          profile,
        } as any;
        const res = await fetch(syncUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok || res.status === 409) return true;
        return true;
      } catch {
        return true;
      }
    },
    async jwt({ token, user, account, trigger, session }) {
      try {
        if (account?.provider === "credentials" && user) {
          const u = user as any;
          (token as any).userId = u.id;
          (token as any).role = u.role;
          (token as any).accessToken = u.accessToken;
          (token as any).registrationComplete = !!u.registrationComplete;
          (token as any).name = u.name;
        }

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
            (token as any).userCreated = !!data.created;
            if (data?.user?.id) (token as any).userId = data.user.id;
            if (data?.user?.role) {
              (token as any).role = typeof data.user.role === 'string'
                ? data.user.role
                : (data.user.role?.name || data.user.role);
            }
            if (data?.user?.fullName) {
              (token as any).name = data.user.fullName; // Use database name
            }
            if (data?.access_token) {
              (token as any).accessToken = data.access_token;
            }
          }
        }

        if (syncUrl && email && !(token as any).accessToken) {
          const res = await fetch(syncUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.user?.role) {
              (token as any).role = typeof data.user.role === 'string'
                ? data.user.role
                : (data.user.role?.name || data.user.role);
            }
            if (data?.user?.id) (token as any).userId = data.user.id;
            if (data?.user?.fullName) {
              (token as any).name = data.user.fullName; // Use database name
            }
            if (data?.access_token) {
              (token as any).accessToken = data.access_token;
            }
            if (typeof data?.registrationComplete === 'boolean') {
              (token as any).registrationComplete = data.registrationComplete;
            }
            if (typeof data?.created === 'boolean') {
              (token as any).userCreated = data.created;
            }
          }
        }

        if (trigger === 'update' && session) {
          if (typeof (session as any).registrationComplete === 'boolean') {
            (token as any).registrationComplete = (session as any).registrationComplete;
          }
        }
      } catch {}
      return token;
    },
    async session({ session, token }) {
      (session as any).user = {
        id: (token as any).userId ?? (session as any).user?.id,
        email: token.email,
        name: (token as any).name ?? null, // Don't use Google name
        image: token.picture ?? null,
        registrationComplete: (token as any).registrationComplete ?? false,
        userCreated: (token as any).userCreated ?? false,
        role: (token as any).role ?? (session as any).user?.role,
      } as any;
      (session as any).accessToken = (token as any).accessToken ?? (session as any).accessToken;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
