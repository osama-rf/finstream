"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight, Clock3, CircleAlert, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { BANKS, CREDIT_REPORT, SUSTAINABILITY_SCORE } from "@/lib/mock";

export default function ControlCenterEnPage() {
  const connected = BANKS.filter(b => b.status === "connected");
  const totalBalance = connected.reduce((s, b) => s + b.balance, 0);
  const totalIn = connected.reduce((s, b) => s + b.monthlyIn, 0);
  const totalOut = connected.reduce((s, b) => s + b.monthlyOut, 0);
  const netBalance = totalIn - totalOut;
  const monthlyCoverage = totalOut > 0 ? totalBalance / totalOut : 0;
  const largestBank = connected.reduce((largest, bank) => bank.balance > largest.balance ? bank : largest, connected[0]);
  const largestBankShare = largestBank && totalBalance > 0 ? Math.round((largestBank.balance / totalBalance) * 100) : 0;

  const kpis = [
    { label: "Total balances", value: totalBalance, color: "var(--primary)", icon: Wallet },
    { label: "Revenue (30 days)", value: totalIn, color: "var(--success)", icon: TrendingUp },
    { label: "Payments (30 days)", value: totalOut, color: "var(--destructive)", icon: TrendingDown },
    { label: "Net balance (30 days)", value: netBalance, color: netBalance >= 0 ? "var(--success)" : "var(--destructive)", icon: ArrowLeftRight },
  ];

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Control Center</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">A unified executive view of liquidity, banking activity, and financial risk</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />Last updated: Jul 2, 2026 at 11:05 AM</span>
          <span className="flex items-center gap-1 text-[var(--success)]"><CheckCircle2 className="h-3.5 w-3.5" />{connected.length} sources connected</span>
        </div>
      </div>

      <Card className="border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)]">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
            <Wallet className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Total balances</p>
            <p className="text-2xl font-bold text-[var(--primary)] tabular-nums">{formatCurrency(totalBalance)}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Covers {monthlyCoverage.toFixed(1)} months of payments at the current run rate</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {kpis.slice(1).map(kpi => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]"
                    style={{ background: `color-mix(in srgb, ${kpi.color} 12%, transparent)` }}>
                    <Icon className="h-4 w-4" style={{ color: kpi.color }} />
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">{kpi.label}</p>
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: kpi.color }}>
                  {formatCurrency(kpi.value)}
                </p>
                <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
                  {kpi.label.includes("Revenue") ? "+8.4% vs. previous period" : kpi.label.includes("Payments") ? "+3.1% vs. previous period" : `${Math.round((netBalance / totalIn) * 100)}% of revenue retained`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] mb-3">Executive Readout</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card><CardContent className="p-5"><p className="text-xs text-[var(--muted-foreground)]">Cash-flow strength</p><p className="mt-1 text-lg font-bold text-[var(--success)]">Positive and stable</p><p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">Net inflow of {formatCurrency(netBalance)} over the last 30 days.</p></CardContent></Card>
          <Card className={largestBankShare > 60 ? "border-[var(--warning)]/30" : ""}><CardContent className="p-5"><p className="text-xs text-[var(--muted-foreground)]">Liquidity concentration</p><p className="mt-1 text-lg font-bold text-[var(--foreground)]">{largestBankShare}% at {largestBank?.name}</p><p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">Monitor reliance on one account and diversify operating reserves when needed.</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs text-[var(--muted-foreground)]">This week’s priority</p><p className="mt-1 text-lg font-bold text-[var(--warning)]">Accelerate collections</p><p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">DSO is 42 days; reducing it to 35 days supports liquidity and credit strength.</p></CardContent></Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] mb-4">Credit Rating</h2>
            <div className="flex items-center gap-5">
              <ScoreRing value={CREDIT_REPORT.score} max={CREDIT_REPORT.max} size={110} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-black text-[var(--success)]">{CREDIT_REPORT.letter}</span>
                  <Badge variant="success" className="text-xs">Very Good</Badge>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">Above {CREDIT_REPORT.percentile}% of sector companies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] mb-4">Financial Sustainability Score</h2>
            <div className="flex items-center gap-5">
              <ScoreRing value={SUSTAINABILITY_SCORE.value} max={SUSTAINABILITY_SCORE.max} size={110} colorOverride="var(--primary)" />
              <div className="flex-1 space-y-2.5">
                {SUSTAINABILITY_SCORE.subMetrics.map(m => (
                  <div key={m.key} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted-foreground)]">
                      {m.label === "السيولة" ? "Liquidity" : m.label === "الربحية" ? "Profitability" : "Operational discipline"}
                    </span>
                    <span className="font-bold text-[var(--foreground)]">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] mb-3">Balance Details</h2>
        <Card>
          <CardContent className="p-5">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Bank</TableHeaderCell>
                  <TableHeaderCell>Balance</TableHeaderCell>
                  <TableHeaderCell>In / out (30 days)</TableHeaderCell>
                  <TableHeaderCell>Net movement</TableHeaderCell>
                  <TableHeaderCell>Share of total</TableHeaderCell>
                  <TableHeaderCell>Sync status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connected.map(bank => (
                  <TableRow key={bank.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-white font-bold text-[11px]" style={{ background: bank.color }}>
                          {bank.name[0]}
                        </div>
                        {bank.name}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(bank.balance)}</TableCell>
                    <TableCell><span className="text-[var(--success)]">{formatCurrency(bank.monthlyIn)}</span> / <span className="text-[var(--destructive)]">{formatCurrency(bank.monthlyOut)}</span></TableCell>
                    <TableCell><span className="font-bold text-[var(--success)]">{formatCurrency(bank.monthlyIn - bank.monthlyOut)}</span></TableCell>
                    <TableCell>{totalBalance > 0 ? Math.round((bank.balance / totalBalance) * 100) : 0}%</TableCell>
                    <TableCell><Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Current</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--warning)]/25">
        <CardContent className="p-5"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" /><div><h2 className="text-sm font-bold text-[var(--foreground)]">Follow-up needed</h2><p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">Riyad Bank is currently disconnected, so its balances and activity are excluded from this summary. Reconnect it for a complete liquidity view.</p></div></div></CardContent>
      </Card>
    </div>
  );
}
