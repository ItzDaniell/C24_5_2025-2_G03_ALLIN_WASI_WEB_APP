"use client";
import React, { Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/modules/landlord/components/sidebar/Sidebar";
import { LoadingSpinner } from "@/modules/shared/components/LoadingSkeleton";

export default function LandlordDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);

  // Extract the current view from the pathname
  const getCurrentView = () => {
    const parts = pathname.split("/");
    const lastPart = parts[parts.length - 1];
    // Map paths to view names used by the sidebar
    const viewMap: Record<string, string> = {
      landlord: "dashboard",
      properties: "properties",
      files: "files",
      requests: "requests",
      messages: "messages",
      "ai-chat": "ai-chat",
      settings: "settings",
      "create-property": "create-property",
      "property-details": "property-details",
      statistics: "statistics",
    };
    return viewMap[lastPart] || "dashboard";
  };

  const handleChangeView = (view: string) => {
    if (view === "dashboard") {
      router.push("/dashboard/landlord");
    } else {
      router.push(`/dashboard/landlord/${view}`);
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-au-lait via-white to-au-lait overflow-hidden">
      <Sidebar
        current={getCurrentView()}
        onChange={handleChangeView}
        expanded={sidebarExpanded}
        onToggle={toggleSidebar}
      />

      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarExpanded ? "ml-64" : "ml-16"
        }`}
      >
        <div className="min-h-full p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
