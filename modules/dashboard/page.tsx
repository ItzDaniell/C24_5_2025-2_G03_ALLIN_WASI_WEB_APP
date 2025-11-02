"use client";

import React from "react";
import { Header, StatsGrid, ActionCards, RecentActivity, Sidebar } from "./components";
import { Sheet, SheetContent } from "@/ui/sheet";

export default function DashboardPage() {
  const [view, setView] = React.useState<string>("dashboard");
  const [mobileOpen, setMobileOpen] = React.useState<boolean>(false);

  const handleOpenAiChat = React.useCallback(() => {
    // Integración del chat de IA se manejará desde aquí si es necesario
  }, []);

  return (
    <div className="flex min-h-screen bg-au-lait">
      {/* Sidebar escritorio */}
      <Sidebar current={view} onChange={setView} />

      {/* Sidebar móvil */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar
            variant="mobile"
            current={view}
            onChange={(v) => {
              setView(v);
              setMobileOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Header onOpenAiChat={handleOpenAiChat} onOpenMenu={() => setMobileOpen(true)} />
          <StatsGrid />
          <ActionCards onViewChange={setView} />
          <RecentActivity />
        </div>
      </main>
    </div>
  );
}
