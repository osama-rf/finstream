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
  return {
    quarter: `الربع ${index === 0 ? "الأول" : "الثاني"}`,
    revenue: months.reduce((sum, month) => sum + month.revenue, 0),
    expenses: months.reduce((sum, month) => sum + month.expense, 0),
    forecast: false,
  };
});
const quarterlyData = [
  ...actualQuarterlyData,
  { quarter: "الربع الثالث", revenue: 2_520_000, expenses: 1_245_000, forecast: true },
  { quarter: "الربع الرابع", revenue: 2_760_000, expenses: 1_310_000, forecast: true },
];

const expenseBreakdown = ANALYTICS_OVERVIEW.expenseBreakdown.map(e => ({
  label: e.label, amount: Math.round((e.pct / 100) * 2_343_200), pct: e.pct, color: e.color,
}));

const revenueBySource = ANALYTICS_OVERVIEW.revenueBySource.map(r => ({
  label: r.label, amount: Math.round((r.pct / 100) * ANALYTICS_OVERVIEW.totalRevenueQuarter), pct: r.pct, color: r.color,
}));

const banksList = [
  { name: "البنك الأهلي السعودي", product: "تمويل رأس المال العامل", maxAmount: "3,000,000", rate: "6.5%" },
  { name: "بنك الراجحي", product: "تمويل المشاريع الصغيرة", maxAmount: "2,500,000", rate: "6.9%" },
  { name: "مصرف الإنماء", product: "خط ائتمان متجدد", maxAmount: "1,500,000", rate: "7.2%" },
];

