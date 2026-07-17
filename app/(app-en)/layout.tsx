"use client";

import { TopbarEn } from "@/components/TopbarEn";

export default function AppLayoutEn({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-transparent" dir="ltr">
    <TopbarEn />
    <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
  </div>;
}
