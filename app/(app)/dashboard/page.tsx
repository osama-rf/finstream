"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Landmark, FileText, BarChart3, CreditCard,
  TrendingUp, TrendingDown, CheckCircle2, AlertCircle,
  ArrowUpRight, RefreshCw, Building2, Wallet,
  ShieldCheck, Link2Off,
} from "lucide-react";
import { useUser } from "@/lib/contexts/UserContext";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import { AgentPanel } from "@/components/AgentPanel";

const bankConnections = [
  { name: "بنك الراجحي", balance: 1_840_000, status: "connected", lastSync: "منذ ساعتين", color: "#006838" },
  { name: "البنك الأهلي", balance: 620_500, status: "connected", lastSync: "منذ 4 ساعات", color: "#00574B" },
  { name: "STC Pay", balance: 98_200, status: "connected", lastSync: "منذ ساعة", color: "#7B2D8B" },
  { name: "بنك الرياض", balance: 0, status: "disconnected", lastSync: null, color: "#C8102E" },
];

const connectedBanks = bankConnections.filter(b => b.status === "connected");
const totalBalance = connectedBanks.reduce((s, b) => s + b.balance, 0);

const kpis = [
  { label: "إجمالي الأرصدة المجمّعة", value: totalBalance, unit: "SAR", change: "+8.3%", up: true, icon: Wallet, color: "var(--primary)" },
  { label: "صافي الإيرادات (30 يوم)", value: 847_500, unit: "SAR", change: "+12.4%", up: true, icon: TrendingUp, color: "var(--success)" },
  { label: "إجمالي المصروفات (30 يوم)", value: 423_200, unit: "SAR", change: "+3.1%", up: false, icon: TrendingDown, color: "var(--destructive)" },
  { label: "التصنيف الائتماني", value: "A-", unit: "", change: "جيد", up: null, icon: ShieldCheck, color: "var(--primary)" },
];

const benchmarkTeaser = [
  { label: "هامش الربح", company: 32, sector: 24, unit: "%" },
  { label: "نسبة السيولة", company: 1.8, sector: 1.5, unit: "x" },
  { label: "معدل دوران المديونية", company: 42, sector: 55, unit: "يوم" },
];

const quickActions = [
  { label: "توليد تقرير ائتماني", icon: CreditCard, href: "/credit", highlight: true },
  { label: "مقارنة القطاع", icon: BarChart3, href: "/benchmarks" },
  { label: "إنشاء قوائم مالية بالـ AI", icon: FileText, href: "/statements" },
  { label: "ربط بنك جديد", icon: Landmark, href: "/bank" },
];

