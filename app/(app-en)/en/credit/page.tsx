"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ShieldCheck, Share2, RefreshCw, CheckCircle2,
  AlertCircle, TrendingUp, Info,
  Building2, BarChart3, Send, X,
} from "lucide-react";
import { toast } from "sonner";
import type { CreditReport, CreditRatio } from "@/lib/ai/finance-agent";
import { ScoreRing as SharedScoreRing } from "@/components/shared/ScoreRing";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { SUSTAINABILITY_SCORE, CREDIT_REPORT as MOCK_CREDIT_REPORT } from "@/lib/mock";

// ─── Static score constants (score itself is fixed; narrative is AI) ─────────

const SCORE = 720;
const LETTER = "B+";
const RATING = "Very Good";
const PERCENTILE = 71;
const VISUAL_PCT = Math.round(((SCORE - 300) / 600) * 100);

const STATIC_RATIOS: CreditRatio[] = [
  { key: "profit_margin", label: "Net Profit Margin", value: 32.5, unit: "%", benchmark: 24, benchmarkLabel: "Sector avg: 24%", status: "good", description: "Net profit as a percentage of total revenue" },
  { key: "current_ratio", label: "Current Ratio", value: 1.8, unit: "x", benchmark: 1.5, benchmarkLabel: "Bank req: ≥ 1.5", status: "good", description: "The company's ability to cover short-term obligations" },
  { key: "debt_equity", label: "Debt-to-Equity Ratio", value: 0.65, unit: "x", benchmark: 0.8, benchmarkLabel: "Bank req: ≤ 0.8", status: "good", description: "The company's leverage level" },
  { key: "dso", label: "Days Sales Outstanding", value: 42, unit: "days", benchmark: 35, benchmarkLabel: "Sector avg: 35 days", status: "warning", description: "Average days needed to collect receivables" },
  { key: "revenue_growth", label: "Revenue Growth (YoY)", value: 18.4, unit: "%", benchmark: 12, benchmarkLabel: "Sector avg: 12%", status: "good", description: "Revenue growth rate compared to last year" },
  { key: "cash_coverage", label: "Cash Coverage Ratio", value: 2.1, unit: "x", benchmark: 1.5, benchmarkLabel: "Bank req: ≥ 1.5", status: "good", description: "Cash flow's ability to cover debt service" },
];

const banksList = [
  { name: "Saudi National Bank", product: "Working Capital Finance", maxAmount: "3,000,000", rate: "6.5%" },
  { name: "Al Rajhi Bank", product: "SME Project Finance", maxAmount: "2,500,000", rate: "6.9%" },
  { name: "Alinma Bank", product: "Revolving Credit Line", maxAmount: "1,500,000", rate: "7.2%" },
];

