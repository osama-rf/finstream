"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Landmark, FileText, CheckCircle, Upload, TrendingUp,
  TrendingDown, ArrowLeftRight, Clock, AlertCircle, CheckCheck,
} from "lucide-react";
import { useUser } from "@/lib/contexts/UserContext";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import { AgentPanel } from "@/components/AgentPanel";

const stats = [
  { label: "إجمالي الإيرادات", value: 2_847_500, change: "+12.4%", up: true, icon: TrendingUp, color: "var(--success)" },
  { label: "إجمالي المصروفات", value: 1_923_200, change: "+3.1%", up: false, icon: TrendingDown, color: "var(--destructive)" },
  { label: "صافي الربح", value: 924_300, change: "+28.7%", up: true, icon: ArrowLeftRight, color: "var(--primary)" },
  { label: "معاملات معلقة", value: 14, change: "بانتظار التصنيف", up: null, icon: Clock, color: "var(--warning)" },
];

const recentTransactions = [
  { id: "1", desc: "فاتورة موردين - شركة التقنية", amount: -45000, date: "2026-06-01", category: "مصروفات تشغيلية", status: "مصنف" },
  { id: "2", desc: "إيراد عملاء - مشروع الرياض", amount: 180000, date: "2026-05-31", category: "إيرادات", status: "مصنف" },
  { id: "3", desc: "رواتب شهر مايو", amount: -92000, date: "2026-05-30", category: "رواتب", status: "مصنف" },
  { id: "4", desc: "إيجار مكتب جدة", amount: -28000, date: "2026-05-29", category: "غير مصنف", status: "معلق" },
  { id: "5", desc: "عمولة خدمات استشارية", amount: 65000, date: "2026-05-28", category: "غير مصنف", status: "معلق" },
];

const filingStatus = [
  { label: "قوائم معتمدة جاهزة للإيداع", count: 2, variant: "success" as const },
  { label: "موافقات معلقة", count: 3, variant: "warning" as const },
  { label: "إيداعات مكتملة هذا العام", count: 1, variant: "default" as const },
];

export default function DashboardPage() {
  const { user } = useUser();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 17 ? "مساء الخير" : "مساء النور";

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic md:text-3xl">
          {greeting}، {user?.first_name}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] font-arabic">
          ملخص الوضع المالي للشركة — يونيو 2026
        </p>
      </div>

      {/* AI Pipeline banner */}
      <div className="rounded-[16px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_6%,transparent)] px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary)] text-white">
              <Landmark className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--foreground)] font-arabic">
                14 معاملة بنكية جديدة بانتظار التصنيف
              </p>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                آخر مزامنة: منذ 2 ساعة — الذكاء الاصطناعي جاهز للتصنيف التلقائي
              </p>
            </div>
          </div>
          <Link href="/bank">
            <Button size="sm" className="shrink-0 font-arabic">مراجعة وتصنيف</Button>
          </Link>
        </div>
      </div>

      {/* AI Agent Panel */}
      <AgentPanel userRole={user?.role ?? "accountant"} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-[12px]"
                    style={{ background: `color-mix(in srgb, ${stat.color} 14%, transparent)` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: stat.color }} />
                  </div>
                  {stat.up !== null && (
                    <span
                      className="text-xs font-medium font-arabic"
                      style={{ color: stat.up ? "var(--success)" : "var(--destructive)" }}
                    >
                      {stat.change}
                    </span>
                  )}
                </div>
                <p
                  className="text-xl font-bold tabular-nums"
                  style={{ color: stat.color }}
                  dir="ltr"
                >
                  {typeof stat.value === "number" && stat.label !== "معاملات معلقة"
                    ? formatCurrency(stat.value)
                    : stat.value}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{stat.label}</p>
                {stat.up === null && (
                  <p className="mt-0.5 text-[11px] text-[var(--warning)] font-arabic">{stat.change}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">

        {/* Recent transactions */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
                <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">آخر المعاملات البنكية</h2>
              </div>
              <Link href="/bank" className="text-xs text-[var(--primary)] font-arabic hover:underline">
                عرض الكل
              </Link>
            </div>
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black"
                      style={{
                        background: tx.amount > 0 ? "color-mix(in srgb, var(--success) 14%, transparent)" : "color-mix(in srgb, var(--destructive) 12%, transparent)",
                        color: tx.amount > 0 ? "var(--success)" : "var(--destructive)",
                      }}
                    >
                      {tx.amount > 0 ? "+" : "-"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--foreground)] font-arabic">{tx.desc}</p>
                      <p className="text-xs text-[var(--muted-foreground)] font-arabic">{tx.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={tx.status === "مصنف" ? "success" : "warning"} className="font-arabic text-[11px]">
                      {tx.status}
                    </Badge>
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: tx.amount > 0 ? "var(--success)" : "var(--destructive)" }}
                      dir="ltr"
                    >
                      {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filing & approvals status */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[var(--border)]" />
                <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">حالة الإيداع</h2>
              </div>
              <div className="space-y-3">
                {filingStatus.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                    <span className="text-sm text-[var(--foreground)] font-arabic">{item.label}</span>
                    <Badge variant={item.variant} className="font-arabic">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
    </div>
  );
}
