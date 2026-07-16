"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { setCollapsed(window.localStorage.getItem("sidebar-collapsed") === "true"); }, []);
  const toggleCollapse = useCallback(() => setCollapsed(value => { const next = !value; window.localStorage.setItem("sidebar-collapsed", String(next)); return next; }), []);
  return <div className="min-h-screen bg-transparent" dir="rtl">
    <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />
    <div className={`flex min-h-screen flex-col transition-[margin] duration-200 ${collapsed ? "lg:ms-20" : "lg:ms-72"}`}>
      <Header mobileSidebarOpen={mobileOpen} onToggleMobileSidebar={() => setMobileOpen(value => !value)} />
      <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
    </div>
  </div>;
}
