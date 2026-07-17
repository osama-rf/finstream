"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight, Clock3, CircleAlert, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { getCreditReportForYear } from "@/lib/mock";
import { FINANCIAL_METRICS_BY_YEAR, FINANCIAL_YEARS, type FinancialYear } from "@/lib/data/financial-statements";
import { LICENSED_BANKS, SAMA_BANKS_SOURCE } from "@/lib/data/sama-licensed-entities";

const CASH_FLOW_INPUTS: Record<FinancialYear, { startingCash: number; capex: number; operatingIncome: number; debtService: number }> = {
  "2025": { startingCash: 49_976_430, capex: 18_525_365, operatingIncome: 10_287_981, debtService: 90_534_459 },
  "2024": { startingCash: 69_705_549, capex: 33_469_473, operatingIncome: 78_951_616, debtService: 77_964_856 },
  "2023": { startingCash: 17_426_387.25, capex: 8_367_368.25, operatingIncome: 19_737_904, debtService: 19_491_214 },
};

export default function ControlCenterPage() {
  const [selectedYear, setSelectedYear] = useState<FinancialYear>("2025");
  const selectedMetrics = FINANCIAL_METRICS_BY_YEAR[selectedYear];
  const previousYear = String(Math.max(2023, Number(selectedYear) - 1)) as FinancialYear;
  const previousMetrics = FINANCIAL_METRICS_BY_YEAR[previousYear];
  const revenueGrowth = selectedYear === "2023" ? null : ((selectedMetrics.revenue - previousMetrics.revenue) / previousMetrics.revenue) * 100;
  const netMargin = (selectedMetrics.netProfit / selectedMetrics.revenue) * 100;
  const cashFlowInputs = CASH_FLOW_INPUTS[selectedYear];
  const monthlyBurnRate = (cashFlowInputs.startingCash - selectedMetrics.cash) / 12;
  const freeCashFlow = selectedMetrics.operatingCashFlow - cashFlowInputs.capex;
  const dscr = cashFlowInputs.operatingIncome / cashFlowInputs.debtService;
  const capitalBase = selectedMetrics.equity + selectedMetrics.totalLiabilities;
  const equityWeight = selectedMetrics.equity / capitalBase;
  const debtWeight = selectedMetrics.totalLiabilities / capitalBase;
  const costOfEquity = 0.12;
  const costOfDebt = 0.065;
  const zakatRate = 0.025;
  const wacc = (costOfEquity * equityWeight + costOfDebt * debtWeight * (1 - zakatRate)) * 100;
  const currentRatio = selectedMetrics.currentAssets / selectedMetrics.currentLiabilities;
  const yearCreditReport = getCreditReportForYear(selectedYear);
  const liquidityScore = Math.min(100, Math.round((selectedMetrics.currentAssets / selectedMetrics.currentLiabilities / 2) * 100));
  const profitabilityScore = Math.min(100, Math.max(0, Math.round((selectedMetrics.netProfit / selectedMetrics.revenue) * 1000)));
  const cashFlowScore = selectedMetrics.operatingCashFlow > 0 ? 90 : 35;
  const sustainabilityScore = {
    value: Math.round(liquidityScore * 0.4 + profitabilityScore * 0.3 + cashFlowScore * 0.3),
    max: 100,
    subMetrics: [
      { key: "liquidity", label: "السيولة", value: liquidityScore },
      { key: "profitability", label: "الربحية", value: profitabilityScore },
      { key: "operational_discipline", label: "التدفق التشغيلي", value: cashFlowScore },
    ],
  };
  const bankAccounts = [
    { bank: "مصرف الراجحي", account: "حساب تشغيلي", iban: "SA•• 0001 2345", share: 0.52, status: "متصل" },
    { bank: "البنك الأهلي السعودي", account: "حساب التحصيل", iban: "SA•• 1016 7519", share: 0.31, status: "متصل" },
    { bank: "بنك الرياض", account: "حساب الرواتب", iban: "SA•• 8888 7777", share: 0.17, status: "متصل" },
  ].map(account => ({ ...account, balance: selectedMetrics.cash * account.share }));

  const kpis = [
    { label: "النقد وما في حكمه", value: selectedMetrics.cash, color: "var(--primary)", icon: Wallet },
    { label: `إيرادات ${selectedYear}`, value: selectedMetrics.revenue, color: "var(--success)", icon: TrendingUp },
    { label: `صافي ربح ${selectedYear}`, value: selectedMetrics.netProfit, color: "var(--success)", icon: TrendingDown },
    { label: "التدفق النقدي التشغيلي", value: selectedMetrics.operatingCashFlow, color: selectedMetrics.operatingCashFlow >= 0 ? "var(--success)" : "var(--destructive)", icon: ArrowLeftRight },
  ];

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">مركز التحكم</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)] font-arabic">ملخص تنفيذي موحّد للسيولة والحركة البنكية والمخاطر المالية</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[var(--muted-foreground)] font-arabic">
            <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />الفترة المنتهية في 31 ديسمبر {selectedYear}</span>
            <span className="flex items-center gap-1 text-[var(--success)]"><CheckCircle2 className="h-3.5 w-3.5" />قوائم {selectedYear} فعلية · {LICENSED_BANKS.length} بنكاً في سجل ساما</span>
          </div>
        </div>
        <label className="text-[10px] text-[var(--muted-foreground)] font-arabic">السنة المالية<select value={selectedYear} onChange={event => setSelectedYear(event.target.value as FinancialYear)} className="mt-1 block min-w-32 rounded-xl border border-[var(--border)] bg-[var(--card)] py-2.5 text-sm font-bold text-[var(--foreground)]">{FINANCIAL_YEARS.map(year => <option key={year}>{year}</option>)}</select></label>
      </div>

      {/* Total balance */}
      <Card className="border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)]">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
            <Wallet className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] font-arabic">النقد وما في حكمه</p>
            <p className="text-2xl font-bold text-[var(--control-balance-value)] tabular-nums" dir="ltr">{formatCurrency(selectedMetrics.cash)}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{selectedYear === "2023" ? "سنة الأساس " : <>مقارنةً بـ <span dir="ltr">{formatCurrency(previousMetrics.cash)}</span> في {previousYear}</>}</p>
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
                <p className="mt-1 text-[11px] text-[var(--muted-foreground)] font-arabic">
                  {kpi.label.includes("إيرادات") ? (revenueGrowth === null ? "سنة الأساس للمقارنة" : `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}% مقارنة بعام ${previousYear}`) : kpi.label.includes("ربح") ? `هامش صافي الربح ${netMargin.toFixed(1)}%` : `${selectedMetrics.operatingCashFlow >= 0 ? "تدفق مرتفع" : "تدفق منخفض"} في ${selectedYear}`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Financial health metrics */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-3">مؤشرات الصحة المالية</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Card><CardContent className="p-4"><p className="text-xs text-[var(--muted-foreground)] font-arabic">معدل الحرق الشهري</p><p className={`mt-2 text-lg font-bold ${monthlyBurnRate <= 0 ? "text-[var(--success)]" : "text-[var(--destructive)]"}`} dir="ltr">{formatCurrency(Math.abs(monthlyBurnRate))}</p><p className="mt-2 text-[10px] leading-4 text-[var(--muted-foreground)] font-arabic">{monthlyBurnRate <= 0 ? "توليد نقدي صافي" : "استهلاك نقدي"} · (نقد البداية − النهاية) ÷ 12</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-[var(--muted-foreground)] font-arabic">التدفق النقدي الحر FCF</p><p className={`mt-2 text-lg font-bold ${freeCashFlow >= 0 ? "text-[var(--success)]" : "text-[var(--destructive)]"}`} dir="ltr">{formatCurrency(freeCashFlow)}</p><p className="mt-2 text-[10px] leading-4 text-[var(--muted-foreground)] font-arabic">التدفق التشغيلي − الإنفاق الرأسمالي</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-[var(--muted-foreground)] font-arabic">تغطية خدمة الدين DSCR</p><p className={`mt-2 text-lg font-bold ${dscr >= 1.25 ? "text-[var(--success)]" : dscr >= 1 ? "text-[var(--warning)]" : "text-[var(--destructive)]"}`} dir="ltr">{dscr.toFixed(2)}x</p><p className="mt-2 text-[10px] leading-4 text-[var(--muted-foreground)] font-arabic">ربح العمليات ÷ أصل الدين والإيجارات وتكلفة التمويل</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-[var(--muted-foreground)] font-arabic">تكلفة رأس المال WACC</p><p className="mt-2 text-lg font-bold text-[var(--primary)]" dir="ltr">{wacc.toFixed(1)}%</p><p className="mt-2 text-[10px] leading-4 text-[var(--muted-foreground)] font-arabic">تكلفة ملكية 12% · دين 6.5% · زكاة 2.5%</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-[var(--muted-foreground)] font-arabic">نسبة السيولة الجارية</p><p className={`mt-2 text-lg font-bold ${currentRatio >= 1.5 ? "text-[var(--success)]" : "text-[var(--warning)]"}`} dir="ltr">{currentRatio.toFixed(2)}x</p><p className="mt-2 text-[10px] leading-4 text-[var(--muted-foreground)] font-arabic">الأصول المتداولة ÷ الالتزامات المتداولة</p></CardContent></Card>
        </div>
      </div>

      {/* Credit rating + sustainability score */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4">التصنيف الائتماني</h2>
            <div className="flex items-center gap-5">
              <ScoreRing
                value={yearCreditReport.score}
                max={yearCreditReport.max}
                size={110}
                detail={`تصنيف ${yearCreditReport.letter} · أعلى من ${yearCreditReport.percentile}% من القطاع`}
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-black text-[var(--success)]">{yearCreditReport.letter}</span>
                  <Badge variant="success" className="font-arabic text-xs">{yearCreditReport.rating}</Badge>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic">أعلى من {yearCreditReport.percentile}% من شركات القطاع</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4">مؤشر الاستدامة المالية</h2>
            <div className="flex items-center gap-5">
              <ScoreRing
                value={sustainabilityScore.value}
                max={sustainabilityScore.max}
                size={110}
                colorOverride="var(--primary)"
                detail={sustainabilityScore.subMetrics.map(m => `${m.label} ${m.value}`).join(" · ")}
              />
              <div className="flex-1 space-y-2.5">
                {sustainabilityScore.subMetrics.map(m => (
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

      {/* Bank accounts */}
      <div>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div><h2 className="text-base font-bold text-[var(--foreground)] font-arabic">الحسابات البنكية</h2><p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">توزيع النقد وما في حكمه للسنة المالية {selectedYear}</p></div>
          <div className="text-left"><p className="text-[10px] text-[var(--muted-foreground)] font-arabic">إجمالي الأرصدة</p><p className="text-sm font-bold text-[var(--foreground)]" dir="ltr">{formatCurrency(selectedMetrics.cash)}</p></div>
        </div>
        <Card>
          <CardContent className="p-5">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>البنك</TableHeaderCell>
                  <TableHeaderCell>الحساب</TableHeaderCell>
                  <TableHeaderCell>رقم الحساب</TableHeaderCell>
                  <TableHeaderCell>الرصيد</TableHeaderCell>
                  <TableHeaderCell>النسبة</TableHeaderCell>
                  <TableHeaderCell>الحالة</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bankAccounts.map(account => <TableRow key={account.bank}>
                  <TableCell className="font-arabic font-bold">{account.bank}</TableCell>
                  <TableCell className="font-arabic">{account.account}</TableCell>
                  <TableCell><span dir="ltr" className="text-[var(--muted-foreground)]">{account.iban}</span></TableCell>
                  <TableCell><span dir="ltr" className="font-bold">{formatCurrency(account.balance)}</span></TableCell>
                  <TableCell><span dir="ltr">{Math.round(account.share * 100)}%</span></TableCell>
                  <TableCell><Badge variant="success" className="font-arabic">{account.status}</Badge></TableCell>
                </TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* <Card className="border-[var(--warning)]/25">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
            <div>
              <h2 className="text-sm font-bold text-[var(--foreground)] font-arabic">حدود البيانات المتاحة</h2>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)] font-arabic">القوائم المالية تعرض إجمالي النقد ولا تتضمن توزيعاً حسب البنك. تُستخدم <a href={SAMA_BANKS_SOURCE} target="_blank" rel="noreferrer" className="text-[var(--primary)] underline">قائمة ساما</a> للتحقق من ترخيص البنك فقط، وليس لاستخراج أرصدة المنشأة.</p>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
