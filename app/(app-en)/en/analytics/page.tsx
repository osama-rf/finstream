"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  CheckCircle2, AlertCircle, TrendingUp, Info, Building2,
  ShieldCheck, Share2, Send,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";
import { ANALYTICS_OVERVIEW, CREDIT_REPORT, SCENARIO_BASELINE, computeScenario } from "@/lib/mock";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { Slider } from "@/components/ui/slider";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";

// ─── Data ─────────────────────────────────────────────────────────────────────

const actualQuarterlyData = [0, 1].map(index => {
  const months = ANALYTICS_OVERVIEW.monthlySeries.slice(index * 3, index * 3 + 3);
  return { quarter: `Q${index + 1}`, revenue: months.reduce((sum, month) => sum + month.revenue, 0), expenses: months.reduce((sum, month) => sum + month.expense, 0), forecast: false };
});
const quarterlyData = [...actualQuarterlyData, { quarter: "Q3", revenue: 2_520_000, expenses: 1_245_000, forecast: true }, { quarter: "Q4", revenue: 2_760_000, expenses: 1_310_000, forecast: true }];

const expenseBreakdown = ANALYTICS_OVERVIEW.expenseBreakdown.map(e => ({
  label: e.label, amount: Math.round((e.pct / 100) * 2_343_200), pct: e.pct, color: e.color,
}));

const revenueBySource = ANALYTICS_OVERVIEW.revenueBySource.map(r => ({
  label: r.label, amount: Math.round((r.pct / 100) * ANALYTICS_OVERVIEW.totalRevenueQuarter), pct: r.pct, color: r.color,
}));

const banksList = [
  { name: "Saudi National Bank", product: "Working Capital Finance", maxAmount: "3,000,000", rate: "6.5%" },
  { name: "Al Rajhi Bank", product: "SME Project Finance", maxAmount: "2,500,000", rate: "6.9%" },
  { name: "Alinma Bank", product: "Revolving Credit Line", maxAmount: "1,500,000", rate: "7.2%" },
];

const shareBanks = ["Saudi National Bank", "Al Rajhi Bank", "Alinma Bank", "Riyad Bank"];

// ─── Bar chart ──────────────────────────────────────────────────────────────

