"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight, Clock3, CircleAlert, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { BANKS, CREDIT_REPORT, SUSTAINABILITY_SCORE } from "@/lib/mock";

export default function ControlCenterPage() {
  const connected = BANKS.filter(b => b.status === "connected");
  const totalBalance = connected.reduce((s, b) => s + b.balance, 0);
  const totalIn = connected.reduce((s, b) => s + b.monthlyIn, 0);
  const totalOut = connected.reduce((s, b) => s + b.monthlyOut, 0);
  const netBalance = totalIn - totalOut;
  const monthlyCoverage = totalOut > 0 ? totalBalance / totalOut : 0;
  const largestBank = connected.reduce((largest, bank) => bank.balance > largest.balance ? bank : largest, connected[0]);
  const largestBankShare = largestBank && totalBalance > 0 ? Math.round((largestBank.balance / totalBalance) * 100) : 0;

  const kpis = [
    { label: "إجمالي الأرصدة", value: totalBalance, color: "var(--primary)", icon: Wallet },
    { label: "الإيرادات (30 يوم)", value: totalIn, color: "var(--success)", icon: TrendingUp },
    { label: "المدفوعات (30 يوم)", value: totalOut, color: "var(--destructive)", icon: TrendingDown },
    { label: "صافي الرصيد (30 يوم)", value: netBalance, color: netBalance >= 0 ? "var(--success)" : "var(--destructive)", icon: ArrowLeftRight },
  ];

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">مركز التحكم</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)] font-arabic">ملخص تنفيذي موحّد للسيولة والحركة البنكية والمخاطر المالية</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[var(--muted-foreground)] font-arabic">
          <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />آخر تحديث: 2 يوليو 2026، 11:05 ص</span>
          <span className="flex items-center gap-1 text-[var(--success)]"><CheckCircle2 className="h-3.5 w-3.5" />{connected.length} مصادر متصلة</span>
        </div>
      </div>

      {/* Total balance */}
      <Card className="border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)]">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
            <Wallet className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] font-arabic">إجمالي الأرصدة</p>
            <p className="text-2xl font-bold text-[var(--primary)] tabular-nums" dir="ltr">{formatCurrency(totalBalance)}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">يغطي {monthlyCoverage.toFixed(1)} شهر من المدفوعات بالمعدل الحالي</p>
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
                  {kpi.label.includes("الإيرادات") ? "+8.4% مقارنة بالفترة السابقة" : kpi.label.includes("المدفوعات") ? "+3.1% مقارنة بالفترة السابقة" : `${Math.round((netBalance / totalIn) * 100)}% من الإيرادات محتفظ بها`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Executive insights */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-3">قراءة تنفيذية</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-[var(--muted-foreground)] font-arabic">قوة التدفق النقدي</p>
              <p className="mt-1 text-lg font-bold text-[var(--success)] font-arabic">موجب ومستقر</p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)] font-arabic">صافي تدفق قدره <span dir="ltr">{formatCurrency(netBalance)}</span> خلال آخر 30 يوماً.</p>
            </CardContent>
          </Card>
          <Card className={largestBankShare > 60 ? "border-[var(--warning)]/30" : ""}>
            <CardContent className="p-5">
              <p className="text-xs text-[var(--muted-foreground)] font-arabic">تركيز السيولة</p>
              <p className="mt-1 text-lg font-bold text-[var(--foreground)] font-arabic">{largestBankShare}% لدى {largestBank?.name}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)] font-arabic">راقب الاعتماد على حساب واحد ووزّع الاحتياطي التشغيلي عند الحاجة.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-[var(--muted-foreground)] font-arabic">أولوية هذا الأسبوع</p>
              <p className="mt-1 text-lg font-bold text-[var(--warning)] font-arabic">تسريع التحصيل</p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)] font-arabic">فترة التحصيل 42 يوماً؛ خفضها إلى 35 يوماً يدعم السيولة والتصنيف.</p>
            </CardContent>
          </Card>
        </div>
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
                  <TableHeaderCell>الداخل / الخارج (30 يوم)</TableHeaderCell>
                  <TableHeaderCell>صافي الحركة</TableHeaderCell>
                  <TableHeaderCell>النسبة من الإجمالي</TableHeaderCell>
                  <TableHeaderCell>حالة المزامنة</TableHeaderCell>
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
                    <TableCell><span className="text-[var(--success)]" dir="ltr">{formatCurrency(bank.monthlyIn)}</span> / <span className="text-[var(--destructive)]" dir="ltr">{formatCurrency(bank.monthlyOut)}</span></TableCell>
                    <TableCell><span className="font-bold text-[var(--success)]" dir="ltr">{formatCurrency(bank.monthlyIn - bank.monthlyOut)}</span></TableCell>
                    <TableCell>{totalBalance > 0 ? Math.round((bank.balance / totalBalance) * 100) : 0}%</TableCell>
                    <TableCell><Badge variant="success" className="gap-1 font-arabic"><CheckCircle2 className="h-3 w-3" />محدّث</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--warning)]/25">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
            <div>
              <h2 className="text-sm font-bold text-[var(--foreground)] font-arabic">تنبيه يحتاج متابعة</h2>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)] font-arabic">بنك الرياض غير متصل حالياً، لذلك لا تدخل أرصدته أو حركاته في هذا الملخص. إعادة الربط تمنحك صورة سيولة مكتملة.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
