"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  CheckCircle2, AlertCircle, TrendingUp, Info, Building2,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";
import { getCreditReportForYear, SCENARIO_BASELINE, computeScenario } from "@/lib/mock";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { Slider } from "@/components/ui/slider";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { FINANCIAL_METRICS_BY_YEAR, FINANCIAL_YEARS, type FinancialYear } from "@/lib/data/financial-statements";
import { LICENSED_BANKS, LICENSED_FINANCE_ENTITIES, SAMA_FINANCE_SOURCE } from "@/lib/data/sama-licensed-entities";

// ─── Data ─────────────────────────────────────────────────────────────────────

const EXPENSE_DETAILS: Record<FinancialYear, { selling: number; admin: number }> = {
  "2025": { selling: 178_895_209, admin: 55_842_107 },
  "2024": { selling: 146_239_809, admin: 42_896_236 },
  "2023": { selling: 36_559_952.25, admin: 10_724_059 },
};

const banksList = LICENSED_FINANCE_ENTITIES;
const shareBanks = LICENSED_BANKS.map(bank => bank.name);

// ─── Bar chart ──────────────────────────────────────────────────────────────

function YearlyBarChart({ selectedYear }: { selectedYear: FinancialYear }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [detailYear, setDetailYear] = useState<FinancialYear>(selectedYear);
  const data = FINANCIAL_YEARS.slice().reverse().filter(year => Number(year) <= Number(selectedYear)).map(year => {
    const metrics = FINANCIAL_METRICS_BY_YEAR[year];
    return { quarter: year, revenue: metrics.revenue, expenses: metrics.revenue - metrics.netProfit, forecast: false };
  });

  const maxVal = Math.ceil(Math.max(...data.flatMap(d => [d.revenue, d.expenses])) / 500_000) * 500_000;
  const totalRevenue = data[data.length - 1].revenue;
  const totalExpenses = data[data.length - 1].expenses;
  const previousItem = data.length > 1 ? data[data.length - 2] : null;
  const revenueGrowth = previousItem ? ((totalRevenue - previousItem.revenue) / previousItem.revenue) * 100 : 0;
  const heightPx = 96;

  const activeIndex = hoverIndex;
  const activeItem = activeIndex !== null ? data[activeIndex] : null;
  const detailItem = data.find(item => item.quarter === detailYear) ?? data[data.length - 1];
  const detailMargin = ((detailItem.revenue - detailItem.expenses) / detailItem.revenue) * 100;

  useEffect(() => setDetailYear(selectedYear), [selectedYear]);

  return (
    <div className="mt-2">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex flex-wrap gap-4">
          <div><p className="text-[11px] text-[var(--muted-foreground)]">{selectedYear} revenue</p><p className="mt-1 text-lg font-bold text-[var(--foreground)]">{formatCurrency(totalRevenue)}</p></div>
          <div><p className="text-[11px] text-[var(--muted-foreground)]">{selectedYear} expenses</p><p className="mt-1 text-lg font-bold text-[var(--foreground)]">{formatCurrency(totalExpenses)}</p></div>
          <div><p className="text-[11px] text-[var(--muted-foreground)]">Net margin</p><p className="mt-1 text-lg font-bold text-[var(--success)]">{(((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(2)}%</p></div>
          <div><p className="text-[11px] text-[var(--muted-foreground)]">Annual revenue growth</p><p className="mt-1 text-lg font-bold text-[var(--success)]">{revenueGrowth > 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-full bg-[var(--surface)] px-4 py-2"><span className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]"><i className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />Revenue</span><span className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]"><i className="h-2.5 w-2.5 rounded-full bg-[var(--destructive)] opacity-70" />Expenses</span><span className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]"><i className="w-4 border-t-2 border-dashed border-[var(--muted-foreground)]" />Forecast</span></div>
      </div>

      <div className="flex items-stretch gap-1">
        <div className="flex flex-col justify-between text-[9px] text-[var(--muted-foreground)] tabular-nums pb-5" style={{ height: heightPx }}>
          <span>{Math.round(maxVal / 1000)}k</span>
          <span>{Math.round(maxVal / 2000)}k</span>
          <span>0</span>
        </div>

        <div className="flex flex-1 items-end gap-2">
          {data.map((item, index) => {
            const isActive = activeIndex === index;
            const isSelected = item.quarter === detailItem.quarter;
            const revH = Math.round((item.revenue / maxVal) * heightPx);
            const expH = Math.round((item.expenses / maxVal) * heightPx);
            return (
              <div key={item.quarter} className="relative flex flex-1 flex-col items-center">
                {activeItem && isActive && (
                  <div className="pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 shadow-lg">
                    <p className="text-[11px] font-bold text-[var(--foreground)]">
                      {activeItem.quarter}{activeItem.forecast && " (forecast)"}
                    </p>
                    <p className="text-[10px] text-[var(--primary)] tabular-nums">Revenue: {formatCurrency(activeItem.revenue)}</p>
                    <p className="text-[10px] text-[var(--destructive)] tabular-nums">Expenses: {formatCurrency(activeItem.expenses)}</p>
                  </div>
                )}

                <button
                  type="button"
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={() => setDetailYear(item.quarter)}
                  className="flex w-full items-end justify-center gap-1 rounded-[6px] px-1 pt-1 transition-colors"
                  style={{ height: heightPx, background: isActive ? "var(--muted)" : "transparent" }}
                >
                  <div
                    className="w-3.5 rounded-t-[3px] transition-all sm:w-4"
                    style={{
                      height: Math.max(revH, 2),
                      background: "var(--primary)",
                      opacity: item.forecast ? (isActive ? .55 : .38) : (isActive ? 1 : .9),
                      outline: item.forecast || isSelected ? `1.5px solid var(--primary)` : "none",
                      outlineOffset: -1.5,
                    }}
                  />
                  <div
                    className="w-3.5 rounded-t-[3px] transition-all sm:w-4"
                    style={{
                      height: Math.max(expH, 2),
                      background: "var(--destructive)",
                      opacity: item.forecast ? (isActive ? .42 : .28) : (isActive ? .8 : .62),
                      outline: item.forecast || isSelected ? `1.5px solid var(--destructive)` : "none",
                      outlineOffset: -1.5,
                    }}
                  />
                </button>
                <span
                  className="mt-1.5 text-[9px]"
                  style={{
                    color: isSelected || isActive ? "var(--foreground)" : "var(--muted-foreground)",
                    fontWeight: isSelected || isActive ? 700 : 400,
                  }}
                >
                  {item.quarter}{item.forecast ? "*" : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 rounded-[12px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)] px-4 py-3">
        <p className="mb-2 text-sm font-bold text-[var(--foreground)]">{detailItem.quarter} details</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div><p className="text-[11px] text-[var(--muted-foreground)]">Revenue</p><p className="text-sm font-bold text-[var(--primary)] tabular-nums">{formatCurrency(detailItem.revenue)}</p></div>
          <div><p className="text-[11px] text-[var(--muted-foreground)]">Expenses</p><p className="text-sm font-bold text-[var(--destructive)] tabular-nums">{formatCurrency(detailItem.expenses)}</p></div>
          <div><p className="text-[11px] text-[var(--muted-foreground)]">Profit margin</p><p className="text-sm font-bold text-[var(--success)] tabular-nums">{detailMargin.toFixed(2)}%</p></div>
        </div>
      </div>

    </div>
  );
}

// ─── Donut chart ────────────────────────────────────────────────────────────

function DonutChart({
  slices, size = 140, activeIndex, onActivate, onDeactivate,
}: {
  slices: { pct: number; color: string; label: string; amount: number }[];
  size?: number;
  activeIndex: number | null;
  onActivate: (i: number) => void;
  onDeactivate: () => void;
}) {
  let cumulative = 0;
  const r = size / 2 - 16;
  const circ = 2 * Math.PI * r;
  const active = activeIndex !== null ? slices[activeIndex] : null;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => {
          const offset = circ - (s.pct / 100) * circ;
          const rotation = (cumulative / 100) * 360 - 90;
          cumulative += s.pct;
          const isActive = activeIndex === i;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={(i === 0 ? 22 : 18) + (isActive ? 4 : 0)}
              strokeDasharray={`${circ}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              opacity={activeIndex === null || isActive ? 1 : 0.4}
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "center",
                transition: "opacity .15s, stroke-width .15s",
                cursor: "pointer",
                outline: "none",
              }}
              tabIndex={0}
              role="button"
              aria-label={`${s.label}: ${s.pct}%`}
              onMouseEnter={() => onActivate(i)}
              onMouseLeave={onDeactivate}
              onFocus={() => onActivate(i)}
              onBlur={onDeactivate}
              onClick={() => onActivate(i)}
            />
          );
        })}
        <circle cx={size / 2} cy={size / 2} r={r - 14} fill="var(--card)" />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {active ? (
          <>
            <span className="text-[10px] font-bold text-[var(--foreground)] px-2 leading-tight">{active.label}</span>
            <span className="text-xs font-black tabular-nums" style={{ color: active.color }}>{active.pct}%</span>
          </>
        ) : (
          <span className="text-[10px] text-[var(--muted-foreground)]">Breakdown</span>
        )}
      </div>
    </div>
  );
}

// ─── Share credit modal ─────────────────────────────────────────────────────

function ShareCreditModal({ letter, onClose }: { letter: string; onClose: () => void }) {
  const [selected, setSelected] = useState(shareBanks[0]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setTimeout(() => { onClose(); toast.success(`Credit report ${letter} sent to ${selected}`); }, 700);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-sm p-0" dir="ltr">
        <DialogHeader className="border-b border-[var(--border)] px-5 py-4 pe-14">
          <DialogTitle>Share credit report</DialogTitle>
        </DialogHeader>
        <div className="p-5 space-y-4">
          <div className="rounded-[10px] border border-[var(--success)]/30 bg-[color:color-mix(in_srgb,var(--success)_6%,transparent)] px-4 py-3 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[var(--success)] shrink-0" />
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">Credit rating {letter}</p>
              <p className="text-xs text-[var(--muted-foreground)]">The bank will receive an encrypted report valid for 30 days</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--muted-foreground)] mb-2 block">Choose a bank</label>
            <div className="space-y-2">
              {shareBanks.map(b => (
                <button key={b} onClick={() => setSelected(b)}
                  className={`w-full text-left rounded-[10px] border px-4 py-2.5 text-sm transition-all ${
                    selected === b
                      ? "border-[var(--primary)] bg-[color:color-mix(in_srgb,var(--primary)_8%,transparent)] text-[var(--primary)] font-bold"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
                  }`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full gap-2" onClick={handleSend} disabled={sending || sent}>
            {sent ? (
              "Sent"
            ) : sending ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Sending...</>
            ) : (
              "Send report"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsEnPage() {
  const [selectedYear, setSelectedYear] = useState<FinancialYear>("2025");
  const [showShareModal, setShowShareModal] = useState(false);
  const [scenario, setScenario] = useState(SCENARIO_BASELINE);
  const [activeExpenseIndex, setActiveExpenseIndex] = useState<number | null>(null);
  const [activeSourceIndex, setActiveSourceIndex] = useState<number | null>(null);
  const [activeRatioKey, setActiveRatioKey] = useState<string | null>(null);
  const [scaleHover, setScaleHover] = useState<{ val: number; pct: number } | null>(null);

  const selectedMetrics = FINANCIAL_METRICS_BY_YEAR[selectedYear];
  const totalStatementExpenses = selectedMetrics.revenue - selectedMetrics.netProfit;
  const expenseDetail = EXPENSE_DETAILS[selectedYear];
  const expenseBreakdown = [
    { label: "Cost of sales", amount: selectedMetrics.costOfSales, color: "var(--primary)" },
    { label: "Selling and distribution", amount: expenseDetail.selling, color: "#31577D" },
    { label: "General and administrative", amount: expenseDetail.admin, color: "#6684A2" },
    { label: "Zakat, finance and other expenses", amount: totalStatementExpenses - selectedMetrics.costOfSales - expenseDetail.selling - expenseDetail.admin, color: "#A7B8C9" },
  ].map(item => ({ ...item, pct: Math.round((item.amount / totalStatementExpenses) * 100) }));
  const revenueByYear = FINANCIAL_YEARS.slice().reverse().map(year => ({ year, amount: FINANCIAL_METRICS_BY_YEAR[year].revenue }));
  const maxRevenueByYear = Math.max(...revenueByYear.map(r => r.amount));
  const totalRevenue = selectedMetrics.revenue;
  const totalExpenses = expenseBreakdown.reduce((s, e) => s + e.amount, 0);
  const previousMetrics = Number(selectedYear) > 2023 ? FINANCIAL_METRICS_BY_YEAR[String(Number(selectedYear) - 1) as FinancialYear] : null;
  const yearCreditReport = getCreditReportForYear(selectedYear);
  const displayRatios = yearCreditReport.ratios.map(ratio => {
    const value = ratio.key === "profit_margin" ? (selectedMetrics.netProfit / selectedMetrics.revenue) * 100
      : ratio.key === "current_ratio" ? selectedMetrics.currentAssets / selectedMetrics.currentLiabilities
      : ratio.key === "debt_equity" ? selectedMetrics.totalLiabilities / selectedMetrics.equity
      : ratio.key === "dso" ? (selectedMetrics.tradeReceivables / selectedMetrics.revenue) * 365
      : ratio.key === "revenue_growth" ? (previousMetrics ? ((selectedMetrics.revenue - previousMetrics.revenue) / previousMetrics.revenue) * 100 : 0)
      : selectedMetrics.cash / selectedMetrics.currentLiabilities;
    const favorable = ["debt_equity", "dso"].includes(ratio.key) ? value <= ratio.benchmark : value >= ratio.benchmark;
    const status: "good" | "warning" | "bad" = favorable ? "good" : value < ratio.benchmark * 0.5 ? "bad" : "warning";
    return { ...ratio, value: Math.round(value * 100) / 100, status };
  });

  const scenarioResult = useMemo(() => computeScenario(scenario, selectedYear), [scenario, selectedYear]);

  const goodCount = displayRatios.filter(r => r.status === "good").length;
  const warningCount = displayRatios.filter(r => r.status !== "good").length;

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">

      {showShareModal && <ShareCreditModal letter={yearCreditReport.letter} onClose={() => setShowShareModal(false)} />}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-[var(--foreground)]">Financial Analysis</h1><p className="mt-1 text-xs text-[var(--muted-foreground)]">{selectedYear === "2023" ? "Before Rakaez" : "After Rakaez"}</p></div>
        <label className="text-[10px] text-[var(--muted-foreground)]">Financial year<select value={selectedYear} onChange={event => setSelectedYear(event.target.value as FinancialYear)} className="mt-1 block min-w-32 rounded-xl border border-[var(--border)] bg-[var(--card)] py-2.5 text-sm font-bold text-[var(--foreground)]">{FINANCIAL_YEARS.map(year => <option key={year} value={year}>{year}</option>)}</select></label>
      </div>

      {/* Expense breakdown + Revenue sources */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
              Expense Breakdown
            </h2>
            <div className="flex items-center gap-4">
              <DonutChart
                slices={expenseBreakdown.map(e => ({ pct: e.pct, color: e.color, label: e.label, amount: e.amount }))}
                size={120}
                activeIndex={activeExpenseIndex}
                onActivate={setActiveExpenseIndex}
                onDeactivate={() => setActiveExpenseIndex(null)}
              />
              <div className="flex-1 space-y-2">
                {expenseBreakdown.map((e, i) => (
                  <button
                    key={e.label}
                    type="button"
                    onMouseEnter={() => setActiveExpenseIndex(i)}
                    onMouseLeave={() => setActiveExpenseIndex(null)}
                    onFocus={() => setActiveExpenseIndex(i)}
                    onBlur={() => setActiveExpenseIndex(null)}
                    onClick={() => setActiveExpenseIndex(prev => (prev === i ? null : i))}
                    className="flex w-full items-center justify-between gap-2 rounded-[8px] px-1.5 py-1 -mx-1.5 text-left transition-colors"
                    style={{ background: activeExpenseIndex === i ? "var(--muted)" : "transparent" }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: e.color }} />
                      <span className="text-xs text-[var(--foreground)] truncate">{e.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums">{formatCurrency(e.amount)}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{e.pct}%</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
              <span className="text-sm font-bold text-[var(--foreground)]">Total</span>
              <span className="text-sm font-bold text-[var(--foreground)] tabular-nums">{formatCurrency(totalExpenses)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
              Revenue Growth by Year
            </h2>
            <div className="flex items-end justify-between gap-3" style={{ height: 120 }}>
              {revenueByYear.map((r, i) => {
                const isActive = activeSourceIndex === i;
                const prev = i > 0 ? revenueByYear[i - 1] : null;
                const growthPct = prev ? Math.round(((r.amount - prev.amount) / prev.amount) * 100) : null;
                const barH = Math.max(Math.round((r.amount / maxRevenueByYear) * 92), 4);
                return (
                  <button
                    key={r.year}
                    type="button"
                    onMouseEnter={() => setActiveSourceIndex(i)}
                    onMouseLeave={() => setActiveSourceIndex(null)}
                    onFocus={() => setActiveSourceIndex(i)}
                    onBlur={() => setActiveSourceIndex(null)}
                    onClick={() => setActiveSourceIndex(prev => (prev === i ? null : i))}
                    className="relative flex h-full flex-1 flex-col items-center justify-end gap-2 rounded-[8px] pt-1 transition-colors"
                    style={{ background: isActive ? "var(--muted)" : "transparent" }}
                  >
                    {isActive && (
                      <div className="pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 shadow-lg">
                        <p className="text-[11px] font-bold text-[var(--foreground)]">{r.year}</p>
                        <p className="text-[10px] text-[var(--primary)] tabular-nums">{formatCurrency(r.amount)}</p>
                        {growthPct !== null && (
                          <p className={`text-[10px] tabular-nums ${growthPct >= 0 ? "text-[var(--success)]" : "text-[var(--destructive)]"}`}>
                            {growthPct >= 0 ? "+" : ""}{growthPct}% vs {prev!.year}
                          </p>
                        )}
                      </div>
                    )}
                    <div
                      className="w-full max-w-10 rounded-t-[6px] transition-all"
                      style={{ height: barH, background: "var(--primary)", opacity: isActive ? 1 : 0.75 }}
                    />
                    <span className="text-[10px] font-bold" style={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}>{r.year}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
              <span className="text-sm font-bold text-[var(--foreground)]">Total revenue</span>
              <span className="text-sm font-bold text-[var(--primary)] tabular-nums">{formatCurrency(totalRevenue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-bold text-[var(--foreground)] mb-1 flex items-center gap-2"><div className="h-4 w-1 rounded-full bg-[var(--primary)]" />Revenue vs. Expense Trend</h2>
          <p className="mb-4 text-xs text-[var(--muted-foreground)]">Actual Glowpick trend · 2023 before Rakaez, 2024–2025 after Rakaez</p>
          <YearlyBarChart selectedYear={selectedYear} />
        </CardContent>
      </Card>

      {/* Credit rating */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--foreground)]">Credit Rating</h2>
            <Button size="sm" onClick={() => setShowShareModal(true)}>
              Share with bank
            </Button>
          </div>
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <ScoreRing
                value={yearCreditReport.score}
                max={yearCreditReport.max}
                size={144}
                sublabel="out of 900"
                detail={`Rating ${yearCreditReport.letter} · Above ${yearCreditReport.percentile}% of sector`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 sm:gap-3 sm:mb-2">
                  <span className="text-3xl font-black text-[var(--success)] sm:text-4xl">{yearCreditReport.letter}</span>
                  <Badge variant="success" className="text-xs px-2 py-0.5">Very Good</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />
                    <span className="text-xs font-bold text-[var(--success)]">{goodCount} positive indicators</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-[var(--warning)]" />
                    <span className="text-xs font-bold text-[var(--warning)]">{warningCount} need improvement</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[var(--primary)]">Above {yearCreditReport.percentile}% of sector companies</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold text-[var(--muted-foreground)] mb-2">Strengths</p>
                <ul className="space-y-1.5">
                  {yearCreditReport.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[var(--foreground)]">
                      <TrendingUp className="h-3.5 w-3.5 text-[var(--success)] mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--muted-foreground)] mb-2">Risks to address</p>
                <ul className="space-y-1.5">
                  {yearCreditReport.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[var(--foreground)]">
                      <AlertCircle className="h-3.5 w-3.5 text-[var(--warning)] mt-0.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <p className="text-[10px] text-[var(--muted-foreground)] mb-3">Credit rating scale — 300 to 900</p>
              <div className="relative h-3 rounded-full flex" style={{ overflow: "visible" }}>
                <div className="absolute inset-0 rounded-full overflow-hidden flex">
                  {[
                    { flex: 200, bg: "#ef4444", from: 300, to: 500, label: "Poor" },
                    { flex: 100, bg: "#f97316", from: 500, to: 600, label: "Below average" },
                    { flex: 100, bg: "#eab308", from: 600, to: 700, label: "Average" },
                    { flex: 100, bg: "#22c55e", from: 700, to: 800, label: "Good" },
                    { flex: 100, bg: "#10b981", from: 800, to: 900, label: "Excellent" },
                  ].map(seg => (
                    <div
                      key={seg.label}
                      className="h-full cursor-pointer transition-opacity"
                      style={{ flex: seg.flex, background: seg.bg, opacity: scaleHover?.val === seg.from ? 1 : 0.8 }}
                      tabIndex={0}
                      role="button"
                      aria-label={`${seg.label}: ${seg.from} to ${seg.to}`}
                      onMouseEnter={() => setScaleHover({ val: seg.from, pct: ((seg.from - 300) / 600) * 100 })}
                      onMouseLeave={() => setScaleHover(null)}
                      onFocus={() => setScaleHover({ val: seg.from, pct: ((seg.from - 300) / 600) * 100 })}
                      onBlur={() => setScaleHover(null)}
                    />
                  ))}
                </div>
                <div
                  className="absolute flex flex-col items-center cursor-pointer"
                  style={{ left: `${((yearCreditReport.score - 300) / 600) * 100}%`, top: "-10px", transform: "translateX(-50%)" }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Your current rating: ${yearCreditReport.score}`}
                  onMouseEnter={() => setScaleHover({ val: yearCreditReport.score, pct: ((yearCreditReport.score - 300) / 600) * 100 })}
                  onMouseLeave={() => setScaleHover(null)}
                  onFocus={() => setScaleHover({ val: yearCreditReport.score, pct: ((yearCreditReport.score - 300) / 600) * 100 })}
                  onBlur={() => setScaleHover(null)}
                >
                  {scaleHover?.val === yearCreditReport.score && (
                    <div className="pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-[8px] border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 shadow-lg">
                      <p className="text-[10px] font-bold text-[var(--foreground)]">Your current rating</p>
                      <p className="text-[11px] font-black tabular-nums text-center" style={{ color: "var(--success)" }}>{yearCreditReport.score}</p>
                    </div>
                  )}
                  <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "7px solid #1e293b" }} />
                  <div style={{ width: "2px", height: "13px", background: "#1e293b" }} />
                </div>
              </div>
              <div className="relative mt-2 h-3">
                {[
                  { val: 300, pct: 0 },
                  { val: 500, pct: 33.33 },
                  { val: 600, pct: 50 },
                  { val: 700, pct: 66.67 },
                  { val: 800, pct: 83.33 },
                  { val: 900, pct: 100 },
                ].map(({ val, pct }) => (
                  <span
                    key={val}
                    className="absolute text-[9px] tabular-nums transition-colors"
                    style={{
                      left: `${pct}%`,
                      transform: pct === 0 ? "none" : pct === 100 ? "translateX(-100%)" : "translateX(-50%)",
                      color: scaleHover?.val === val ? "var(--foreground)" : "var(--muted-foreground)",
                      fontWeight: scaleHover?.val === val ? 700 : 400,
                    }}
                  >
                    {val}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Scenario simulator */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] mb-3">Scenario Simulator</h2>
        <Card>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-[var(--foreground)]">Monthly revenue growth</span>
                  <b className="tabular-nums">{scenario.revenueGrowthPct > 0 ? "+" : ""}{scenario.revenueGrowthPct}%</b>
                </div>
                <Slider min={-10} max={20} value={scenario.revenueGrowthPct}
                  onChange={v => setScenario(prev => ({ ...prev, revenueGrowthPct: v }))} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-[var(--foreground)]">Operating expense reduction</span>
                  <b className="tabular-nums">{scenario.expenseReductionPct}%</b>
                </div>
                <Slider min={-20} max={10} value={scenario.expenseReductionPct}
                  onChange={v => setScenario(prev => ({ ...prev, expenseReductionPct: v }))} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-[var(--foreground)]">Proposed additional financing</span>
                  <b className="tabular-nums">{formatCurrency(scenario.additionalFinancing)}</b>
                </div>
                <Slider min={0} max={500_000} step={10_000} value={scenario.additionalFinancing}
                  onChange={v => setScenario(prev => ({ ...prev, additionalFinancing: v }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-6 sm:grid-cols-3">
              <Card className="bg-[var(--surface)]">
                <CardContent className="p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">Projected runway</p>
                  <p className="text-lg font-bold text-[var(--foreground)] tabular-nums">{scenarioResult.projectedRunwayMonths} months</p>
                </CardContent>
              </Card>
              <Card className="bg-[var(--surface)]">
                <CardContent className="p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">Projected credit rating</p>
                  <p className="text-lg font-bold text-[var(--foreground)]">{scenarioResult.projectedCreditRating}</p>
                </CardContent>
              </Card>
              <Card className="bg-[var(--surface)]">
                <CardContent className="p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">Projected sustainability score</p>
                  <p className="text-lg font-bold text-[var(--foreground)] tabular-nums">{scenarioResult.projectedSustainabilityScore} / 100</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicators & offers */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] mb-3">Indicators & Offers</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayRatios.map(ratio => {
              const isGood = ratio.status === "good";
              const isBad = ratio.status === "bad";
              const color = isGood ? "var(--success)" : isBad ? "var(--destructive)" : "var(--warning)";
              const barPct = Math.min(100, Math.round((ratio.value / (ratio.benchmark * 1.6)) * 100));
              const isActive = activeRatioKey === ratio.key;
              return (
                <Card
                  key={ratio.key}
                  role="button"
                  tabIndex={0}
                  onMouseEnter={() => setActiveRatioKey(ratio.key)}
                  onMouseLeave={() => setActiveRatioKey(null)}
                  onFocus={() => setActiveRatioKey(ratio.key)}
                  onBlur={() => setActiveRatioKey(null)}
                  onClick={() => setActiveRatioKey(prev => (prev === ratio.key ? null : ratio.key))}
                  className={`cursor-pointer transition-all ${!isGood ? "border-[var(--warning)]/30" : ""}`}
                  style={isActive ? { borderColor: color, boxShadow: `0 0 0 1px ${color}` } : undefined}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-sm font-bold text-[var(--foreground)] leading-snug">{ratio.label}</p>
                      {isGood
                        ? <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0" />
                        : <AlertCircle className="h-4 w-4 shrink-0" style={{ color }} />}
                    </div>
                    <p className="text-2xl font-black tabular-nums mb-1" style={{ color }}>
                      {ratio.value}{ratio.unit}
                    </p>
                    <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden mb-2">
                      <div className="h-full rounded-full transition-[filter]" style={{ width: `${barPct}%`, background: color, filter: isActive ? "brightness(1.15)" : "none" }} />
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)]">{ratio.benchmarkLabel}</p>
                    {isActive && (
                      <p className="mt-2 text-[11px] font-bold" style={{ color }}>
                        {ratio.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="text-base font-bold text-[var(--foreground)]">Recommendations to improve rating</h3>
              </div>
              <div className="space-y-3">
                {yearCreditReport.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-[12px] border border-[var(--primary)]/15 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)] px-4 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white text-xs font-black">{i + 1}</span>
                    <div>
                      <p className="text-sm text-[var(--foreground)] leading-relaxed">{rec.text}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{rec.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="rounded-[14px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_5%,transparent)] px-5 py-4 mb-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[var(--primary)] shrink-0" />
                  <p className="text-sm font-bold text-[var(--foreground)]">
                    SAMA-licensed financing entities
                  </p>
                </div>
              </div>
              <div className="max-h-[620px] space-y-3 overflow-y-auto pe-1">
                {banksList.map(bank => (
                  <div key={bank.name} className="rounded-[14px] border border-[var(--border)] p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
                          <Building2 className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="font-bold text-[var(--foreground)]">{bank.name}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">{bank.activity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <Badge variant="success">SAMA licensed</Badge>
                        <Button size="sm" className="shrink-0" onClick={() => setShowShareModal(true)}>
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <a href={SAMA_FINANCE_SOURCE} target="_blank" rel="noreferrer" className="mt-4 block text-xs text-[var(--primary)] underline underline-offset-4">Source: Saudi Central Bank</a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="text-base font-bold text-[var(--foreground)] mb-1">Credit metrics vs. sector</h3>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">
                {yearCreditReport.benchmarkSummary.sector} · {yearCreditReport.benchmarkSummary.region}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs text-[var(--success)] font-bold">
                  Above average: {yearCreditReport.benchmarkSummary.aboveAverage} metrics
                </span>
                <span className="text-xs text-[var(--destructive)] font-bold">
                  Below average: {yearCreditReport.benchmarkSummary.belowAverage} metric ({yearCreditReport.benchmarkSummary.belowAverageNote})
                </span>
              </div>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Metric</TableHeaderCell>
                    <TableHeaderCell>Your company</TableHeaderCell>
                    <TableHeaderCell>Sector average</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {yearCreditReport.benchmarkRows.map(row => (
                    <TableRow key={row.key}>
                      <TableCell>
                        {row.key === "profit_margin" ? "Net profit margin"
                          : row.key === "revenue_growth" ? "Annual revenue growth"
                          : row.key === "current_ratio" ? "Current ratio"
                          : row.key === "dso" ? "Days sales outstanding (DSO)"
                          : "Debt-to-equity ratio"}
                      </TableCell>
                      <TableCell>
                        <b style={{ color: row.favorable ? "var(--success)" : "var(--destructive)" }}>{row.companyValue}</b>
                      </TableCell>
                      <TableCell>{row.sectorAverage}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