function QuarterlyBarChart({ data }: { data: typeof quarterlyData }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const maxVal = Math.ceil(Math.max(...data.flatMap(d => [d.revenue, d.expenses])) / 500_000) * 500_000;
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const operatingMargin = Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100);
  const revenueGrowth = Math.round(((data[1].revenue - data[0].revenue) / data[0].revenue) * 100);
  const heightPx = 96;

  const activeIndex = hoverIndex ?? selectedIndex;
  const activeItem = activeIndex !== null ? data[activeIndex] : null;
  const detailItem = selectedIndex !== null ? data[selectedIndex] : null;
  const detailMargin = detailItem ? Math.round(((detailItem.revenue - detailItem.expenses) / detailItem.revenue) * 100) : null;

  function toggleSelect(index: number) {
    setSelectedIndex(prev => (prev === index ? null : index));
  }

  return (
    <div className="mt-2">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex flex-wrap gap-4">
          <div><p className="text-[11px] text-[var(--muted-foreground)]">Projected annual revenue</p><p className="mt-1 text-lg font-bold text-[var(--foreground)]">{formatCurrency(totalRevenue)}</p></div>
          <div><p className="text-[11px] text-[var(--muted-foreground)]">Projected annual expenses</p><p className="mt-1 text-lg font-bold text-[var(--foreground)]">{formatCurrency(totalExpenses)}</p></div>
          <div><p className="text-[11px] text-[var(--muted-foreground)]">Operating margin</p><p className="mt-1 text-lg font-bold text-[var(--success)]">{operatingMargin}%</p></div>
          <div><p className="text-[11px] text-[var(--muted-foreground)]">Quarterly revenue growth</p><p className="mt-1 text-lg font-bold text-[var(--success)]">+{revenueGrowth}%</p></div>
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
            const isSelected = selectedIndex === index;
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
                  onFocus={() => setHoverIndex(index)}
                  onBlur={() => setHoverIndex(null)}
                  onClick={() => toggleSelect(index)}
                  className="flex w-full items-end justify-center gap-1 rounded-[6px] px-1 pt-1 transition-colors"
                  style={{ height: heightPx, background: isActive ? "var(--muted)" : "transparent" }}
                >
                  <div
                    className="w-3.5 rounded-t-[3px] transition-all sm:w-4"
                    style={{
                      height: Math.max(revH, 2),
                      background: "var(--primary)",
                      opacity: item.forecast ? (isActive ? .55 : .38) : (isActive ? 1 : .9),
                      outline: item.forecast || isSelected ? `1.5px dashed var(--primary)` : "none",
                      outlineOffset: -1.5,
                    }}
                  />
                  <div
                    className="w-3.5 rounded-t-[3px] transition-all sm:w-4"
                    style={{
                      height: Math.max(expH, 2),
                      background: "var(--destructive)",
                      opacity: item.forecast ? (isActive ? .42 : .28) : (isActive ? .8 : .62),
                      outline: item.forecast || isSelected ? `1.5px dashed var(--destructive)` : "none",
                      outlineOffset: -1.5,
                    }}
                  />
                </button>
                <span
                  className="mt-1.5 text-[9px]"
                  style={{
                    color: isSelected ? "var(--foreground)" : "var(--muted-foreground)",
                    fontWeight: isSelected ? 700 : 400,
                  }}
                >
                  {item.quarter}{item.forecast ? "*" : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {detailItem && (
        <div className="mt-3 rounded-[12px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)] px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-[var(--foreground)]">
              {detailItem.quarter} details{detailItem.forecast && " — forecast"}
            </p>
            <button onClick={() => setSelectedIndex(null)} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Close</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[11px] text-[var(--muted-foreground)]">Revenue</p>
              <p className="text-sm font-bold text-[var(--primary)] tabular-nums">{formatCurrency(detailItem.revenue)}</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--muted-foreground)]">Expenses</p>
              <p className="text-sm font-bold text-[var(--destructive)] tabular-nums">{formatCurrency(detailItem.expenses)}</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--muted-foreground)]">Profit margin</p>
              <p className="text-sm font-bold text-[var(--success)] tabular-nums">{detailMargin}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Donut chart ────────────────────────────────────────────────────────────

