"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, TrendingDown, Wallet, BarChart3,
  ArrowUpRight, ArrowDownRight, Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";

// ─── Data ─────────────────────────────────────────────────────────────────────

const periods = ["Q1 2026", "Q2 2025", "Q3 2025", "Q4 2025", "2025 كامل"];

const monthlyData = [
  { month: "يناير",  revenue: 580_000, expenses: 310_000 },
  { month: "فبراير", revenue: 620_000, expenses: 290_000 },
  { month: "مارس",   revenue: 695_000, expenses: 340_000 },
  { month: "أبريل",  revenue: 730_000, expenses: 365_000 },
  { month: "مايو",   revenue: 810_000, expenses: 390_000 },
  { month: "يونيو",  revenue: 847_500, expenses: 423_200 },
];

const expenseBreakdown = [
  { label: "تكلفة الخدمات",         amount: 980_000, pct: 42, color: "#6366f1" },
  { label: "رواتب وأجور",           amount: 420_000, pct: 18, color: "#8b5cf6" },
  { label: "إدارية وعمومية",         amount: 450_000, pct: 19, color: "#a78bfa" },
  { label: "تسويق ومبيعات",          amount:  73_200, pct:  3, color: "#c4b5fd" },
  { label: "استضافة وتقنية",         amount:  38_000, pct:  2, color: "#ddd6fe" },
  { label: "أخرى",                   amount: 381_800, pct: 16, color: "#ede9fe" },
];

const revenueBySource = [
  { label: "خدمات استشارية",    amount: 1_250_000, pct: 44, color: "var(--primary)" },
  { label: "مشاريع تقنية",      amount:   897_500, pct: 32, color: "var(--success)" },
  { label: "تدريب وورش عمل",    amount:   420_000, pct: 15, color: "var(--warning)" },
  { label: "تراخيص برمجيات",    amount:   280_000, pct:  9, color: "var(--destructive)" },
];

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
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">التحليل المالي</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">
            تحليل الإيرادات والمصروفات وتوزيعها من بيانات بنوكك المربوطة
          </p>
        </div>
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
          <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-1">شهرياً · مجمّع من جميع البنوك المربوطة</p>
          <BarChartSection data={monthlyData} />

          {/* Summary row */}
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-4">
            {[
              { label: "إجمالي الإيرادات",  value: monthlyData.reduce((s,d)=>s+d.revenue,0),  color: "var(--primary)"    },
              { label: "إجمالي المصروفات",  value: monthlyData.reduce((s,d)=>s+d.expenses,0), color: "var(--destructive)" },
              { label: "صافي الربح",         value: monthlyData.reduce((s,d)=>s+d.revenue-d.expenses,0), color: "var(--success)" },
            ].map(s => (
              <div key={s.label} className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                <p className="text-[10px] text-[var(--muted-foreground)] font-arabic sm:text-xs">{s.label}</p>
                <p className="text-sm font-bold tabular-nums mt-0.5 sm:text-base" style={{ color: s.color }} dir="ltr">
                  {formatCurrency(s.value)}
                </p>
              </div>
            ))}
          </div>
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
            <div className="flex items-center gap-4">
              <DonutChart
                slices={revenueBySource.map(r => ({ pct: r.pct, color: r.color }))}
                size={120}
              />
              <div className="flex-1 space-y-2">
                {revenueBySource.map(r => (
                  <div key={r.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: r.color }} />
                      <span className="text-xs text-[var(--foreground)] font-arabic truncate">{r.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums" dir="ltr">{formatCurrency(r.amount)}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-arabic">{r.pct}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
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
          <div className="space-y-2">
            {monthlyData.map(d => {
              const profit = d.revenue - d.expenses;
              const maxProfit = Math.max(...monthlyData.map(x => x.revenue - x.expenses));
              const pct = Math.round((profit / maxProfit) * 100);
              return (
                <div key={d.month} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[var(--foreground)] font-arabic w-12 shrink-0">{d.month}</span>
                  <div className="flex-1 h-6 rounded-[6px] bg-[var(--muted)] overflow-hidden">
                    <div
                      className="h-full rounded-[6px] flex items-center ps-2 transition-all"
                      style={{ width: `${pct}%`, background: "color-mix(in srgb, var(--success) 80%, transparent)" }}>
                    </div>
                  </div>
                  <span className="text-xs font-bold tabular-nums text-[var(--success)] w-24 text-end shrink-0" dir="ltr">
                    {formatCurrency(profit)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-[12px] border border-[var(--success)]/20 bg-[color:color-mix(in_srgb,var(--success)_6%,transparent)] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic">إجمالي صافي الربح — {period}</p>
              <p className="text-lg font-black text-[var(--success)] tabular-nums" dir="ltr">{formatCurrency(netProfit)}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-5 w-5 text-[var(--success)]" />
              <span className="text-sm font-bold text-[var(--success)] font-arabic">+31.2% مقارنة بالعام الماضي</span>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
