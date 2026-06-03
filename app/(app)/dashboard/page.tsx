"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PipelineTracker } from "@/components/PipelineTracker";
import { AgentPanel } from "@/components/AgentPanel";
import {
  Landmark, FileText, CheckCircle, Upload, TrendingUp, TrendingDown,
  ArrowLeftRight, AlertCircle,
} from "lucide-react";
import { useUser } from "@/lib/contexts/UserContext";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils/format";

interface DashboardSummary {
  current_balance: number;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  unclassified_count: number;
  recent_transactions: any[];
}

const filingStatus = [
  { label: "قوائم معتمدة جاهزة للإيداع", count: 2, variant: "success" as const },
  { label: "موافقات معلقة", count: 3, variant: "warning" as const },
  { label: "إيداعات مكتملة هذا العام", count: 1, variant: "default" as const },
];

export default function DashboardPage() {
  const { user } = useUser();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 17 ? "مساء الخير" : "مساء النور";

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then((json) => { if (json.success) setSummary(json.data); })
      .catch(() => {});
  }, []);

  const kpis = [
    {
      label: "الرصيد الحالي",
      value: summary?.current_balance ?? 0,
      change: null,
      icon: Landmark,
      color: "var(--primary)",
    },
    {
      label: "إجمالي الإيرادات",
      value: summary?.total_revenue ?? 0,
      change: "+12.4%",
      up: true,
      icon: TrendingUp,
      color: "var(--success)",
    },
    {
      label: "إجمالي المصروفات",
      value: summary?.total_expenses ?? 0,
      change: "+3.1%",
      up: false,
      icon: TrendingDown,
      color: "var(--destructive)",
    },
    {
      label: "معاملات غير مصنفة",
      value: summary?.unclassified_count ?? 0,
      change: null,
      icon: AlertCircle,
      color: (summary?.unclassified_count ?? 0) > 0 ? "var(--warning)" : "var(--success)",
      isCount: true,
      href: "/bank",
    },
  ];

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic md:text-3xl">
          {greeting}، {user?.first_name}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] font-arabic">
          ملخص الوضع المالي للشركة
        </p>
      </div>

      {/* Pipeline Tracker */}
      <PipelineTracker />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const card = (
            <Card className={kpi.href ? "cursor-pointer hover:border-[var(--primary)] transition-colors" : ""}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-[12px]"
                    style={{ background: `color-mix(in srgb, ${kpi.color} 14%, transparent)` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: kpi.color }} />
                  </div>
                  {kpi.change && (
                    <span className="text-xs font-medium" style={{ color: (kpi as any).up ? "var(--success)" : "var(--destructive)" }}>
                      {kpi.change}
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold tabular-nums" style={{ color: kpi.color }} dir="ltr">
                  {kpi.isCount ? kpi.value : (summary ? formatCurrency(kpi.value) : "—")}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{kpi.label}</p>
                {kpi.isCount && (kpi.value as number) > 0 && (
                  <p className="mt-0.5 text-[11px] text-[var(--warning)] font-arabic">بانتظار التصنيف</p>
                )}
              </CardContent>
            </Card>
          );

          return kpi.href ? (
            <Link key={kpi.label} href={kpi.href}>{card}</Link>
          ) : (
            <div key={kpi.label}>{card}</div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
        {/* Recent transactions */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
                <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">آخر المعاملات البنكية</h2>
              </div>
              <Link href="/bank" className="text-xs text-[var(--primary)] font-arabic hover:underline">عرض الكل</Link>
            </div>
            <div className="space-y-2">
              {(summary?.recent_transactions?.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Landmark className="h-8 w-8 text-[var(--muted-foreground)]" />
                  <p className="text-sm text-[var(--muted-foreground)] font-arabic">لا توجد معاملات بعد</p>
                  <Link href="/bank">
                    <Button size="sm" className="font-arabic">ربط حسابك البنكي</Button>
                  </Link>
                </div>
              ) : (
                summary!.recent_transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black"
                        style={{
                          background: tx.type === "credit" ? "color-mix(in srgb, var(--success) 14%, transparent)" : "color-mix(in srgb, var(--destructive) 12%, transparent)",
                          color: tx.type === "credit" ? "var(--success)" : "var(--destructive)",
                        }}
                      >
                        {tx.type === "credit" ? "+" : "-"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--foreground)] font-arabic">{tx.description}</p>
                        <p className="text-xs text-[var(--muted-foreground)] font-arabic">{formatDate(tx.transaction_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={tx.is_reconciled ? "success" : "warning"} className="font-arabic text-[11px]">
                        {tx.is_reconciled ? "مصنف" : "معلق"}
                      </Badge>
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{ color: tx.type === "credit" ? "var(--success)" : "var(--destructive)" }}
                        dir="ltr"
                      >
                        {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side column */}
        <div className="space-y-4">
          {/* Filing status */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[var(--border)]" />
                <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">حالة الإيداع</h2>
              </div>
              <div className="space-y-2">
                {filingStatus.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                    <span className="text-sm text-[var(--foreground)] font-arabic">{item.label}</span>
                    <Badge variant={item.variant} className="font-arabic">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[var(--border)]" />
                <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">إجراءات سريعة</h2>
              </div>
              <div className="space-y-2">
                {[
                  { label: "مزامنة البيانات البنكية", icon: Landmark, href: "/bank" },
                  { label: "إنشاء قائمة مالية", icon: FileText, href: "/statements" },
                  { label: "مراجعة الموافقات", icon: CheckCircle, href: "/approvals" },
                  { label: "إيداع لدى وزارة التجارة", icon: Upload, href: "/filings" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.label} href={item.href}>
                      <div className="flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition-colors hover:bg-[var(--surface)]">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium font-arabic text-[var(--foreground)]">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agent Panel */}
      <AgentPanel userRole={user?.role ?? "accountant"} />
    </div>
  );
}