function DonutChart({ slices, size = 140 }: { slices: { pct: number; color: string }[]; size?: number }) {
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
              <><CheckCircle2 className="h-4 w-4" />Sent</>
            ) : sending ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Sending...</>
            ) : (
              <><Send className="h-4 w-4" />Send report</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsEnPage() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [scenario, setScenario] = useState(SCENARIO_BASELINE);

  const totalRevenue = revenueBySource.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenseBreakdown.reduce((s, e) => s + e.amount, 0);

  const scenarioResult = useMemo(() => computeScenario(scenario), [scenario]);

  const goodCount = CREDIT_REPORT.ratios.filter(r => r.status === "good").length;
  const warningCount = CREDIT_REPORT.ratios.filter(r => r.status !== "good").length;

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">

      {showShareModal && <ShareCreditModal letter={CREDIT_REPORT.letter} onClose={() => setShowShareModal(false)} />}

      <h1 className="text-2xl font-bold text-[var(--foreground)]">Financial Analysis</h1>

      {/* Expense breakdown + Revenue sources */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[var(--destructive)]" />
              Expense Breakdown
            </h2>
            <div className="flex items-center gap-4">
              <DonutChart slices={expenseBreakdown.map(e => ({ pct: e.pct, color: e.color }))} size={120} />
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
              Revenue Sources
            </h2>
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

      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-bold text-[var(--foreground)] mb-1 flex items-center gap-2"><div className="h-4 w-1 rounded-full bg-[var(--primary)]" />Revenue vs. Expense Trend</h2>
          <p className="mb-4 text-xs text-[var(--muted-foreground)]">First-half actuals and second-half forecast for the full 2026 financial year</p>
          <QuarterlyBarChart data={quarterlyData} />
        </CardContent>
      </Card>

      {/* Credit rating */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--foreground)]">Credit Rating</h2>
            <Button size="sm" className="gap-2" onClick={() => setShowShareModal(true)}>
              <Share2 className="h-4 w-4" />
              Share with bank
            </Button>
          </div>
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <ScoreRing value={CREDIT_REPORT.score} max={CREDIT_REPORT.max} size={144} sublabel="out of 900" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 sm:gap-3 sm:mb-2">
                  <span className="text-3xl font-black text-[var(--success)] sm:text-4xl">{CREDIT_REPORT.letter}</span>
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
                    <span className="text-xs font-bold text-[var(--primary)]">Above {CREDIT_REPORT.percentile}% of sector companies</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold text-[var(--muted-foreground)] mb-2">Strengths</p>
                <ul className="space-y-1.5">
                  {CREDIT_REPORT.strengths.map((s, i) => (
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
                  {CREDIT_REPORT.risks.map((r, i) => (
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
                  <div className="h-full" style={{ flex: 200, background: "#ef4444", opacity: 0.8 }} />
                  <div className="h-full" style={{ flex: 100, background: "#f97316", opacity: 0.8 }} />
                  <div className="h-full" style={{ flex: 100, background: "#eab308", opacity: 0.8 }} />
                  <div className="h-full" style={{ flex: 100, background: "#22c55e", opacity: 0.8 }} />
                  <div className="h-full" style={{ flex: 100, background: "#10b981", opacity: 0.8 }} />
                </div>
                <div
                  className="absolute flex flex-col items-center"
                  style={{ left: `${((CREDIT_REPORT.score - 300) / 600) * 100}%`, top: "-10px", transform: "translateX(-50%)" }}
                >
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
                    className="absolute text-[9px] text-[var(--muted-foreground)] tabular-nums"
                    style={{ left: `${pct}%`, transform: pct === 0 ? "none" : pct === 100 ? "translateX(-100%)" : "translateX(-50%)" }}
                  >
                    {val}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            {CREDIT_REPORT.ratios.map(ratio => {
              const isGood = ratio.status === "good";
              const isBad = ratio.status === "bad";
              const color = isGood ? "var(--success)" : isBad ? "var(--destructive)" : "var(--warning)";
              const barPct = Math.min(100, Math.round((ratio.value / (ratio.benchmark * 1.6)) * 100));
              return (
                <Card key={ratio.key} className={!isGood ? "border-[var(--warning)]/30" : ""}>
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
                      <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: color }} />
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)]">{ratio.benchmarkLabel}</p>
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
                {CREDIT_REPORT.recommendations.map((rec, i) => (
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
                    Based on your {CREDIT_REPORT.letter} rating, you qualify for financing up to SAR 3,000,000
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {banksList.map(bank => (
                  <div key={bank.name} className="rounded-[14px] border border-[var(--border)] p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
                          <Building2 className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="font-bold text-[var(--foreground)]">{bank.name}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">{bank.product}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-center">
                          <p className="text-xs text-[var(--muted-foreground)]">Max amount</p>
                          <p className="text-base font-bold text-[var(--foreground)]">SAR {bank.maxAmount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[var(--muted-foreground)]">Rate</p>
                          <p className="text-base font-bold text-[var(--success)]">{bank.rate}</p>
                        </div>
                        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setShowShareModal(true)}>
                          <Share2 className="h-3.5 w-3.5" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="text-base font-bold text-[var(--foreground)] mb-1">Credit metrics vs. sector</h3>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">
                {CREDIT_REPORT.benchmarkSummary.sector} · {CREDIT_REPORT.benchmarkSummary.region}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs text-[var(--success)] font-bold">
                  Above average: {CREDIT_REPORT.benchmarkSummary.aboveAverage} metrics
                </span>
                <span className="text-xs text-[var(--destructive)] font-bold">
                  Below average: {CREDIT_REPORT.benchmarkSummary.belowAverage} metric ({CREDIT_REPORT.benchmarkSummary.belowAverageNote})
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
                  {CREDIT_REPORT.benchmarkRows.map(row => (
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
