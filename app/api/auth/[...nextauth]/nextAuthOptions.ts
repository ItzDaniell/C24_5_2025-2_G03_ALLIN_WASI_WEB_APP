import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
    async jwt({ token, account, trigger, session }) {
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
            (token as any).userCreated = !!data.created;
            if (data?.user?.id) (token as any).userId = data.user.id;
            if (data?.user?.role) {
              (token as any).role = typeof data.user.role === 'string' 
                ? data.user.role 
                : (data.user.role?.name || data.user.role);
            }
            if (data?.access_token) (token as any).accessToken = data.access_token;
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
            if (data?.access_token) (token as any).accessToken = data.access_token;
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
        ...(session.user || {}),
        registrationComplete: (token as any).registrationComplete ?? false,
        userCreated: (token as any).userCreated ?? false,
        id: (token as any).userId ?? (session as any).user?.id,
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
