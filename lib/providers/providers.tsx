"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

export default function Providers({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        {children}
        <Toaster richColors position="top-right" />
      </SessionProvider>
    </QueryClientProvider>
  );
}


