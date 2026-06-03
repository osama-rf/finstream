"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Landmark, FileText, CheckCircle, Upload, TrendingUp, TrendingDown, ArrowLeftRight, Clock } from "lucide-react";
import { useUser } from "@/lib/contexts/UserContext";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import { AgentPanel } from "@/components/AgentPanel";

const stats = [
  { label: "Total Revenue",    value: 2_847_500, change: "+12.4%", up: true,  icon: TrendingUp,       color: "var(--success)" },
  { label: "Total Expenses",   value: 1_923_200, change: "+3.1%",  up: false, icon: TrendingDown,     color: "var(--destructive)" },
  { label: "Net Profit",       value: 924_300,   change: "+28.7%", up: true,  icon: ArrowLeftRight,   color: "var(--primary)" },
  { label: "Pending Items",    value: 14,        change: "Awaiting classification", up: null, icon: Clock, color: "var(--warning)" },
];

const recentTransactions = [
  { id: "1", desc: "Incoming transfer — Al-Naakheel Trading",  amount: 250000,  date: "2026-06-03", status: "Classified" },
  { id: "2", desc: "Cloud hosting invoice — AWS",              amount: -3200,   date: "2026-06-02", status: "Classified" },
  { id: "3", desc: "Staff salaries — June 2026",              amount: -92000,  date: "2026-06-01", status: "Classified" },
  { id: "4", desc: "Outgoing transfer — unknown source",       amount: -45000,  date: "2026-05-31", status: "Pending" },
  { id: "5", desc: "Consulting services revenue — Al-Fajr",    amount: 65000,   date: "2026-05-30", status: "Pending" },
];

export default function DashboardEnPage() {
  const { user } = useUser();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--foreground)] md:text-3xl">
          {greeting}, {user?.first_name}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">Financial overview — June 2026</p>
      </div>

      <AgentPanel userRole={user?.role ?? "accountant"} />

      <div className="rounded-[16px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_6%,transparent)] px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary)] text-white">
              <Landmark className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">14 new bank transactions awaiting classification</p>
              <p className="text-xs text-[var(--muted-foreground)]">Last sync: 2 hours ago — AI ready to auto-classify</p>
            </div>
          </div>
          <Link href="/en/bank">
            <Button size="sm" className="shrink-0">Review & Classify</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[12px]"
                    style={{ background: `color-mix(in srgb, ${stat.color} 14%, transparent)` }}>
                    <Icon className="h-4 w-4" style={{ color: stat.color }} />
                  </div>
                  {stat.up !== null && (
                    <span className="text-xs font-medium" style={{ color: stat.up ? "var(--success)" : "var(--destructive)" }}>
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold tabular-nums" style={{ color: stat.color }} dir="ltr">
                  {typeof stat.value === "number" && stat.label !== "Pending Items"
                    ? formatCurrency(stat.value) : stat.value}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{stat.label}</p>
                {stat.up === null && <p className="mt-0.5 text-[11px] text-[var(--warning)]">{stat.change}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
        <Card>
          <CardContent className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
                <h2 className="text-base font-bold text-[var(--foreground)]">Recent Bank Transactions</h2>
              </div>
              <Link href="/en/bank" className="text-xs text-[var(--primary)] hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black"
                      style={{
                        background: tx.amount > 0 ? "color-mix(in srgb, var(--success) 14%, transparent)" : "color-mix(in srgb, var(--destructive) 12%, transparent)",
                        color: tx.amount > 0 ? "var(--success)" : "var(--destructive)",
                      }}>
                      {tx.amount > 0 ? "+" : "-"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">{tx.desc}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{tx.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={tx.status === "Classified" ? "success" : "warning"} className="text-[11px]">{tx.status}</Badge>
                    <span className="text-sm font-bold tabular-nums" style={{ color: tx.amount > 0 ? "var(--success)" : "var(--destructive)" }}>
                      {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[var(--border)]" />
                <h2 className="text-base font-bold text-[var(--foreground)]">Quick Actions</h2>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Sync Bank Data",             icon: Landmark,     href: "/en/bank" },
                  { label: "Generate Statement",          icon: FileText,     href: "/en/statements" },
                  { label: "Review Approvals",            icon: CheckCircle,  href: "/en/approvals" },
                  { label: "File with Ministry",          icon: Upload,       href: "/en/filings" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.label} href={item.href}>
                      <div className="flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition-colors hover:bg-[var(--surface)]">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-[var(--foreground)]">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