const STATIC_REPORT: CreditReport = {
  generated_at: new Date().toISOString(),
  score: SCORE,
  letter: LETTER,
  rating: RATING,
  percentile: PERCENTILE,
  visual_pct: VISUAL_PCT,
  valid_until: "2026-08-01",
  ratios: STATIC_RATIOS,
  strengths: [
    "Profit margin 35% above sector average",
    "Strong, sustained revenue growth over 3 years",
    "Comfortable liquidity ratio exceeding bank requirements",
  ],
  risks: [
    "Collection period 7 days above sector average",
    "40% of revenue concentrated in a single client",
  ],
  recommendations: [
    "Apply a stricter collection policy to reduce DSO to 35 days",
    "Diversify the customer base to reduce concentration risk",
    "Document multi-year contracts to strengthen bank confidence",
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ pct, score }: { pct: number; score: number }) {
  const r = 54, circ = 2 * Math.PI * r;
  const color = pct >= 65 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="relative flex h-36 w-36 items-center justify-center shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle cx="72" cy="72" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="text-center">
        <p className="text-2xl font-black tabular-nums" style={{ color }}>{score}</p>
        <p className="text-[10px] text-[var(--muted-foreground)]">out of 900</p>
      </div>
    </div>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────

const shareBanks = ["Saudi National Bank", "Al Rajhi Bank", "Alinma Bank", "Riyad Bank"];

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
        <DialogHeader className="border-b border-[var(--border)] px-5 py-4 flex flex-row items-center justify-between">
          <DialogTitle>Share credit report</DialogTitle>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--muted)]">
            <X className="h-4 w-4" />
          </button>
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

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function NarrativeSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {[80, 65, 90, 70].map(w => (
        <div key={w} className="h-3 rounded bg-[var(--muted)]" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SESSION_KEY = "credit_report_cache_en";

export default function CreditEnPage() {
  const [tab, setTab] = useState<"ratios" | "banks">("ratios");
  const [showShareModal, setShowShareModal] = useState(false);
  const [report, setReport] = useState<CreditReport>(STATIC_REPORT);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async (isRefresh = false) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/credit-report");
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.report));
        if (isRefresh) toast.success("Report updated with the latest bank data");
      }
    } catch {
      if (isRefresh) toast.error("Failed to refresh, please try again");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      try { setReport(JSON.parse(cached)); return; } catch { /* ignore */ }
    }
    fetchReport();
  }, [fetchReport]);

  const goodCount = report.ratios.filter(r => r.status === "good").length;
  const warningCount = report.ratios.filter(r => r.status !== "good").length;

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">

      {showShareModal && <ShareCreditModal letter={report.letter} onClose={() => setShowShareModal(false)} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Credit Rating & Benchmarking</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Assess your company's financing readiness and compare it against sector averages
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => fetchReport(true)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setShowShareModal(true)}>
            <Share2 className="h-4 w-4" />
            Share with bank
          </Button>
        </div>
      </div>

      {/* Score hero */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <ScoreRing pct={report.visual_pct} score={report.score} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 sm:gap-3 sm:mb-2">
                  <span className="text-3xl font-black text-[var(--success)] sm:text-4xl">{report.letter}</span>
                  <Badge variant="success" className="text-xs px-2 py-0.5">{report.rating}</Badge>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] sm:text-sm">
                  Generated: {new Date(report.generated_at).toLocaleDateString("en-GB")} · Valid until: {report.valid_until}
                </p>
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
                    <BarChart3 className="h-3.5 w-3.5 text-[var(--primary)]" />
                    <span className="text-xs font-bold text-[var(--primary)]">Above {report.percentile}% of sector companies</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sustainability score */}
            <div className="flex items-center gap-4 border-t border-[var(--border)] pt-4 sm:gap-6">
              <SharedScoreRing value={SUSTAINABILITY_SCORE.value} max={SUSTAINABILITY_SCORE.max} size={96} colorOverride="#0f766e" />
              <div>
                <p className="text-sm font-bold text-[var(--foreground)] mb-2">Financial Sustainability Score</p>
                <Badge variant="secondary" className="text-xs">Stable</Badge>
              </div>
            </div>

            {/* Strengths & risks */}
            <div className="grid grid-cols-1 gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold text-[var(--muted-foreground)] mb-2">Strengths</p>
                {loading ? <NarrativeSkeleton /> : (
                  <ul className="space-y-1.5">
                    {report.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[var(--foreground)]">
                        <TrendingUp className="h-3.5 w-3.5 text-[var(--success)] mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--muted-foreground)] mb-2">Risks to address</p>
                {loading ? <NarrativeSkeleton /> : (
                  <ul className="space-y-1.5">
                    {report.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[var(--foreground)]">
                        <AlertCircle className="h-3.5 w-3.5 text-[var(--warning)] mt-0.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
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
                  style={{ left: `${((report.score - 300) / 600) * 100}%`, top: "-10px", transform: "translateX(-50%)" }}
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

      {/* Tabs */}
      <div className="flex gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--muted)] p-1 w-fit">
        {[
          { key: "ratios", label: "Credit Ratios" },
          { key: "banks", label: "Financing Offers" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`rounded-[10px] px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
              tab === t.key
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow-soft)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "ratios" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(loading ? STATIC_RATIOS : report.ratios).map(ratio => {
              const isGood = ratio.status === "good";
              const isBad = ratio.status === "bad";
              const color = isGood ? "var(--success)" : isBad ? "var(--destructive)" : "var(--warning)";
              const barPct = Math.min(100, Math.round((ratio.value / (ratio.benchmark * 1.6)) * 100));
              return (
                <Card key={ratio.key} className={`transition-opacity ${loading ? "opacity-40" : ""} ${!isGood ? "border-[var(--warning)]/30" : ""}`}>
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
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${barPct}%`, background: color }} />
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
                <h2 className="text-base font-bold text-[var(--foreground)]">Recommendations to improve rating</h2>
                {!loading && (
                  <span className="text-[10px] text-[var(--muted-foreground)] ml-auto">AI-generated</span>
                )}
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="flex items-center gap-3 rounded-[12px] border border-[var(--border)] px-4 py-3 animate-pulse">
                      <div className="h-6 w-6 rounded-full bg-[var(--muted)] shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 rounded bg-[var(--muted)] w-3/4" />
                        <div className="h-3 rounded bg-[var(--muted)] w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {report.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-[12px] border border-[var(--primary)]/15 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)] px-4 py-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white text-xs font-black">{i + 1}</span>
                      <p className="text-sm text-[var(--foreground)] leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "banks" && (
        <div className="space-y-4">
          <div className="rounded-[14px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_5%,transparent)] px-5 py-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[var(--primary)] shrink-0" />
              <p className="text-sm font-bold text-[var(--foreground)]">
                Based on your {report.letter} rating, you qualify for financing up to SAR 3,000,000
              </p>
            </div>
          </div>
          {banksList.map(bank => (
            <Card key={bank.name}>
              <CardContent className="p-5">
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
                    <Button size="sm" className="gap-1.5 shrink-0"
                      onClick={() => setShowShareModal(true)}>
                      <Share2 className="h-3.5 w-3.5" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sector benchmark comparison */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-base font-bold text-[var(--foreground)] mb-1">Credit metrics vs. sector</h2>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">
            {MOCK_CREDIT_REPORT.benchmarkSummary.sector} · {MOCK_CREDIT_REPORT.benchmarkSummary.region}
          </p>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs text-[var(--success)] font-bold">
              Above average: {MOCK_CREDIT_REPORT.benchmarkSummary.aboveAverage} metrics
            </span>
            <span className="text-xs text-[var(--destructive)] font-bold">
              Below average: {MOCK_CREDIT_REPORT.benchmarkSummary.belowAverage} metric ({MOCK_CREDIT_REPORT.benchmarkSummary.belowAverageNote})
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
              {MOCK_CREDIT_REPORT.benchmarkRows.map(row => (
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
  );
}
