"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, TrendingDown, Wallet, BarChart3,
  ArrowUpRight, ArrowDownRight, Download, Flame,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";
import { ANALYTICS_OVERVIEW } from "@/lib/mock";
import { MiniBarsChart } from "@/components/shared/MiniBarsChart";

// ─── Data ─────────────────────────────────────────────────────────────────────

const periods = ["Q1 2026", "Q2 2025", "Q3 2025", "Q4 2025", "Full year 2025"];

const monthlyData = ANALYTICS_OVERVIEW.monthlySeries.map(m => ({ month: m.label, revenue: m.revenue, expenses: m.expense }));

const expenseBreakdown = ANALYTICS_OVERVIEW.expenseBreakdown.map(e => ({
  label: e.label, amount: Math.round((e.pct / 100) * 2_343_200), pct: e.pct, color: e.color,
}));

const revenueBySource = ANALYTICS_OVERVIEW.revenueBySource.map(r => ({
  label: r.label, amount: Math.round((r.pct / 100) * ANALYTICS_OVERVIEW.totalRevenueQuarter), pct: r.pct, color: r.color,
}));

const kpis = [
  { label: "Total revenue", value: 4_282_500, change: "+18.4%", up: true, color: "var(--primary)", icon: Wallet },
  { label: "Total expenses", value: 2_343_200, change: "+8.2%", up: false, color: "var(--destructive)", icon: TrendingDown },
  { label: "Net profit", value: 1_939_300, change: "+31.2%", up: true, color: "var(--success)", icon: TrendingUp },
  { label: "Net profit margin", value: "45.3%", change: "+4.9%", up: true, color: "var(--success)", icon: BarChart3 },
];

// ─── Bar chart component ───────────────────────────────────────────────────────

