"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet, TrendingUp, TrendingDown, ShieldCheck, RefreshCw, Plus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Toggle } from "@/components/ui/toggle";
import { Slider } from "@/components/ui/slider";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import {
  SUSTAINABILITY_SCORE, FINANCIAL_GOALS, ALERT_THRESHOLDS, MANUAL_ENTRIES,
  SCENARIO_BASELINE, computeScenario, BANKING_SUMMARY,
} from "@/lib/mock";
import type { ManualEntry } from "@/lib/mock";

const kpis = [
  { label: "Total aggregated balance", value: BANKING_SUMMARY.totalBalance, change: "+8.3%", up: true, icon: Wallet, color: "var(--primary)" },
  { label: "Net revenue (30 days)", value: 847_500, change: "+12.4%", up: true, icon: TrendingUp, color: "var(--success)" },
  { label: "Total expenses (30 days)", value: 423_200, change: "+3.1%", up: false, icon: TrendingDown, color: "var(--destructive)" },
  { label: "Credit rating", value: "A-", change: "Very good", up: null as boolean | null, icon: ShieldCheck, color: "var(--primary)" },
];

function AddManualEntryModal({ onClose, onAdd }: { onClose: () => void; onAdd: (e: ManualEntry) => void }) {
  const [desc, setDesc] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");

  function handleSave() {
    if (!desc || !amount) {
      toast.error("Please fill in all fields");
      return;
    }
    onAdd({
      id: String(Date.now()),
      desc,
      type,
      amount: Number(amount),
      date: new Date().toISOString().slice(0, 10),
    });
    toast.success("Manual entry added");
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md" dir="ltr">
        <DialogHeader>
          <DialogTitle>Add manual entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Cash advance — trade fair" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              <button onClick={() => setType("income")}
                className={`flex-1 rounded-[10px] border px-4 py-2 text-sm ${type === "income" ? "border-[var(--success)] bg-[color:color-mix(in_srgb,var(--success)_8%,transparent)] text-[var(--success)] font-bold" : "border-[var(--border)] text-[var(--foreground)]"}`}>
                Income
              </button>
              <button onClick={() => setType("expense")}
                className={`flex-1 rounded-[10px] border px-4 py-2 text-sm ${type === "expense" ? "border-[var(--destructive)] bg-[color:color-mix(in_srgb,var(--destructive)_8%,transparent)] text-[var(--destructive)] font-bold" : "border-[var(--border)] text-[var(--foreground)]"}`}>
                Expense
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Amount (SAR)</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function IndicatorsEnPage() {
  const [entries, setEntries] = useState<ManualEntry[]>(MANUAL_ENTRIES);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [thresholds, setThresholds] = useState(ALERT_THRESHOLDS);
  const [scenario, setScenario] = useState(SCENARIO_BASELINE);
  const [refreshing, setRefreshing] = useState(false);

  const scenarioResult = useMemo(() => computeScenario(scenario), [scenario]);

  async function handleRefresh() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    setRefreshing(false);
    toast.success("Indicators refreshed");
  }

  function toggleThreshold(key: string) {
    setThresholds(prev => prev.map(t => t.key === key ? { ...t, enabled: !t.enabled } : t));
  }

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">

      {showAddEntry && (
        <AddManualEntryModal onClose={() => setShowAddEntry(false)} onAdd={e => setEntries(prev => [e, ...prev])} />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Financial Indicators & Controls</h1>
        <Button variant="outline" size="sm" className="gap-2 w-fit" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh now"}
        </Button>
      </div>

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
                  {kpi.up !== null && (
                    <span className="text-[10px] font-bold sm:text-xs" style={{ color: kpi.up ? "var(--success)" : "var(--destructive)" }}>
                      {kpi.change}
                    </span>
                  )}
                  {kpi.up === null && <Badge variant="default" className="text-[10px]">{kpi.change}</Badge>}
                </div>
                <p className="text-sm font-bold tabular-nums leading-tight break-all sm:text-xl" style={{ color: kpi.color }}>
                  {typeof kpi.value === "number" ? formatCurrency(kpi.value) : kpi.value}
                </p>
                <p className="mt-1 text-[10px] text-[var(--muted-foreground)] leading-snug sm:text-xs">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] mb-4">Financial Sustainability Score</h2>
            <div className="flex items-center gap-5">
              <ScoreRing value={SUSTAINABILITY_SCORE.value} max={SUSTAINABILITY_SCORE.max} size={110} colorOverride="var(--primary)" />
              <div className="flex-1 space-y-2.5">
                {SUSTAINABILITY_SCORE.subMetrics.map(m => (
                  <div key={m.key} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted-foreground)]">{m.label === "السيولة" ? "Liquidity" : m.label === "الربحية" ? "Profitability" : "Operational discipline"}</span>
                    <span className="font-bold text-[var(--foreground)]">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] mb-4">Financial Goals</h2>
            <div className="space-y-4">
              {FINANCIAL_GOALS.map(g => (
                <ProgressBar
                  key={g.key}
                  label={g.key === "runway" ? "Cash runway" : g.key === "dso" ? "Reduce collection period (DSO)" : "Monthly savings rate"}
                  valueLabel={`${g.current} / ${g.target} ${g.unit === "أشهر" ? "months" : g.unit === "يوم" ? "days" : g.unit}`}
                  pct={g.progressPct}
                  color={g.status === "good" ? "var(--success)" : "var(--warning)"}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] mb-4">Alert Thresholds</h2>
            <div className="space-y-1">
              {thresholds.map(t => (
                <div key={t.key} className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="text-sm text-[var(--foreground)]">
                      {t.key === "low_liquidity" ? "Liquidity below 300,000 SAR" : t.key === "unusual_expense" ? "Unusual expense > 50,000 SAR" : "Single customer concentration > 35%"}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {t.key === "low_liquidity" ? "Instant alert + email" : t.key === "unusual_expense" ? "Instant alert" : "Weekly report"}
                    </p>
                  </div>
                  <Toggle checked={t.enabled} onCheckedChange={() => toggleThreshold(t.key)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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

      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] mb-3">Manual Entries</h2>
        <Card>
          <CardContent className="p-5">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{e.desc}</TableCell>
                    <TableCell><Badge variant={e.type === "income" ? "success" : "secondary"}>{e.type === "income" ? "Income" : "Expense"}</Badge></TableCell>
                    <TableCell>{formatCurrency(e.amount)}</TableCell>
                    <TableCell>{e.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => setShowAddEntry(true)}>
              <Plus className="h-4 w-4" />
              Add manual entry
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
