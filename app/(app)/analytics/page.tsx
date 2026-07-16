"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, TrendingDown, Wallet, BarChart3,
  ArrowUpRight, ArrowDownRight, Download, Flame, AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";
import { ANALYTICS_OVERVIEW } from "@/lib/mock";
import { MiniBarsChart } from "@/components/shared/MiniBarsChart";

// ─── Data ─────────────────────────────────────────────────────────────────────

const periods = ["Q1 2026", "Q2 2025", "Q3 2025", "Q4 2025", "2025 كامل"];

const monthlyData = ANALYTICS_OVERVIEW.monthlySeries.map(m => ({ month: m.label, revenue: m.revenue, expenses: m.expense }));

const expenseBreakdown = ANALYTICS_OVERVIEW.expenseBreakdown.map(e => ({
  label: e.label, amount: Math.round((e.pct / 100) * 2_343_200), pct: e.pct, color: e.color,
}));

const revenueBySource = ANALYTICS_OVERVIEW.revenueBySource.map(r => ({
  label: r.label, amount: Math.round((r.pct / 100) * ANALYTICS_OVERVIEW.totalRevenueQuarter), pct: r.pct, color: r.color,
}));

const kpis = [
  { label: "إجمالي الإيرادات",  value: 4_282_500, change: "+18.4%", up: true,  color: "var(--primary)",     icon: Wallet    },
  { label: "إجمالي المصروفات",  value: 2_343_200, change: "+8.2%",  up: false, color: "var(--destructive)", icon: TrendingDown },
  { label: "صافي الربح",        value: 1_939_300, change: "+31.2%", up: true,  color: "var(--success)",     icon: TrendingUp },
  { label: "هامش الربح الصافي", value: "45.3%",   change: "+4.9%",  up: true,  color: "var(--success)",     icon: BarChart3  },
];

// ─── Bar chart component ───────────────────────────────────────────────────────

