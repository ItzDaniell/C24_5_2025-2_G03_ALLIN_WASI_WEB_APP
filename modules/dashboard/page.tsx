"use client";

import React from "react";
import { Header, StatsGrid, ActionCards, RecentActivity, Sidebar, PropertiesView, PropertyDetailsView, FilesManager, CreatePropertyForm, SettingsView, RequestsView, MessagesView, AiChatView } from "./components";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/ui/sheet";
import dynamic from "next/dynamic";
import { AiChatFab } from "./components/views/AiChatFab";
import { AiChatModal } from "./components/views/AiChatModal";

const PropertyStatistics = dynamic(() => import("./components/views/PropertyStatistics").then(m => m.PropertyStatistics), { ssr: false });

export default function DashboardPage({ initialProperties }: { initialProperties?: any[] }) {
  const [view, setView] = React.useState<string>("dashboard");
  const [mobileOpen, setMobileOpen] = React.useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<number | undefined>(undefined);
  const [aiChatModalOpen, setAiChatModalOpen] = React.useState<boolean>(false);

  const handleOpenAiChatModal = React.useCallback(() => {
    setAiChatModalOpen(true);
  }, []);

  const handleChangeView = React.useCallback((v: string) => {
    if (v === "create-property") setSelectedPropertyId(undefined);
    if (v === "properties") setSelectedPropertyId(undefined);
    setView(v);
  }, []);

  const renderContent = () => {
    switch (view) {
      case "properties":
        return (
          <PropertiesView
            onViewChange={handleChangeView}
            onStartEdit={(id) => {
              setSelectedPropertyId(id);
              setView("create-property");
            }}
            onViewDetails={(id) => {
              setSelectedPropertyId(id);
              setView("property-details");
            }}
            initialProperties={initialProperties}
          />
        );
      case "property-details":
        return (
          <PropertyDetailsView
            propertyId={selectedPropertyId!}
            onViewChange={handleChangeView}
            onStartEdit={(id) => {
              setSelectedPropertyId(id);
              setView("create-property");
            }}
          />
        );
      case "files":
        return <FilesManager onViewChange={setView} />;
      case "create-property":
        return <CreatePropertyForm onViewChange={setView} editingPropertyId={selectedPropertyId ?? null} />;
      case "statistics":
        return <PropertyStatistics onViewChange={setView} propertyId={selectedPropertyId} />;
      case "requests":
        return <RequestsView onViewChange={setView} />;
      case "messages":
        return <MessagesView onViewChange={setView} />;
      case "ai-chat":
        return <AiChatView onViewChange={setView} />;
      case "settings":
        return <SettingsView onViewChange={setView} />;
      default:
        return (
          <>
            <StatsGrid
              totalProperties={initialProperties?.length || 0}
              available={(initialProperties || []).filter((p: any) => (p.status || '').toLowerCase() === 'available').length}
              rented={(initialProperties || []).filter((p: any) => (p.status || '').toLowerCase() === 'rented').length}
              reserved={(initialProperties || []).filter((p: any) => (p.status || '').toLowerCase() === 'reserved').length}
              draft={(initialProperties || []).filter((p: any) => (p.status || '').toLowerCase() === 'draft').length}
            />
            <ActionCards
              onViewChange={handleChangeView}
              publishedCount={(initialProperties || []).filter((p: any) => ['available','rented','reserved'].includes((p.status || '').toLowerCase())).length}
              draftCount={(initialProperties || []).filter((p: any) => (p.status || '').toLowerCase() === 'draft').length}
            />
            <RecentActivity />
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden lg:pl-64">
      {/* Sidebar escritorio */}
      <Sidebar current={view} onChange={handleChangeView} />

      {/* Sidebar móvil */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de navegación</SheetTitle>
          </SheetHeader>
          <Sidebar
            variant="mobile"
            current={view}
            onChange={(v) => {
              handleChangeView(v);
              setMobileOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {view === "dashboard" ? (
            <>
              <Header onOpenMenu={() => setMobileOpen(true)} />
              {renderContent()}
            </>
          ) : (
            renderContent()
          )}
        </div>
      </main>

      <AiChatFab onClick={handleOpenAiChatModal} />
      <AiChatModal open={aiChatModalOpen} onOpenChange={setAiChatModalOpen} />
    </div>
  );
}
