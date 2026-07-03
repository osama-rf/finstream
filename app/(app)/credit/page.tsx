"use client";

import { useState } from "react";
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

// ─── Credit data ─────────────────────────────────────────────────────────────

// التصنيف مصدره سمة (SIMAH) — منصة المعلومات الائتمانية المرخصة من ساما
// يُحسب بناءً على: سجل السداد، نسب الدين، نمو الإيرادات، وبيانات البنوك المربوطة
// نطاق سمة للشركات: 300–900 | المعادل الحرفي وفق إطار ساما للمصرفية المفتوحة
const SIMAH_SCORE   = 720;  // نطاق سمة: 300–900
const SIMAH_RATING  = "جيد جداً";
const SIMAH_LETTER  = "B+";  // معادل حرفي وفق إطار Open Banking السعودي
const SIMAH_PERCENTILE = 71; // أعلى من 71% من الشركات في نفس القطاع

const creditScore = {
  simahScore:  SIMAH_SCORE,
  simahRating: SIMAH_RATING,
  letter:      SIMAH_LETTER,
  percentile:  SIMAH_PERCENTILE,
  source:      "سمة (SIMAH)",
  sourceUrl:   "simah.com",
  generatedAt: "2026-07-01",
  validUntil:  "2026-08-01",
  // درجة مئوية للعرض البصري في الحلقة (300-900 → 0-100)
  visualPct:   Math.round(((SIMAH_SCORE - 300) / 600) * 100),
};

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
        <p className="text-[10px] text-[var(--muted-foreground)] font-arabic">من 900</p>
      </div>
    </div>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────

const shareBanks = ["البنك الأهلي السعودي", "بنك الراجحي", "مصرف الإنماء", "بنك الرياض"];

function ShareCreditModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState(shareBanks[0]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setTimeout(() => { onClose(); toast.success(`تم إرسال التقرير الائتماني A- إلى ${selected}`); }, 700);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-sm p-0" dir="rtl">
        <DialogHeader className="border-b border-[var(--border)] px-5 py-4 flex flex-row items-center justify-between">
          <DialogTitle className="font-arabic">مشاركة التقرير الائتماني</DialogTitle>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--muted)]">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        <div className="p-5 space-y-4">
          <div className="rounded-[10px] border border-[var(--success)]/30 bg-[color:color-mix(in_srgb,var(--success)_6%,transparent)] px-4 py-3 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[var(--success)] shrink-0" />
            <div>
              <p className="text-sm font-bold text-[var(--foreground)] font-arabic">التصنيف الائتماني A-</p>
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

export default function CreditPage() {
  const [tab, setTab] = useState<"ratios" | "banks">("ratios");
  const [showShareModal, setShowShareModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function handleRegenerate() {
    setRegenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setRegenerating(false);
    toast.success("تم تحديث التقرير بآخر بيانات بنكية");
  }

  const goodCount    = ratios.filter(r => r.status === "good").length;
  const warningCount = ratios.filter(r => r.status === "warning").length;

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">

      {/* Share modal */}
      {showShareModal && <ShareCreditModal onClose={() => setShowShareModal(false)} />}

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
          <Button size="sm" className="font-arabic gap-2" onClick={() => setShowShareModal(true)}>
            <Share2 className="h-4 w-4" />
            مشاركة مع بنك
          </Button>
        </div>
      </div>

      {/* Score hero */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* SIMAH source badge */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-[var(--success)]/30 bg-[color:color-mix(in_srgb,var(--success)_6%,transparent)] px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />
                <span className="text-xs font-bold text-[var(--success)] font-arabic">مصدر التصنيف: سمة (SIMAH)</span>
              </div>
              <span className="text-xs text-[var(--muted-foreground)] font-arabic">مرخصة من ساما · معيار Open Banking السعودي</span>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <ScoreRing pct={creditScore.visualPct} score={creditScore.simahScore} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 sm:gap-3 sm:mb-2">
                  <span className="text-3xl font-black text-[var(--success)] sm:text-4xl">{creditScore.letter}</span>
                  <Badge variant="success" className="font-arabic text-xs px-2 py-0.5">{creditScore.simahRating}</Badge>
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
                    <span className="text-xs font-bold text-[var(--primary)] font-arabic">أعلى من {creditScore.percentile}% من شركات القطاع</span>
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

            {/* SIMAH scale */}
            <div className="border-t border-[var(--border)] pt-4">
              <p className="text-[10px] text-[var(--muted-foreground)] font-arabic mb-2">سلّم تصنيف سمة (SIMAH) — نطاق 300 إلى 900</p>
              <div className="relative h-3 rounded-full overflow-hidden flex">
                {[
                  { label: "ضعيف",    range: "300–499", color: "#ef4444", flex: 2 },
                  { label: "متوسط",   range: "500–599", color: "#f97316", flex: 1 },
                  { label: "جيد",     range: "600–699", color: "#eab308", flex: 1 },
                  { label: "جيد جداً",range: "700–799", color: "#22c55e", flex: 1 },
                  { label: "ممتاز",   range: "800–900", color: "#10b981", flex: 1 },
                ].map(s => (
                  <div key={s.label} className="h-full" style={{ flex: s.flex, background: s.color, opacity: 0.75 }} />
                ))}
                {/* Marker for current score */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-white shadow"
                  style={{ left: `${creditScore.visualPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                {["ضعيف 300", "متوسط 500", "جيد 600", "جيد جداً 700", "ممتاز 800", "900"].map(l => (
                  <span key={l} className="text-[9px] text-[var(--muted-foreground)] font-arabic">{l}</span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--muted)] p-1 w-fit">
        {[
          { key: "ratios", label: "المؤشرات الائتمانية" },
          { key: "banks",  label: "عروض تمويل" },
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
                      onClick={() => setShowShareModal(true)}>
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