function BarChartSection({ data }: { data: typeof monthlyData }) {
  const maxVal = Math.max(...data.flatMap(d => [d.revenue, d.expenses]));
  const heightPx = 160;

  return (
    <div className="mt-4">
      {/* Bars */}
      <div className="flex items-end justify-between gap-1 sm:gap-2" style={{ height: heightPx }}>
        {data.map(d => {
          const revH = Math.round((d.revenue  / maxVal) * heightPx);
          const expH = Math.round((d.expenses / maxVal) * heightPx);
          return (
            <div key={d.month} className="flex flex-1 flex-col items-center gap-0.5">
              <div className="flex items-end gap-0.5 sm:gap-1 w-full justify-center">
                <div
                  className="flex-1 max-w-[18px] rounded-t-[4px] sm:max-w-[28px] sm:rounded-t-[6px] transition-all"
                  style={{ height: revH, background: "var(--primary)", opacity: 0.9 }}
                  title={`إيرادات: ${formatCurrency(d.revenue)}`}
                />
                <div
                  className="flex-1 max-w-[18px] rounded-t-[4px] sm:max-w-[28px] sm:rounded-t-[6px] transition-all"
                  style={{ height: expH, background: "var(--destructive)", opacity: 0.7 }}
                  title={`مصروفات: ${formatCurrency(d.expenses)}`}
                />
              </div>
              <span className="text-[9px] text-[var(--muted-foreground)] font-arabic mt-1 sm:text-[10px]">{d.month}</span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--primary)" }} />
          <span className="text-xs text-[var(--muted-foreground)] font-arabic">الإيرادات</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--destructive)", opacity: 0.7 }} />
          <span className="text-xs text-[var(--muted-foreground)] font-arabic">المصروفات</span>
        </div>
      </div>
    </div>
  );
}

// ─── Donut chart (CSS-based) ──────────────────────────────────────────────────

function DonutChart({ slices, size = 140 }: {
  slices: { pct: number; color: string }[];
  size?: number;
}) {
  let cumulative = 0;
  const r = size / 2 - 16;
  const circ = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {slices.map((s, i) => {
        const offset = circ - (s.pct / 100) * circ;
        const rotation = (cumulative / 100) * 360 - 90;
        cumulative += s.pct;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={i === 0 ? 22 : 18}
            strokeDasharray={`${circ}`}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "center" }}
          />
        );
      })}
      <circle cx={size / 2} cy={size / 2} r={r - 14} fill="var(--card)" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("Q1 2026");

  const totalRevenue  = revenueBySource.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenseBreakdown.reduce((s, e) => s + e.amount, 0);
  const netProfit     = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">التحليل المالي</h1>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-arabic text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
          >
            {periods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <Button variant="outline" size="sm" className="font-arabic gap-2"
            onClick={() => toast.success("تم تصدير التقرير بصيغة PDF")}>
            <Download className="h-4 w-4" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Burn rate banner */}
      <Card className="bg-gradient-to-l from-[color:color-mix(in_srgb,var(--primary)_6%,transparent)] to-[var(--card)]">
        <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--destructive)_12%,transparent)]">
              <Flame className="h-5 w-5 text-[var(--destructive)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic">معدل الاستنزاف الشهري</p>
              <p className="text-xl font-bold text-[var(--foreground)] tabular-nums" dir="ltr">{formatCurrency(ANALYTICS_OVERVIEW.burnRatePerMonth)} / شهر</p>
            </div>
          </div>
          <div className="text-end">
            <p className="text-xs text-[var(--muted-foreground)] font-arabic">مدار نقدي متوقّع</p>
            <p className="text-sm font-bold text-[var(--foreground)] font-arabic">{ANALYTICS_OVERVIEW.projectedRunwayMonths} أشهر</p>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-3 sm:p-5">
                <div className="mb-2 flex items-center justify-between sm:mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[10px] sm:h-9 sm:w-9 sm:rounded-[12px]"
                    style={{ background: `color-mix(in srgb, ${kpi.color} 12%, transparent)` }}>
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: kpi.color }} />
                  </div>
                  <div className="flex items-center gap-1">
                    {kpi.up
                      ? <ArrowUpRight className="h-3 w-3 text-[var(--success)]" />
                      : <ArrowDownRight className="h-3 w-3 text-[var(--destructive)]" />}
                    <span className="text-[10px] font-bold sm:text-xs"
                      style={{ color: kpi.up ? "var(--success)" : "var(--destructive)" }}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-bold tabular-nums leading-tight break-all sm:text-xl"
                  style={{ color: kpi.color }} dir="ltr">
                  {typeof kpi.value === "number" ? formatCurrency(kpi.value) : kpi.value}
                </p>
                <p className="mt-1 text-[10px] text-[var(--muted-foreground)] font-arabic leading-snug sm:text-xs">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue vs Expenses chart */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--foreground)] font-arabic flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
              الإيرادات مقابل المصروفات
            </h2>
            <Badge variant="secondary" className="font-arabic text-xs">{period}</Badge>
          </div>
          <BarChartSection data={monthlyData} />
        </CardContent>
      </Card>

      {/* Expense breakdown + Revenue by source */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Expense breakdown */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[var(--destructive)]" />
              توزيع المصروفات
            </h2>
            <div className="flex items-center gap-4">
              <DonutChart
                slices={expenseBreakdown.map(e => ({ pct: e.pct, color: e.color }))}
                size={120}
              />
              <div className="flex-1 space-y-2">
                {expenseBreakdown.map(e => (
                  <div key={e.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: e.color }} />
                      <span className="text-xs text-[var(--foreground)] font-arabic truncate">{e.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums" dir="ltr">{formatCurrency(e.amount)}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-arabic">{e.pct}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
              <span className="text-sm font-bold text-[var(--foreground)] font-arabic">الإجمالي</span>
              <span className="text-sm font-bold text-[var(--destructive)] tabular-nums" dir="ltr">{formatCurrency(totalExpenses)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by source */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
              الإيرادات حسب المصدر
            </h2>
            <div className="space-y-3">
              {revenueBySource.map(r => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-[var(--foreground)] font-arabic">{r.label}</span>
                    <span className="font-bold text-[var(--foreground)]">{r.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
              <span className="text-sm font-bold text-[var(--foreground)] font-arabic">إجمالي الإيرادات</span>
              <span className="text-sm font-bold text-[var(--primary)] tabular-nums" dir="ltr">{formatCurrency(totalRevenue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net profit trend */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-[var(--success)]" />
            اتجاه صافي الربح الشهري
          </h2>
          <MiniBarsChart
            data={ANALYTICS_OVERVIEW.netProfitTrend.map(m => ({ label: m.label, value: m.revenue }))}
            formatValue={formatCurrency}
          />
          <div className="mt-4 rounded-[12px] border border-[var(--success)]/20 bg-[color:color-mix(in_srgb,var(--success)_6%,transparent)] px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-[var(--muted-foreground)] font-arabic">إجمالي صافي الربح — {period}</p>
            <span className="text-lg font-black text-[var(--success)] tabular-nums" dir="ltr">{formatCurrency(netProfit)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Anomaly detection */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4">كشف شذوذ تلقائي</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ANALYTICS_OVERVIEW.anomalies.map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)] font-arabic">{a.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-0.5">{a.sub}</p>
                </div>
                <Badge variant={a.severity === "warning" ? "warning" : "destructive"} className="font-arabic shrink-0">
                  {a.severity === "warning" ? "تحقّق" : "انتبه"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
