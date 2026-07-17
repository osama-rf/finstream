"use client";

import { Topbar } from "@/components/Topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-transparent" dir="rtl">
    <Topbar />
    <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
  </div>;
}
