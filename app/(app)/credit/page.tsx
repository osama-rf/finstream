"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Share2, RefreshCw, CheckCircle2,
  AlertCircle, TrendingUp, TrendingDown, Info,
  Building2, BarChart3, ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

// ─── Credit data ─────────────────────────────────────────────────────────────

const creditScore = { score: 74, rating: "A-", generatedAt: "2026-06-28", validUntil: "2026-07-28" };

const ratios = [
  { key: "profit_margin",  label: "هامش الربح الصافي",          value: 32.5, unit: "%",    benchmark: 24,  benchmarkLabel: "متوسط القطاع: 24%",      status: "good"    as const, description: "نسبة الربح الصافي من إجمالي الإيرادات" },
  { key: "current_ratio",  label: "نسبة السيولة الجارية",        value: 1.8,  unit: "x",    benchmark: 1.5, benchmarkLabel: "معيار البنوك: ≥ 1.5",     status: "good"    as const, description: "قدرة الشركة على تغطية التزاماتها قصيرة الأجل" },
  { key: "debt_equity",    label: "نسبة الدين إلى حقوق الملكية", value: 0.65, unit: "x",    benchmark: 0.8, benchmarkLabel: "معيار البنوك: ≤ 0.8",     status: "good"    as const, description: "مستوى الرافعة المالية للشركة" },
  { key: "dso",            label: "متوسط فترة التحصيل",          value: 42,   unit: "يوم",  benchmark: 35,  benchmarkLabel: "متوسط القطاع: 35 يوم",    status: "warning" as const, description: "متوسط الأيام اللازمة لتحصيل المستحقات" },
  { key: "revenue_growth", label: "نمو الإيرادات (سنوي)",        value: 18.4, unit: "%",    benchmark: 12,  benchmarkLabel: "متوسط القطاع: 12%",       status: "good"    as const, description: "معدل نمو الإيرادات مقارنةً بالعام الماضي" },
  { key: "cash_coverage",  label: "نسبة تغطية النقد",            value: 2.1,  unit: "x",    benchmark: 1.5, benchmarkLabel: "معيار البنوك: ≥ 1.5",     status: "good"    as const, description: "قدرة التدفقات النقدية على تغطية خدمة الدين" },
];

const strengths = [
  "هامش ربح فوق متوسط القطاع بنسبة 35%",
  "نمو إيرادات قوي ومستدام منذ 3 سنوات",
  "نسبة سيولة مريحة تتجاوز متطلبات البنوك",
];

const risks = [
  "فترة تحصيل المديونية أعلى من متوسط القطاع بـ 7 أيام",
  "تركز 40% من الإيرادات في عميل واحد",
];

const recommendations = [
  "تطبيق سياسة تحصيل أكثر صرامة لتقليل DSO إلى 35 يوماً",
  "تنويع قاعدة العملاء لتقليل مخاطر التركز",
  "توثيق العقود متعددة السنوات لتعزيز ثقة البنوك",
];

const banksList = [
  { name: "البنك الأهلي السعودي", product: "تمويل رأس المال العامل", maxAmount: "3,000,000", rate: "6.5%" },
  { name: "بنك الراجحي",          product: "تمويل المشاريع الصغيرة", maxAmount: "2,500,000", rate: "6.9%" },
  { name: "مصرف الإنماء",         product: "خط ائتمان متجدد",        maxAmount: "1,500,000", rate: "7.2%" },
];

// ─── Benchmarks data ──────────────────────────────────────────────────────────

type MetricStatus = "above" | "below" | "close";

const metrics = [
  { key: "net_margin",    label: "هامش الربح الصافي",          company: 32.5, sectorAvg: 24.1, topQuartile: 38,  unit: "%",       higherIsBetter: true  },
  { key: "revenue_growth",label: "نمو الإيرادات السنوي",       company: 18.4, sectorAvg: 12.3, topQuartile: 28,  unit: "%",       higherIsBetter: true  },
  { key: "gross_margin",  label: "هامش الربح الإجمالي",        company: 61,   sectorAvg: 58,   topQuartile: 72,  unit: "%",       higherIsBetter: true  },
  { key: "current_ratio", label: "نسبة السيولة الجارية",       company: 1.8,  sectorAvg: 1.5,  topQuartile: 2.4, unit: "x",       higherIsBetter: true  },
  { key: "dso",           label: "متوسط فترة التحصيل",         company: 42,   sectorAvg: 35,   topQuartile: 22,  unit: "يوم",     higherIsBetter: false },
  { key: "opex_ratio",    label: "نسبة المصروفات التشغيلية",   company: 48,   sectorAvg: 52,   topQuartile: 38,  unit: "%",       higherIsBetter: false },
  { key: "rev_employee",  label: "الإيراد لكل موظف",           company: 385,  sectorAvg: 310,  topQuartile: 520, unit: "ألف ر.س", higherIsBetter: true  },
  { key: "debt_equity",   label: "نسبة الدين إلى حقوق الملكية",company: 0.65, sectorAvg: 0.78, topQuartile: 0.45,unit: "x",       higherIsBetter: false },
];