export default function DashboardPage() {
  const { user } = useUser();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 17 ? "مساء الخير" : "مساء النور";

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      {/* Greeting */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic md:text-3xl">
          {greeting}، {user?.first_name}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] font-arabic">
          نظرة عامة على وضع منشأتك المالي — يونيو 2026
        </p>
      </div>

      {/* Credit readiness banner */}
      <div className="rounded-[16px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_6%,transparent)] px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary)] text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--foreground)] font-arabic">
                تقريرك الائتماني جاهز للمشاركة مع البنوك
              </p>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                تصنيف A- · 3 بنوك مربوطة · آخر تحديث: اليوم
              </p>
            </div>
          </div>
          <Link href="/credit">
            <Button size="sm" className="shrink-0 font-arabic gap-2">
              <CreditCard className="h-4 w-4" />
              عرض التقرير
            </Button>
          </Link>
        </div>
      </div>

      {/* AI Agent Panel */}
      <AgentPanel userRole={user?.role ?? "company_admin"} />

      {/* KPI stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-3 sm:p-5">
                <div className="mb-2 flex items-center justify-between sm:mb-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-[10px] sm:h-9 sm:w-9 sm:rounded-[12px]"
                    style={{ background: `color-mix(in srgb, ${kpi.color} 14%, transparent)` }}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: kpi.color }} />
                  </div>
                  {kpi.up !== null && (
                    <span
                      className="text-[10px] font-medium font-arabic sm:text-xs"
                      style={{ color: kpi.up ? "var(--success)" : "var(--destructive)" }}
                    >
                      {kpi.change}
                    </span>
                  )}
                </div>
                <p
                  className="text-sm font-bold tabular-nums leading-tight break-all sm:text-xl"
                  style={{ color: kpi.color }}
                  dir="ltr"
                >
                  {kpi.unit === "SAR" ? formatCurrency(kpi.value as number) : kpi.value}
                </p>
                <p className="mt-1 text-[10px] text-[var(--muted-foreground)] font-arabic leading-snug sm:text-xs">{kpi.label}</p>
                {kpi.up === null && (
                  <p className="mt-0.5 text-[10px] text-[var(--success)] font-arabic sm:text-[11px]">{kpi.change}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">

        {/* Bank connections */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
                <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">مصادر البيانات المربوطة</h2>
              </div>
              <Link href="/bank" className="text-xs text-[var(--primary)] font-arabic hover:underline flex items-center gap-1">
                إدارة الربط
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {bankConnections.map((bank) => (
                <div key={bank.name} className="flex items-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 sm:px-4 sm:py-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold sm:h-9 sm:w-9"
                    style={{ background: bank.color }}
                  >
                    {bank.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--foreground)] font-arabic truncate sm:text-sm">{bank.name}</p>
                    {bank.lastSync ? (
                      <p className="text-[10px] text-[var(--muted-foreground)] font-arabic flex items-center gap-1 sm:text-xs">
                        <RefreshCw className="h-2.5 w-2.5" />
                        {bank.lastSync}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[var(--destructive)] font-arabic flex items-center gap-1 sm:text-xs">
                        <Link2Off className="h-2.5 w-2.5" />
                        غير مربوط
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {bank.status === "connected" ? (
                      <>
                        <span className="text-xs font-bold tabular-nums text-[var(--foreground)] sm:text-sm" dir="ltr">
                          {formatCurrency(bank.balance)}
                        </span>
                        <Badge variant="success" className="font-arabic text-[10px] hidden sm:inline-flex">مربوط</Badge>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" className="font-arabic text-xs h-7 px-2 sm:px-3">ربط</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-[12px] border-2 border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_5%,transparent)] px-3 py-2.5 sm:mt-4 sm:px-4 sm:py-3">
              <span className="text-xs font-bold text-[var(--foreground)] font-arabic sm:text-sm">إجمالي الأرصدة المجمّعة</span>
              <span className="text-sm font-black text-[var(--primary)] tabular-nums sm:text-base" dir="ltr">{formatCurrency(totalBalance)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* Benchmark teaser */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
                  <h2 className="text-sm font-bold text-[var(--foreground)] font-arabic">مقارنة بمتوسط القطاع</h2>
                </div>
                <Link href="/benchmarks" className="text-xs text-[var(--primary)] font-arabic hover:underline">
                  تفاصيل
                </Link>
              </div>
              <div className="space-y-3">
                {benchmarkTeaser.map((item) => {
                  const pct = Math.min(100, Math.round((item.company / (item.sector * 1.5)) * 100));
                  const isGood = item.label === "معدل دوران المديونية"
                    ? item.company < item.sector
                    : item.company >= item.sector;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--muted-foreground)] font-arabic">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--foreground)] tabular-nums" dir="ltr">
                            {item.company}{item.unit}
                          </span>
                          {isGood
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />
                            : <AlertCircle className="h-3.5 w-3.5 text-[var(--warning)]" />
                          }
                        </div>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                        <div
                          className="absolute inset-y-0 start-0 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: isGood ? "var(--success)" : "var(--warning)",
                          }}
                        />
                        {/* sector avg marker */}
                        <div
                          className="absolute top-0 h-full w-0.5 bg-[var(--muted-foreground)]/40"
                          style={{ insetInlineStart: `${Math.round((item.sector / (item.sector * 1.5)) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-[var(--muted-foreground)] font-arabic mt-0.5">
                        متوسط القطاع: {item.sector}{item.unit}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[var(--border)]" />
                <h2 className="text-sm font-bold text-[var(--foreground)] font-arabic">إجراءات سريعة</h2>
              </div>
              <div className="space-y-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.label} href={action.href}>
                      <div className={`flex items-center gap-3 rounded-[12px] border px-4 py-3 transition-colors hover:bg-[var(--surface)] ${action.highlight ? "border-[var(--primary)]/30 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)]" : "border-[var(--border)] bg-[var(--card)]"}`}>
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--border)] ${action.highlight ? "bg-[var(--primary)] text-white" : "bg-[var(--surface)] text-[var(--muted-foreground)]"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium font-arabic text-[var(--foreground)]">{action.label}</span>
                        {action.highlight && (
                          <ArrowUpRight className="h-4 w-4 text-[var(--primary)] ms-auto" />
                        )}
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
