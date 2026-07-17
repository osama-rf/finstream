"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutGrid,
  TrendingUp,
  FileText,
  Building2,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  UserCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { LangToggle } from "@/components/LangToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useUser } from "@/lib/contexts/UserContext";
import type { UserRole } from "@/lib/types/database";

type NavItem = {
  label: string;
  icon: typeof LayoutGrid;
  path: string;
  roles: UserRole[];
};

const allRoles: UserRole[] = ["super_admin", "company_admin", "accountant", "auditor"];

const navItems: NavItem[] = [
  { label: "Control Center", icon: LayoutGrid, path: "/en/control-center", roles: allRoles },
  { label: "Financial Analysis", icon: TrendingUp, path: "/en/analytics", roles: allRoles },
  { label: "Financial Statements", icon: FileText, path: "/en/statements", roles: allRoles },
  { label: "Company & Team", icon: Building2, path: "/en/company", roles: allRoles },
  { label: "Settings", icon: Settings, path: "/en/settings", roles: allRoles },
];

const roleLabels: Record<UserRole, string> = {
  super_admin: "System Admin",
  company_admin: "Company Admin",
  accountant: "Accountant",
  auditor: "Auditor",
};

export function TopbarEn() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : true
  );

  async function signOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      logout();
      router.push("/login");
    } catch {
      toast.error("Sign out failed");
    }
  }

  return (
    <header
      dir="ltr"
      className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--background)_92%,transparent)] backdrop-blur-xl"
    >
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/en/control-center" className="flex shrink-0 items-center">
          <Image src="/logo.png" alt="Rakaez" width={34} height={40} priority className="sidebar-logo h-9 w-auto object-contain" />
        </Link>

        <div className="h-8 w-px shrink-0 bg-[var(--border)]" />

        {/* Desktop nav */}
        <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">
          {visibleItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 whitespace-nowrap rounded-[10px] px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-soft)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--primary)]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 lg:hidden" />

        {/* Mobile nav toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] shadow-[var(--shadow-soft)] lg:hidden"
          aria-label="Open menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Controls */}
        <div className="flex shrink-0 items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 shadow-[var(--shadow-soft)] hover:border-[var(--primary)]"
            >
              <span className="max-w-32 truncate text-xs font-bold">
                Glowpick
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute end-0 top-full z-50 mt-2 min-w-56 rounded-xl border border-[var(--border)] bg-[var(--popover)] py-1 shadow-[var(--shadow-soft)]">
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold">{user ? `${user.first_name} ${user.last_name}` : ""}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{user ? roleLabels[user.role] : ""}</p>
                  </div>
                  <div className="border-t border-[var(--border)]" />
                  <Link href="/en/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--muted)]">
                    <UserCircle className="h-4 w-4" />
                    Profile
                  </Link>
                  <button onClick={() => { setMenuOpen(false); void signOut(); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[var(--destructive)] hover:bg-[var(--muted)]">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav className="border-t border-[var(--border)] px-3 py-3 lg:hidden">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-soft)]"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--primary)]"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