function getBenchStatus(m: typeof metrics[0]): MetricStatus {
  const t = m.sectorAvg * 0.05;
  if (m.higherIsBetter) {
    return m.company >= m.sectorAvg + t ? "above" : m.company <= m.sectorAvg - t ? "below" : "close";
  } else {
    return m.company <= m.sectorAvg - t ? "above" : m.company >= m.sectorAvg + t ? "below" : "close";
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 54, circ = 2 * Math.PI * r;
  const color = score >= 70 ? "var(--success)" : score >= 50 ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="relative flex h-36 w-36 items-center justify-center shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle cx="72" cy="72" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-black tabular-nums" style={{ color }}>{score}</p>
        <p className="text-xs text-[var(--muted-foreground)] font-arabic">من 100</p>
      </div>
    </div>
  );
}

function MiniBar({ company, avg, top, higherIsBetter }: { company: number; avg: number; top: number; higherIsBetter: boolean }) {
  const max = Math.max(company, avg, top) * 1.15;
  const status: MetricStatus = higherIsBetter
    ? company >= avg * 1.05 ? "above" : company <= avg * 0.95 ? "below" : "close"
    : company <= avg * 0.95 ? "above" : company >= avg * 1.05 ? "below" : "close";
  const barColor = status === "above" ? "var(--success)" : status === "below" ? "var(--destructive)" : "var(--warning)";
  return (
    <div className="space-y-1.5 mt-2">
      {[
        { label: "شركتك",       pct: Math.round((company / max) * 100), val: company, color: barColor },
        { label: "متوسط القطاع", pct: Math.round((avg / max) * 100),     val: avg,     color: "var(--muted-foreground)" },
        { label: "الربع الأول",  pct: Math.round((top / max) * 100),     val: top,     color: "var(--primary)" },
      ].map(row => (
        <div key={row.label} className="flex items-center gap-1.5">
          <span className="text-[10px] w-16 shrink-0 text-[var(--muted-foreground)] font-arabic">{row.label}</span>
          <div className="flex-1 h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
          </div>
          <span className="text-[10px] font-bold tabular-nums w-10 text-end shrink-0" dir="ltr">{row.val}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreditPage() {
  const [tab, setTab] = useState<"ratios" | "banks" | "benchmarks">("ratios");
  const [sharing, setSharing]         = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function handleShare() {
    setSharing(true);
    await new Promise(r => setTimeout(r, 1500));
    setSharing(false);
    toast.success("تم إنشاء رابط مشاركة آمن — صالح لمدة 30 يوماً");
  }

  async function handleRegenerate() {
    setRegenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setRegenerating(false);
    toast.success("تم تحديث التقرير بآخر بيانات بنكية");
  }

  const goodCount    = ratios.filter(r => r.status === "good").length;
  const warningCount = ratios.filter(r => r.status === "warning").length;
  const aboveCount   = metrics.filter(m => getBenchStatus(m) === "above").length;
  const belowCount   = metrics.filter(m => getBenchStatus(m) === "below").length;

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">التقرير الائتماني</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">
            تقييم جاهزية منشأتك للتمويل البنكي ومقارنتها بمتوسطات القطاع
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="font-arabic gap-2" onClick={handleRegenerate} disabled={regenerating}>
            <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
            {regenerating ? "جاري التحديث..." : "تحديث"}
          </Button>
          <Button size="sm" className="font-arabic gap-2" onClick={handleShare} disabled={sharing}>
            <Share2 className="h-4 w-4" />
            {sharing ? "جاري الإنشاء..." : "مشاركة مع بنك"}
          </Button>
        </div>
      </div>

      {/* Score hero */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <ScoreRing score={creditScore.score} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 sm:gap-3 sm:mb-2">
                  <span className="text-3xl font-black text-[var(--success)] sm:text-4xl">{creditScore.rating}</span>
                  <Badge variant="success" className="font-arabic text-xs px-2 py-0.5">جيد جداً</Badge>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic sm:text-sm">
                  صدر: {creditScore.generatedAt} · صالح حتى: {creditScore.validUntil}
                </p>
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
                    <BarChart3 className="h-3.5 w-3.5 text-[var(--primary)]" />
                    <span className="text-xs font-bold text-[var(--primary)] font-arabic">تتفوق على {aboveCount} من 8 مؤشرات قطاعية</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Strengths & risks */}
            <div className="grid grid-cols-1 gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold text-[var(--muted-foreground)] font-arabic mb-2">نقاط القوة</p>
                <ul className="space-y-1.5">
                  {strengths.map((s, i) => (
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
                  {risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[var(--foreground)] font-arabic">
                      <AlertCircle className="h-3.5 w-3.5 text-[var(--warning)] mt-0.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--muted)] p-1 w-fit flex-wrap">
        {[
          { key: "ratios",      label: "المؤشرات الائتمانية" },
          { key: "benchmarks",  label: "مقارنة القطاع" },
          { key: "banks",       label: "عروض تمويل" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`rounded-[10px] px-3 py-2 text-xs font-medium font-arabic transition-all sm:px-4 sm:text-sm ${
              tab === t.key
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow-soft)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: ratios */}
      {tab === "ratios" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ratios.map(ratio => (
              <Card key={ratio.key} className={ratio.status === "warning" ? "border-[var(--warning)]/30" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-bold text-[var(--foreground)] font-arabic leading-snug">{ratio.label}</p>
                    {ratio.status === "good"
                      ? <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0" />
                      : <AlertCircle  className="h-4 w-4 text-[var(--warning)] shrink-0" />}
                  </div>
                  <p className="text-2xl font-black tabular-nums mb-1"
                    style={{ color: ratio.status === "good" ? "var(--success)" : "var(--warning)" }} dir="ltr">
                    {ratio.value}{ratio.unit}
                  </p>
                  <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden mb-2">
                    <div className="h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round((ratio.value / (ratio.benchmark * 1.6)) * 100))}%`,
                        background: ratio.status === "good" ? "var(--success)" : "var(--warning)" }} />
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">{ratio.benchmarkLabel}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)] font-arabic mt-1 leading-relaxed">{ratio.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">توصيات لتحسين التصنيف</h2>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-[12px] border border-[var(--primary)]/15 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)] px-4 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white text-xs font-black">{i + 1}</span>
                    <p className="text-sm text-[var(--foreground)] font-arabic leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: benchmarks */}
      {tab === "benchmarks" && (
        <div className="space-y-4">
          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "فوق المتوسط",  count: aboveCount, color: "var(--success)",    icon: CheckCircle2 },
              { label: "قريب المتوسط", count: metrics.filter(m => getBenchStatus(m) === "close").length, color: "var(--warning)", icon: BarChart3 },
              { label: "أدنى المتوسط", count: belowCount,  color: "var(--destructive)", icon: AlertCircle },
            ].map(s => {
              const Icon = s.icon;
              return (
                <Card key={s.label}>
                  <CardContent className="p-3 flex items-center gap-2 sm:gap-3 sm:p-4">
                    <Icon className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" style={{ color: s.color }} />
                    <div className="min-w-0">
                      <p className="text-xl font-black tabular-nums sm:text-2xl" style={{ color: s.color }}>{s.count}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)] font-arabic sm:text-xs">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {/* Metrics grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {metrics.map(m => {
              const status = getBenchStatus(m);
              const diff = m.higherIsBetter
                ? ((m.company - m.sectorAvg) / m.sectorAvg * 100).toFixed(1)
                : ((m.sectorAvg - m.company) / m.sectorAvg * 100).toFixed(1);
              const isPositive = parseFloat(diff) >= 0;
              return (
                <Card key={m.key} className={
                  status === "above" ? "border-[var(--success)]/20" :
                  status === "below" ? "border-[var(--destructive)]/15" : ""
                }>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-[var(--foreground)] font-arabic">{m.label}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isPositive
                          ? <ArrowUpRight className="h-4 w-4 text-[var(--success)]" />
                          : <TrendingDown className="h-4 w-4 text-[var(--destructive)]" />}
                        <span className="text-xs font-bold tabular-nums" dir="ltr"
                          style={{ color: isPositive ? "var(--success)" : "var(--destructive)" }}>
                          {isPositive ? "+" : ""}{diff}%
                        </span>
                        <Badge variant={status === "above" ? "success" : status === "below" ? "destructive" : "warning"}
                          className="font-arabic text-[10px] px-1.5 py-0.5">
                          {status === "above" ? "أفضل" : status === "below" ? "أدنى" : "متقارب"}
                        </Badge>
                      </div>
                    </div>
                    <MiniBar company={m.company} avg={m.sectorAvg} top={m.topQuartile} higherIsBetter={m.higherIsBetter} />
                    <p className="text-[10px] text-[var(--muted-foreground)] font-arabic mt-2">الوحدة: {m.unit}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Card className="border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)]">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--muted-foreground)] font-arabic leading-relaxed">
                  منشأتك تتفوق على <strong>{aboveCount}</strong> من أصل {metrics.length} مؤشراً مقارنةً بمتوسط قطاع الاستشارات والخدمات.
                  أبرز نقاط القوة: هامش الربح ونمو الإيرادات. أكبر فرصة للتحسين: تقليل فترة التحصيل (DSO)
                  التي ستؤثر إيجاباً على تصنيفك الائتماني وتسرّع الحصول على تمويل بشروط أفضل.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: banks */}
      {tab === "banks" && (
        <div className="space-y-4">
          <div className="rounded-[14px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_5%,transparent)] px-5 py-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[var(--foreground)] font-arabic">
                  بناءً على تصنيفك A-، أنت مؤهل للحصول على تمويل يصل إلى 3 مليون ريال
                </p>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-1">
                  شارك تقريرك الائتماني مع أي بنك بنقرة واحدة لتسريع طلب التمويل
                </p>
              </div>
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
                    <Button size="sm" className="font-arabic gap-1.5 shrink-0"
                      onClick={() => toast.success(`تم إرسال تقريرك الائتماني إلى ${bank.name}`)}>
                      <Share2 className="h-3.5 w-3.5" />
                      إرسال
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
