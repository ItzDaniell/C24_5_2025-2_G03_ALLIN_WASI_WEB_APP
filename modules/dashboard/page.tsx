"use client";

import React from "react";
import { Header, StatsGrid, ActionCards, RecentActivity, Sidebar, PropertiesView, PropertyDetailsView, FilesManager, CreatePropertyForm, SettingsView, RequestsView, MessagesView, AiChatView } from "./components";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AiChatFab } from "./components/views/ai-chat/AiChatFab";
import { AiChatModal } from "./components/views/ai-chat/AiChatModal";


const PropertyStatistics = dynamic(() => import("./components/views/properties/PropertyStatistics").then(m => m.PropertyStatistics), { ssr: false });

export default function DashboardPage({ initialProperties }: { initialProperties?: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const urlView = searchParams.get('view') || 'dashboard';
  const urlPropertyId = searchParams.get('propertyId');
  
  const [view, setView] = React.useState<string>(urlView);
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<string | number | undefined>(
    urlPropertyId || undefined
  );
  const [aiChatModalOpen, setAiChatModalOpen] = React.useState<boolean>(false);
  const [sidebarExpanded, setSidebarExpanded] = React.useState<boolean>(true);

  React.useEffect(() => {
    setView(urlView);
    if (urlPropertyId) {
      setSelectedPropertyId(urlPropertyId);
    } else if (urlView === 'properties' || urlView === 'dashboard') {
      setSelectedPropertyId(undefined);
    }
  }, [urlView, urlPropertyId]);

  const handleOpenAiChatModal = React.useCallback(() => {
    setAiChatModalOpen(true);
  }, []);

  const handleChangeView = React.useCallback((v: string, propertyId?: string | number) => {
    if (v === "create-property") setSelectedPropertyId(undefined);
    if (v === "properties") setSelectedPropertyId(undefined);
    
    setView(v);
    
    const params = new URLSearchParams();
    params.set('view', v);
    if (propertyId) {
      params.set('propertyId', String(propertyId));
      setSelectedPropertyId(propertyId);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router]);

  const toggleSidebar = React.useCallback(() => {
    setSidebarExpanded(prev => !prev);
  }, []);

  const renderContent = () => {
    switch (view) {
      case "properties":
        return (
          <PropertiesView
            onViewChange={handleChangeView}
            onStartEdit={(id) => {
              handleChangeView("create-property", id);
            }}
            onViewDetails={(id) => {
              handleChangeView("property-details", id);
            }}
            initialProperties={initialProperties}
          />
        );
      case "property-details":
        if (!selectedPropertyId) {
          return (
            <div className="text-center py-12">
              <p className="text-lunar-eclipse mb-4">No se especificó una propiedad</p>
              <button 
                onClick={() => handleChangeView("properties")}
                className="px-4 py-2 bg-creme-brulee text-white rounded-lg hover:bg-creme-brulee/90"
              >
                Volver a propiedades
              </button>
            </div>
          );
        }
        return (
          <PropertyDetailsView
            propertyId={selectedPropertyId}
            onViewChange={handleChangeView}
            onStartEdit={(id) => {
              handleChangeView("create-property", id);
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
    <div className="flex h-screen bg-gradient-to-br from-au-lait via-white to-au-lait overflow-hidden">
      <Sidebar 
        current={view} 
        onChange={handleChangeView}
        expanded={sidebarExpanded}
        onToggle={toggleSidebar}
      />

      <main 
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarExpanded ? 'ml-64' : 'ml-16'
        }`}
      >
        <div className="min-h-full p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            {view === "dashboard" && <Header />}
            {renderContent()}
          </div>
        </div>
      </main>

      <AiChatFab onClick={handleOpenAiChatModal} />
      <AiChatModal open={aiChatModalOpen} onOpenChange={setAiChatModalOpen} />
    </div>
  );
}
