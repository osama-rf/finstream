"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, FileText,
  Settings, PanelLeftClose, PanelLeftOpen, Landmark, Users,
  BarChart3, CreditCard, TrendingUp,
} from "lucide-react";
import { useUser } from "@/lib/contexts/UserContext";
import { UserAvatar } from "@/components/UserAvatar";
import type { UserRole } from "@/lib/types/database";

const allRoles: UserRole[] = ["super_admin", "company_admin", "accountant", "auditor"];

const menuItems = [
  { label: "Dashboard",        icon: LayoutDashboard, path: "/en/dashboard",   roles: allRoles },
  { label: "Open Banking",     icon: Landmark,        path: "/en/bank",        roles: allRoles },
  { label: "Credit Report",    icon: CreditCard,      path: "/en/credit",      roles: allRoles },
  { label: "Benchmarking",     icon: BarChart3,       path: "/en/benchmarks",  roles: allRoles },
  { label: "Statements",       icon: FileText,        path: "/en/statements",  roles: allRoles },
  { label: "Analytics",        icon: TrendingUp,      path: "/en/analytics",   roles: allRoles },
  { label: "Company",          icon: Building2,       path: "/en/company",     roles: ["super_admin","company_admin"] as UserRole[] },
  { label: "Team",             icon: Users,           path: "/en/users",       roles: ["super_admin","company_admin"] as UserRole[] },
  { label: "Settings",         icon: Settings,        path: "/en/settings",    roles: allRoles },
];

const roleLabels: Record<UserRole, string> = {
  super_admin:   "System Admin",
  company_admin: "Company Admin",
  accountant:    "Accountant",
  auditor:       "Auditor",
};

export function SidebarEn({
  collapsed, onToggleCollapse, mobileOpen, onMobileOpenChange,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  const visibleMenuItems = menuItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : true
  );

  const SidebarContent = () => (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className={`shrink-0 border-b border-[var(--border)] ${collapsed ? "p-3" : "p-6"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[var(--primary)]">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-[var(--foreground)]">
                {user?.companies?.name || user?.companies?.name_ar || "Raka'ez Platform"}
              </h1>
              <p className="text-xs text-[var(--muted-foreground)]">Open Banking for SMEs</p>
            </div>
          )}
        </div>
        {!collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="mt-4 hidden w-full items-center justify-between rounded-[14px] border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2.5 text-[var(--foreground)] shadow-[var(--shadow-soft)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] lg:flex"
          >
            <span className="text-sm font-medium">Collapse</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--muted)] text-[var(--muted-foreground)]">
              <PanelLeftClose className="h-4 w-4" />
            </span>
          </button>
        ) : (
          <div className="mt-4 hidden justify-center lg:flex">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--foreground)] shadow-[var(--shadow-soft)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className={`shrink-0 border-b border-[var(--border)] ${collapsed ? "p-3" : "p-4"}`}>
        <div className={`flex items-center rounded-[16px] border border-[var(--border)] bg-[var(--surface)] ${collapsed ? "justify-center p-2.5" : "gap-3 p-3"}`}>
          {user ? (
            <>
              <UserAvatar user={user} className="h-10 w-10" textClassName="text-sm" alt={`${user.first_name} ${user.last_name}`} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--foreground)] text-sm truncate">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{roleLabels[user.role]}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
                <span className="text-sm font-bold">?</span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--foreground)] text-sm">Guest</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Not signed in</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <nav
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-thin ${collapsed ? "p-2.5" : "p-4"}`}
      >
        <ul className="space-y-1">
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={() => onMobileOpenChange(false)}
                  title={item.label}
                  className={`flex items-center rounded-[10px] transition-all ${
                    isActive
                      ? "bg-[var(--primary)] text-white shadow-[var(--shadow-soft)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--primary)]"
                  } ${collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3"}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 lg:hidden" onClick={() => onMobileOpenChange(false)} />
      )}
      <aside
        className={`fixed inset-y-0 start-0 z-[80] flex h-dvh w-[min(86vw,20rem)] max-w-full transform flex-col overflow-hidden border-e border-[var(--border)] bg-[color:color-mix(in_srgb,var(--background)_72%,transparent)] backdrop-blur-xl transition-transform lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>
      <aside
        className={`hidden overflow-hidden border-e border-[var(--border)] bg-[color:color-mix(in_srgb,var(--background)_76%,transparent)] backdrop-blur-xl lg:fixed lg:inset-y-0 lg:start-0 lg:flex lg:h-screen lg:flex-col ${collapsed ? "lg:w-20" : "lg:w-72"}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
