"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { BANKING_SUMMARY, BANKS, CREDIT_REPORT, SUSTAINABILITY_SCORE } from "@/lib/mock";

export default function ControlCenterEnPage() {
  const connected = BANKS.filter(b => b.status === "connected");
  const totalBalance = connected.reduce((s, b) => s + b.balance, 0);
  const totalIn = connected.reduce((s, b) => s + b.monthlyIn, 0);
  const totalOut = connected.reduce((s, b) => s + b.monthlyOut, 0);
  const netBalance = totalIn - totalOut;

  const kpis = [
    { label: "Total balances", value: totalBalance, color: "var(--primary)", icon: Wallet },
    { label: "Revenue (30 days)", value: totalIn, color: "var(--success)", icon: TrendingUp },
    { label: "Payments (30 days)", value: totalOut, color: "var(--destructive)", icon: TrendingDown },
    { label: "Net balance (30 days)", value: netBalance, color: netBalance >= 0 ? "var(--success)" : "var(--destructive)", icon: ArrowLeftRight },
  ];

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Control Center</h1>

      <Card className="border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)]">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
            <Wallet className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Total balances</p>
            <p className="text-2xl font-bold text-[var(--primary)] tabular-nums">{formatCurrency(totalBalance)}</p>
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
              </CardContent>
            </Card>
          );
        })}
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
                  <TableHeaderCell>Share of total</TableHeaderCell>
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
                    <TableCell>{totalBalance > 0 ? Math.round((bank.balance / totalBalance) * 100) : 0}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
