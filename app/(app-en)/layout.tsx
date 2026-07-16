"use client";

import { useCallback, useEffect, useState } from "react";
import { HeaderEn } from "@/components/HeaderEn";
import { SidebarEn } from "@/components/SidebarEn";

export default function AppLayoutEn({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { setCollapsed(window.localStorage.getItem("sidebar-collapsed") === "true"); }, []);
  const toggleCollapse = useCallback(() => setCollapsed(value => { const next = !value; window.localStorage.setItem("sidebar-collapsed", String(next)); return next; }), []);
  return <div className="min-h-screen bg-transparent" dir="ltr">
    <SidebarEn collapsed={collapsed} onToggleCollapse={toggleCollapse} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />
    <div className={`flex min-h-screen flex-col transition-[margin] duration-200 ${collapsed ? "lg:ml-20" : "lg:ml-72"}`}>
      <HeaderEn mobileSidebarOpen={mobileOpen} onToggleMobileSidebar={() => setMobileOpen(value => !value)} />
      <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
    </div>
  </div>;
}