function BarChartSection({ data }: { data: typeof monthlyData }) {
  const maxVal = Math.max(...data.flatMap(d => [d.revenue, d.expenses]));
  const heightPx = 160;

  return (
    <div className="mt-4">
      <div className="flex items-end justify-between gap-1 sm:gap-2" style={{ height: heightPx }}>
        {data.map(d => {
          const revH = Math.round((d.revenue / maxVal) * heightPx);
          const expH = Math.round((d.expenses / maxVal) * heightPx);
          return (
            <div key={d.month} className="flex flex-1 flex-col items-center gap-0.5">
              <div className="flex items-end gap-0.5 sm:gap-1 w-full justify-center">
                <div
                  className="flex-1 max-w-[18px] rounded-t-[4px] sm:max-w-[28px] sm:rounded-t-[6px] transition-all"
                  style={{ height: revH, background: "var(--primary)", opacity: 0.9 }}
                  title={`Revenue: ${formatCurrency(d.revenue)}`}
                />
                <div
                  className="flex-1 max-w-[18px] rounded-t-[4px] sm:max-w-[28px] sm:rounded-t-[6px] transition-all"
                  style={{ height: expH, background: "var(--destructive)", opacity: 0.7 }}
                  title={`Expenses: ${formatCurrency(d.expenses)}`}
                />
              </div>
              <span className="text-[9px] text-[var(--muted-foreground)] mt-1 sm:text-[10px]">{d.month}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--primary)" }} />
          <span className="text-xs text-[var(--muted-foreground)]">Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--destructive)", opacity: 0.7 }} />
          <span className="text-xs text-[var(--muted-foreground)]">Expenses</span>
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

export default function AnalyticsEnPage() {
  const [period, setPeriod] = useState("Q1 2026");

  const totalRevenue = revenueBySource.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenseBreakdown.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Financial Analysis</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Analyze revenue, expenses, and their distribution from your connected bank data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
          >
            {periods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <Button variant="outline" size="sm" className="gap-2"
            onClick={() => toast.success("Report exported as PDF")}>
            <Download className="h-4 w-4" />
            Export
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
              <p className="text-xs text-[var(--muted-foreground)]">Monthly cash burn rate</p>
              <p className="text-xl font-bold text-[var(--foreground)] tabular-nums">{formatCurrency(ANALYTICS_OVERVIEW.burnRatePerMonth)} / month</p>
            </div>
          </div>
          <div className="text-end">
            <Badge variant="default" className="text-[10px]">New</Badge>
            <p className="text-xs text-[var(--muted-foreground)] mt-1.5">Projected runway: {ANALYTICS_OVERVIEW.projectedRunwayMonths} months</p>
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
                  style={{ color: kpi.color }}>
                  {typeof kpi.value === "number" ? formatCurrency(kpi.value) : kpi.value}
                </p>
                <p className="mt-1 text-[10px] text-[var(--muted-foreground)] leading-snug sm:text-xs">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue vs Expenses chart */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
              Revenue vs. Expenses
            </h2>
            <Badge variant="secondary" className="text-xs">{period}</Badge>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mb-1">Monthly · aggregated from all connected banks</p>
          <BarChartSection data={monthlyData} />

          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-4">
            {[
              { label: "Total revenue", value: monthlyData.reduce((s, d) => s + d.revenue, 0), color: "var(--primary)" },
              { label: "Total expenses", value: monthlyData.reduce((s, d) => s + d.expenses, 0), color: "var(--destructive)" },
              { label: "Net profit", value: monthlyData.reduce((s, d) => s + d.revenue - d.expenses, 0), color: "var(--success)" },
            ].map(s => (
              <div key={s.label} className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                <p className="text-[10px] text-[var(--muted-foreground)] sm:text-xs">{s.label}</p>
                <p className="text-sm font-bold tabular-nums mt-0.5 sm:text-base" style={{ color: s.color }}>
                  {formatCurrency(s.value)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expense breakdown + Revenue by source */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[var(--destructive)]" />
              Expense breakdown
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
                      <span className="text-xs text-[var(--foreground)] truncate">{e.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums">{formatCurrency(e.amount)}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{e.pct}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
              <span className="text-sm font-bold text-[var(--foreground)]">Total</span>
              <span className="text-sm font-bold text-[var(--destructive)] tabular-nums">{formatCurrency(totalExpenses)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
              Revenue by source
              <Badge variant="default" className="text-[10px]">New</Badge>
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mb-3">Quarter total: {formatCurrency(ANALYTICS_OVERVIEW.totalRevenueQuarter)}</p>
            <div className="space-y-3">
              {revenueBySource.map(r => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-[var(--foreground)]">{r.label}</span>
                    <span className="font-bold text-[var(--foreground)]">{r.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
              <span className="text-sm font-bold text-[var(--foreground)]">Total revenue</span>
              <span className="text-sm font-bold text-[var(--primary)] tabular-nums">{formatCurrency(totalRevenue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net profit trend */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-base font-bold text-[var(--foreground)] mb-1 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-[var(--success)]" />
            Monthly net profit trend
            <Badge variant="default" className="text-[10px]">New</Badge>
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">31.2% growth vs. the prior quarter</p>
          <MiniBarsChart
            data={ANALYTICS_OVERVIEW.netProfitTrend.map(m => ({ label: m.label, value: m.revenue }))}
            formatValue={formatCurrency}
          />
          <div className="mt-4 rounded-[12px] border border-[var(--success)]/20 bg-[color:color-mix(in_srgb,var(--success)_6%,transparent)] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Total net profit — {period}</p>
              <p className="text-lg font-black text-[var(--success)] tabular-nums">{formatCurrency(netProfit)}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-5 w-5 text-[var(--success)]" />
              <span className="text-sm font-bold text-[var(--success)]">+31.2% vs. last year</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anomaly detection */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-base font-bold text-[var(--foreground)] mb-1 flex items-center gap-2">
            Automatic anomaly detection
            <Badge variant="default" className="text-[10px]">New</Badge>
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">AI alerts about unusual patterns</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ANALYTICS_OVERVIEW.anomalies.map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{a.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{a.sub}</p>
                </div>
                <Badge variant={a.severity === "warning" ? "warning" : "destructive"} className="shrink-0">
                  {a.severity === "warning" ? "Review" : "Attention"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
