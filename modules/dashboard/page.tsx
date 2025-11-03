"use client";

import React from "react";
import { Header, StatsGrid, ActionCards, RecentActivity, Sidebar, PropertiesView, FilesManager, CreatePropertyForm } from "./components";
import { Sheet, SheetContent } from "@/ui/sheet";
import dynamic from "next/dynamic";

const PropertyStatistics = dynamic(() => import("./components/views/PropertyStatistics").then(m => m.PropertyStatistics), { ssr: false });

export default function DashboardPage() {
  const [view, setView] = React.useState<string>("dashboard");
  const [mobileOpen, setMobileOpen] = React.useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<number | undefined>(undefined);

  const handleOpenAiChat = React.useCallback(() => {
    // Integración del chat de IA se manejará desde aquí si es necesario
  }, []);

  const renderContent = () => {
    switch (view) {
      case "properties":
        return (
          <PropertiesView
            onViewChange={setView}
            onEditProperty={(id) => {
              setSelectedPropertyId(id);
              setView("statistics");
            }}
          />
        );
      case "files":
        return <FilesManager onViewChange={setView} />;
      case "create-property":
        return <CreatePropertyForm onViewChange={setView} editingPropertyId={selectedPropertyId ?? null} />;
      case "statistics":
        return <PropertyStatistics onViewChange={setView} propertyId={selectedPropertyId} />;
      default:
        return (
          <>
            <StatsGrid />
            <ActionCards onViewChange={setView} />
            <RecentActivity />
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden lg:pl-64">
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
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {view === "dashboard" ? (
            <>
              <Header onOpenAiChat={handleOpenAiChat} onOpenMenu={() => setMobileOpen(true)} />
              {renderContent()}
            </>
          ) : (
            renderContent()
          )}
        </div>
      </main>
    </div>
  );
}
