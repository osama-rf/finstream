"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { BANKING_SUMMARY, BANKS, CREDIT_REPORT, SUSTAINABILITY_SCORE } from "@/lib/mock";

export default function ControlCenterPage() {
  const connected = BANKS.filter(b => b.status === "connected");
  const totalBalance = connected.reduce((s, b) => s + b.balance, 0);
  const totalIn = connected.reduce((s, b) => s + b.monthlyIn, 0);
  const totalOut = connected.reduce((s, b) => s + b.monthlyOut, 0);
  const netBalance = totalIn - totalOut;

  const kpis = [
    { label: "إجمالي الأرصدة", value: totalBalance, color: "var(--primary)", icon: Wallet },
    { label: "الإيرادات (30 يوم)", value: totalIn, color: "var(--success)", icon: TrendingUp },
    { label: "المدفوعات (30 يوم)", value: totalOut, color: "var(--destructive)", icon: TrendingDown },
    { label: "صافي الرصيد (30 يوم)", value: netBalance, color: netBalance >= 0 ? "var(--success)" : "var(--destructive)", icon: ArrowLeftRight },
  ];

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">مركز التحكم</h1>

      {/* Total balance */}
      <Card className="border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)]">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
            <Wallet className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] font-arabic">إجمالي الأرصدة</p>
            <p className="text-2xl font-bold text-[var(--primary)] tabular-nums" dir="ltr">{formatCurrency(totalBalance)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Revenue / payments / net balance, 30 days */}
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
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">{kpi.label}</p>
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: kpi.color }} dir="ltr">
                  {formatCurrency(kpi.value)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Credit rating + sustainability score */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4">التصنيف الائتماني</h2>
            <div className="flex items-center gap-5">
              <ScoreRing value={CREDIT_REPORT.score} max={CREDIT_REPORT.max} size={110} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-black text-[var(--success)]">{CREDIT_REPORT.letter}</span>
                  <Badge variant="success" className="font-arabic text-xs">{CREDIT_REPORT.rating}</Badge>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic">أعلى من {CREDIT_REPORT.percentile}% من شركات القطاع</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4">مؤشر الاستدامة المالية</h2>
            <div className="flex items-center gap-5">
              <ScoreRing value={SUSTAINABILITY_SCORE.value} max={SUSTAINABILITY_SCORE.max} size={110} colorOverride="var(--primary)" />
              <div className="flex-1 space-y-2.5">
                {SUSTAINABILITY_SCORE.subMetrics.map(m => (
                  <div key={m.key} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted-foreground)] font-arabic">{m.label}</span>
                    <span className="font-bold text-[var(--foreground)]">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance details */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-3">تفاصيل الأرصدة</h2>
        <Card>
          <CardContent className="p-5">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>البنك</TableHeaderCell>
                  <TableHeaderCell>الرصيد</TableHeaderCell>
                  <TableHeaderCell>النسبة من الإجمالي</TableHeaderCell>
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
                    <TableCell><span dir="ltr">{formatCurrency(bank.balance)}</span></TableCell>
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
