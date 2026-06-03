"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/contexts/UserContext";
import { LogOut, UserCircle, ChevronDown, Menu, X, Bell } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import { LangToggle } from "@/components/LangToggle";

const pathTitles: Record<string, string> = {
  "/dashboard": "لوحة التحكم",
  "/bank": "البيانات البنكية",
  "/accounting": "القيود",
  "/statements": "القوائم المالية",
  "/approvals": "الموافقات",
  "/filings": "الإيداع الرسمي",
  "/company": "بيانات الشركة",
  "/users": "فريق العمل",
  "/settings": "الإعدادات",
};

function getPageTitle(pathname: string): string {
  if (pathTitles[pathname]) return pathTitles[pathname];
  for (const [path, label] of Object.entries(pathTitles)) {
    if (pathname.startsWith(path + "/")) return label;
  }
  return "مرحباً";
}

export function Header({
  mobileSidebarOpen,
  onToggleMobileSidebar,
}: {
  mobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      logout();
      router.push("/login");
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  }

  const title = getPageTitle(pathname);

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--border)] px-4 backdrop-blur-xl sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--muted-foreground)] shadow-[var(--shadow-soft)] transition-all hover:border-[var(--primary)] lg:hidden"
        >
          {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <h2 className="max-w-[48vw] truncate text-sm font-semibold text-[var(--foreground)] font-arabic sm:max-w-none sm:text-base">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <LangToggle />
        <ThemeToggle />

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-1.5 py-1.5 shadow-[var(--shadow-soft)] transition-colors hover:border-[var(--primary)] sm:gap-2 sm:px-2.5 sm:py-2"
          >
            <UserAvatar user={user} className="h-7 w-7 sm:h-8 sm:w-8" textClassName="text-xs" alt="صورة المستخدم" />
            <span className="hidden max-w-[140px] truncate text-sm font-medium text-[var(--foreground)] font-arabic sm:block">
              {user ? `${user.first_name} ${user.last_name}` : ""}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--muted-foreground)] sm:h-4 sm:w-4" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute end-0 top-full z-50 mt-2 min-w-[220px] rounded-[16px] border border-[var(--border)] bg-[var(--popover)] py-1 shadow-[var(--shadow-soft)] backdrop-blur-xl">
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-[var(--foreground)] font-arabic">
                    {user ? `${user.first_name} ${user.last_name}` : ""}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">{user?.email}</p>
                </div>
                <div className="my-1 border-t border-[var(--border)]" />
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--foreground)] font-arabic transition-colors hover:bg-[var(--muted)]"
                >
                  <UserCircle className="h-4 w-4 text-[var(--muted-foreground)]" />
                  الملف الشخصي
                </Link>
                <button
                  onClick={() => { setDropdownOpen(false); handleLogout(); }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[var(--destructive)] font-arabic transition-colors hover:bg-[color:color-mix(in_srgb,var(--destructive)_12%,transparent)]"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
