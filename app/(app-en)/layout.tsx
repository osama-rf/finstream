"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { SidebarEn } from "@/components/SidebarEn";
import { HeaderEn } from "@/components/HeaderEn";

const MemoSidebar = memo(SidebarEn);
const MemoHeader = memo(HeaderEn);

export default function AppLayoutEn({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setSidebarCollapsed(true);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-transparent" dir="ltr">
      <MemoSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        mobileOpen={mobileSidebarOpen}
        onMobileOpenChange={setMobileSidebarOpen}
      />
      <div className={`flex min-h-screen flex-col transition-[margin] duration-200 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}>
        <MemoHeader mobileSidebarOpen={mobileSidebarOpen} onToggleMobileSidebar={toggleMobileSidebar} />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
