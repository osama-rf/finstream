"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, Menu, UserCircle, X } from "lucide-react";
import { toast } from "sonner";
import { LangToggle } from "@/components/LangToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import { useUser } from "@/lib/contexts/UserContext";

const titles: Record<string, string> = { "/control-center": "مركز التحكم", "/analytics": "التحليل المالي", "/statements": "القوائم المالية", "/company": "الشركة والفريق", "/settings": "الإعدادات" };

export function Header({ mobileSidebarOpen, onToggleMobileSidebar }: { mobileSidebarOpen: boolean; onToggleMobileSidebar: () => void }) {
  const pathname = usePathname(); const router = useRouter(); const { user, logout } = useUser(); const [open, setOpen] = useState(false);
  const title = Object.entries(titles).find(([path]) => pathname === path || pathname.startsWith(path + "/"))?.[1] ?? "مرحباً";
  async function signOut() { try { await fetch("/api/auth/logout", { method: "POST" }); logout(); router.push("/login"); } catch { toast.error("حدث خطأ أثناء تسجيل الخروج"); } }
  return <header dir="rtl" className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--background)_92%,transparent)] px-4 backdrop-blur-xl sm:px-6">
    <div className="flex min-w-0 items-center gap-3"><button onClick={onToggleMobileSidebar} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] shadow-[var(--shadow-soft)] lg:hidden">{mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button><h2 className="truncate text-base font-bold font-arabic">{title}</h2></div>
    <div className="flex items-center gap-2"><LangToggle /><ThemeToggle /><div className="relative"><button onClick={() => setOpen(value => !value)} className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-2 shadow-[var(--shadow-soft)] hover:border-[var(--primary)]"><UserAvatar user={user} className="h-7 w-7" textClassName="text-xs" alt="صورة المستخدم" /><span className="hidden max-w-32 truncate text-xs font-medium sm:block">{user ? `${user.first_name} ${user.last_name}` : ""}</span><ChevronDown className="h-3.5 w-3.5 text-[var(--muted-foreground)]" /></button>{open && <><div className="fixed inset-0 z-40" onClick={() => setOpen(false)} /><div className="absolute end-0 top-full z-50 mt-2 min-w-56 rounded-xl border border-[var(--border)] bg-[var(--popover)] py-1 shadow-[var(--shadow-soft)]"><div className="px-4 py-3"><p className="text-sm font-semibold">{user ? `${user.first_name} ${user.last_name}` : ""}</p><p className="text-xs text-[var(--muted-foreground)]">{user?.email}</p></div><div className="border-t border-[var(--border)]" /><Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--muted)]"><UserCircle className="h-4 w-4" />الملف الشخصي</Link><button onClick={() => { setOpen(false); void signOut(); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[var(--destructive)] hover:bg-[var(--muted)]"><LogOut className="h-4 w-4" />تسجيل الخروج</button></div></>}</div></div>
  </header>;
}