const shareBanks = ["البنك الأهلي السعودي", "بنك الراجحي", "مصرف الإنماء", "بنك الرياض"];

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
          <div><p className="text-[11px] text-[var(--muted-foreground)] font-arabic">إيرادات العام المتوقعة</p><p className="mt-1 text-lg font-bold text-[var(--foreground)]" dir="ltr">{formatCurrency(totalRevenue)}</p></div>
          <div><p className="text-[11px] text-[var(--muted-foreground)] font-arabic">مصروفات العام المتوقعة</p><p className="mt-1 text-lg font-bold text-[var(--foreground)]" dir="ltr">{formatCurrency(totalExpenses)}</p></div>
          <div><p className="text-[11px] text-[var(--muted-foreground)] font-arabic">هامش التشغيل</p><p className="mt-1 text-lg font-bold text-[var(--success)]" dir="ltr">{operatingMargin}%</p></div>
          <div><p className="text-[11px] text-[var(--muted-foreground)] font-arabic">نمو الإيرادات ربعياً</p><p className="mt-1 text-lg font-bold text-[var(--success)]" dir="ltr">+{revenueGrowth}%</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-[var(--surface)] px-3 py-1.5">
          <span className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] font-arabic"><i className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />الإيرادات</span>
          <span className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] font-arabic"><i className="h-2.5 w-2.5 rounded-full bg-[var(--destructive)] opacity-70" />المصروفات</span>
          <span className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] font-arabic"><i className="w-4 border-t-2 border-dashed border-[var(--muted-foreground)]" />متوقّع</span>
        </div>
      </div>

      <div className="flex items-stretch gap-1">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between text-[9px] text-[var(--muted-foreground)] tabular-nums pb-5" style={{ height: heightPx }}>
          <span>{Math.round(maxVal / 1000)}k</span>
          <span>{Math.round(maxVal / 2000)}k</span>
          <span>0</span>
        </div>

        {/* Bars */}
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
                    <p className="text-[11px] font-bold text-[var(--foreground)] font-arabic">
                      {activeItem.quarter}{activeItem.forecast && " (متوقّع)"}
                    </p>
                    <p className="text-[10px] text-[var(--primary)] tabular-nums" dir="ltr">إيرادات: {formatCurrency(activeItem.revenue)}</p>
                    <p className="text-[10px] text-[var(--destructive)] tabular-nums" dir="ltr">مصروفات: {formatCurrency(activeItem.expenses)}</p>
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
                  className="mt-1.5 text-[9px] font-arabic"
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
            <p className="text-sm font-bold text-[var(--foreground)] font-arabic">
              تفاصيل {detailItem.quarter}{detailItem.forecast && " — متوقّع"}
            </p>
            <button onClick={() => setSelectedIndex(null)} className="text-xs text-[var(--muted-foreground)] font-arabic hover:text-[var(--foreground)]">إغلاق</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">الإيرادات</p>
              <p className="text-sm font-bold text-[var(--primary)] tabular-nums" dir="ltr">{formatCurrency(detailItem.revenue)}</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">المصروفات</p>
              <p className="text-sm font-bold text-[var(--destructive)] tabular-nums" dir="ltr">{formatCurrency(detailItem.expenses)}</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">هامش الربح</p>
              <p className="text-sm font-bold text-[var(--success)] tabular-nums" dir="ltr">{detailMargin}%</p>
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
    setTimeout(() => { onClose(); toast.success(`تم إرسال التقرير الائتماني ${letter} إلى ${selected}`); }, 700);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-sm p-0" dir="rtl">
        <DialogHeader className="border-b border-[var(--border)] px-5 py-4 pe-14">
          <DialogTitle className="font-arabic">مشاركة التقرير الائتماني</DialogTitle>
        </DialogHeader>
        <div className="p-5 space-y-4">
          <div className="rounded-[10px] border border-[var(--success)]/30 bg-[color:color-mix(in_srgb,var(--success)_6%,transparent)] px-4 py-3 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[var(--success)] shrink-0" />
            <div>
              <p className="text-sm font-bold text-[var(--foreground)] font-arabic">التصنيف الائتماني {letter}</p>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic">سيتلقى البنك تقريراً مشفراً بصلاحية 30 يوماً</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--muted-foreground)] font-arabic mb-2 block">اختر البنك</label>
            <div className="space-y-2">
              {shareBanks.map(b => (
                <button key={b} onClick={() => setSelected(b)}
                  className={`w-full text-right rounded-[10px] border px-4 py-2.5 text-sm font-arabic transition-all ${
                    selected === b
                      ? "border-[var(--primary)] bg-[color:color-mix(in_srgb,var(--primary)_8%,transparent)] text-[var(--primary)] font-bold"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
                  }`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full font-arabic gap-2" onClick={handleSend} disabled={sending || sent}>
            {sent ? (
              <><CheckCircle2 className="h-4 w-4" />تم الإرسال</>
            ) : sending ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />جاري الإرسال...</>
            ) : (
              <><Send className="h-4 w-4" />إرسال التقرير</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [scenario, setScenario] = useState(SCENARIO_BASELINE);

  const totalRevenue = revenueBySource.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenseBreakdown.reduce((s, e) => s + e.amount, 0);

  const scenarioResult = useMemo(() => computeScenario(scenario), [scenario]);

  const goodCount = CREDIT_REPORT.ratios.filter(r => r.status === "good").length;
  const warningCount = CREDIT_REPORT.ratios.filter(r => r.status !== "good").length;

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">

      {showShareModal && <ShareCreditModal letter={CREDIT_REPORT.letter} onClose={() => setShowShareModal(false)} />}

      <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">التحليل المالي</h1>

      {/* توزيع المصروفات + مصادر الإيرادات */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[var(--destructive)]" />
              توزيع المصروفات
            </h2>
            <div className="flex items-center gap-4">
              <DonutChart slices={expenseBreakdown.map(e => ({ pct: e.pct, color: e.color }))} size={120} />
              <div className="flex-1 space-y-2">
                {expenseBreakdown.map(e => (
                  <div key={e.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: e.color }} />
                      <span className="text-xs text-[var(--foreground)] font-arabic truncate">{e.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums" dir="ltr">{formatCurrency(e.amount)}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-arabic">{e.pct}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
              <span className="text-sm font-bold text-[var(--foreground)] font-arabic">الإجمالي</span>
              <span className="text-sm font-bold text-[var(--destructive)] tabular-nums" dir="ltr">{formatCurrency(totalExpenses)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
              مصادر الإيرادات
            </h2>
            <div className="space-y-3">
              {revenueBySource.map(r => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-[var(--foreground)] font-arabic">{r.label}</span>
                    <span className="font-bold text-[var(--foreground)]">{r.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
              <span className="text-sm font-bold text-[var(--foreground)] font-arabic">إجمالي الإيرادات</span>
              <span className="text-sm font-bold text-[var(--primary)] tabular-nums" dir="ltr">{formatCurrency(totalRevenue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-bold text-[var(--foreground)] font-arabic mb-1 flex items-center gap-2"><div className="h-4 w-1 rounded-full bg-[var(--primary)]" />اتجاه الإيرادات مقابل المصروفات</h2>
          <p className="mb-4 text-xs text-[var(--muted-foreground)] font-arabic">الأداء الفعلي للنصف الأول وتوقعات النصف الثاني لعام 2026</p>
          <QuarterlyBarChart data={quarterlyData} />
        </CardContent>
      </Card>

      {/* التصنيف الائتماني */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">التصنيف الائتماني</h2>
            <Button size="sm" className="font-arabic gap-2" onClick={() => setShowShareModal(true)}>
              <Share2 className="h-4 w-4" />
              مشاركة مع بنك
            </Button>
          </div>
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <ScoreRing value={CREDIT_REPORT.score} max={CREDIT_REPORT.max} size={144} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 sm:gap-3 sm:mb-2">
                  <span className="text-3xl font-black text-[var(--success)] sm:text-4xl">{CREDIT_REPORT.letter}</span>
                  <Badge variant="success" className="font-arabic text-xs px-2 py-0.5">{CREDIT_REPORT.rating}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />
                    <span className="text-xs font-bold text-[var(--success)] font-arabic">{goodCount} مؤشر إيجابي</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-[var(--warning)]" />
                    <span className="text-xs font-bold text-[var(--warning)] font-arabic">{warningCount} تحتاج تحسين</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[var(--primary)] font-arabic">أعلى من {CREDIT_REPORT.percentile}% من شركات القطاع</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold text-[var(--muted-foreground)] font-arabic mb-2">نقاط القوة</p>
                <ul className="space-y-1.5">
                  {CREDIT_REPORT.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[var(--foreground)] font-arabic">
                      <TrendingUp className="h-3.5 w-3.5 text-[var(--success)] mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--muted-foreground)] font-arabic mb-2">مخاطر تحتاج معالجة</p>
                <ul className="space-y-1.5">
                  {CREDIT_REPORT.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[var(--foreground)] font-arabic">
                      <AlertCircle className="h-3.5 w-3.5 text-[var(--warning)] mt-0.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <p className="text-[10px] text-[var(--muted-foreground)] font-arabic mb-3">سلّم التصنيف الائتماني — نطاق 300 إلى 900</p>
              <div className="relative h-3 rounded-full flex" dir="ltr" style={{ overflow: "visible" }}>
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

      {/* محاكي السيناريوهات */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-3">محاكي السيناريوهات</h2>
        <Card>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-[var(--foreground)] font-arabic">نمو الإيرادات الشهري</span>
                  <b className="tabular-nums" dir="ltr">{scenario.revenueGrowthPct > 0 ? "+" : ""}{scenario.revenueGrowthPct}%</b>
                </div>
                <Slider min={-10} max={20} value={scenario.revenueGrowthPct}
                  onChange={v => setScenario(prev => ({ ...prev, revenueGrowthPct: v }))} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-[var(--foreground)] font-arabic">خفض المصروفات التشغيلية</span>
                  <b className="tabular-nums" dir="ltr">{scenario.expenseReductionPct}%</b>
                </div>
                <Slider min={-20} max={10} value={scenario.expenseReductionPct}
                  onChange={v => setScenario(prev => ({ ...prev, expenseReductionPct: v }))} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-[var(--foreground)] font-arabic">تمويل إضافي مقترح</span>
                  <b className="tabular-nums" dir="ltr">{formatCurrency(scenario.additionalFinancing)}</b>
                </div>
                <Slider min={0} max={500_000} step={10_000} value={scenario.additionalFinancing}
                  onChange={v => setScenario(prev => ({ ...prev, additionalFinancing: v }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-6 sm:grid-cols-3">
              <Card className="bg-[var(--surface)]">
                <CardContent className="p-4">
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">مدار نقدي متوقّع</p>
                  <p className="text-lg font-bold text-[var(--foreground)] tabular-nums" dir="ltr">{scenarioResult.projectedRunwayMonths} شهر</p>
                </CardContent>
              </Card>
              <Card className="bg-[var(--surface)]">
                <CardContent className="p-4">
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">تصنيف ائتماني متوقّع</p>
                  <p className="text-lg font-bold text-[var(--foreground)]" dir="ltr">{scenarioResult.projectedCreditRating}</p>
                </CardContent>
              </Card>
              <Card className="bg-[var(--surface)]">
                <CardContent className="p-4">
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">مؤشر استدامة متوقّع</p>
                  <p className="text-lg font-bold text-[var(--foreground)] tabular-nums" dir="ltr">{scenarioResult.projectedSustainabilityScore} / 100</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* المؤشرات والعروض */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-3">المؤشرات والعروض</h2>
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
                      <p className="text-sm font-bold text-[var(--foreground)] font-arabic leading-snug">{ratio.label}</p>
                      {isGood
                        ? <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0" />
                        : <AlertCircle className="h-4 w-4 shrink-0" style={{ color }} />}
                    </div>
                    <p className="text-2xl font-black tabular-nums mb-1" style={{ color }} dir="ltr">
                      {ratio.value}{ratio.unit}
                    </p>
                    <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden mb-2">
                      <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: color }} />
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">{ratio.benchmarkLabel}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="text-base font-bold text-[var(--foreground)] font-arabic">توصيات لتحسين التصنيف</h3>
              </div>
              <div className="space-y-3">
                {CREDIT_REPORT.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-[12px] border border-[var(--primary)]/15 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)] px-4 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white text-xs font-black">{i + 1}</span>
                    <div>
                      <p className="text-sm text-[var(--foreground)] font-arabic leading-relaxed">{rec.text}</p>
                      <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-0.5">{rec.sub}</p>
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
                  <p className="text-sm font-bold text-[var(--foreground)] font-arabic">
                    بناءً على تصنيفك {CREDIT_REPORT.letter}، أنت مؤهل للحصول على تمويل يصل إلى 3 مليون ريال
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
                          <p className="font-bold text-[var(--foreground)] font-arabic">{bank.name}</p>
                          <p className="text-sm text-[var(--muted-foreground)] font-arabic">{bank.product}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-center">
                          <p className="text-xs text-[var(--muted-foreground)] font-arabic">الحد الأقصى</p>
                          <p className="text-base font-bold text-[var(--foreground)] font-arabic" dir="ltr">{bank.maxAmount} ر.س</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[var(--muted-foreground)] font-arabic">معدل الربح</p>
                          <p className="text-base font-bold text-[var(--success)]" dir="ltr">{bank.rate}</p>
                        </div>
                        <Button size="sm" className="font-arabic gap-1.5 shrink-0" onClick={() => setShowShareModal(true)}>
                          <Share2 className="h-3.5 w-3.5" />
                          إرسال
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
              <h3 className="text-base font-bold text-[var(--foreground)] font-arabic mb-1">مؤشرات ائتمانية مقارنة بالقطاع</h3>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-4">
                {CREDIT_REPORT.benchmarkSummary.sector} · {CREDIT_REPORT.benchmarkSummary.region}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs text-[var(--success)] font-bold font-arabic">
                  فوق المتوسط: {CREDIT_REPORT.benchmarkSummary.aboveAverage} مؤشرات
                </span>
                <span className="text-xs text-[var(--destructive)] font-bold font-arabic">
                  أدنى المتوسط: {CREDIT_REPORT.benchmarkSummary.belowAverage} مؤشر ({CREDIT_REPORT.benchmarkSummary.belowAverageNote})
                </span>
              </div>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>المؤشر</TableHeaderCell>
                    <TableHeaderCell>شركتك</TableHeaderCell>
                    <TableHeaderCell>متوسط القطاع</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {CREDIT_REPORT.benchmarkRows.map(row => (
                    <TableRow key={row.key}>
                      <TableCell>{row.label}</TableCell>
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
