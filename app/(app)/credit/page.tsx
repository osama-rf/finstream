"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Share2, Download, RefreshCw, CheckCircle2,
  AlertCircle, TrendingUp, TrendingDown, ArrowUpRight,
  Building2, CreditCard, Clock, Info,
} from "lucide-react";
import { toast } from "sonner";

const creditScore = {
  score: 74,
  rating: "A-",
  generatedAt: "2026-06-28",
  validUntil: "2026-07-28",
};

const ratios: {
  key: string;
  label: string;
  value: number;
  unit: string;
  benchmark: number;
  benchmarkLabel: string;
  status: "good" | "warning" | "poor";
  description: string;
}[] = [
  {
    key: "profit_margin",
    label: "هامش الربح الصافي",
    value: 32.5,
    unit: "%",
    benchmark: 24,
    benchmarkLabel: "متوسط القطاع: 24%",
    status: "good",
    description: "نسبة الربح الصافي من إجمالي الإيرادات — تعكس كفاءة التشغيل",
  },
  {
    key: "current_ratio",
    label: "نسبة السيولة الجارية",
    value: 1.8,
    unit: "x",
    benchmark: 1.5,
    benchmarkLabel: "معيار البنوك: ≥ 1.5",
    status: "good",
    description: "قدرة الشركة على تغطية التزاماتها القصيرة الأجل بأصولها المتداولة",
  },
  {
    key: "debt_equity",
    label: "نسبة الدين إلى حقوق الملكية",
    value: 0.65,
    unit: "x",
    benchmark: 0.8,
    benchmarkLabel: "معيار البنوك: ≤ 0.8",
    status: "good",
    description: "مقدار تمويل الشركة بالدين مقارنةً بحقوق الملكية",
  },
  {
    key: "dso",
    label: "متوسط فترة التحصيل",
    value: 42,
    unit: "يوم",
    benchmark: 35,
    benchmarkLabel: "متوسط القطاع: 35 يوم",
    status: "warning",
    description: "متوسط عدد الأيام اللازمة لتحصيل المستحقات من العملاء",
  },
  {
    key: "revenue_growth",
    label: "نمو الإيرادات (سنوي)",
    value: 18.4,
    unit: "%",
    benchmark: 12,
    benchmarkLabel: "متوسط القطاع: 12%",
    status: "good",
    description: "معدل نمو الإيرادات مقارنةً بالعام الماضي",
  },
  {
    key: "cash_coverage",
    label: "نسبة تغطية النقد",
    value: 2.1,
    unit: "x",
    benchmark: 1.5,
    benchmarkLabel: "معيار البنوك: ≥ 1.5",
    status: "good",
    description: "قدرة التدفقات النقدية التشغيلية على تغطية خدمة الدين",
  },
];

const strengths = [
  "هامش ربح فوق متوسط القطاع بنسبة 35%",
  "نمو إيرادات قوي ومستدام منذ 3 سنوات",
  "نسبة سيولة مريحة تتجاوز متطلبات البنوك",
  "3 مصادر دخل متنوعة تقلل من تركز المخاطر",
];

const risks = [
  "فترة تحصيل المديونية أعلى من متوسط القطاع بـ 7 أيام",
  "تركز 40% من الإيرادات في عميل واحد",
];

const recommendations = [
  "تطبيق سياسة تحصيل أكثر صرامة لتقليل DSO إلى 35 يوماً",
  "تنويع قاعدة العملاء لتقليل مخاطر التركز",
  "توثيق العقود متعددة السنوات لتعزيز ثقة البنوك في استدامة الإيرادات",
];

const banksList = [
  { name: "البنك الأهلي السعودي", product: "تمويل رأس المال العامل", maxAmount: "3,000,000", rate: "6.5%" },
  { name: "بنك الراجحي", product: "تمويل المشاريع الصغيرة", maxAmount: "2,500,000", rate: "6.9%" },
  { name: "مصرف الإنماء", product: "خط ائتمان متجدد", maxAmount: "1,500,000", rate: "7.2%" },
];

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "var(--success)" : score >= 50 ? "var(--warning)" : "var(--destructive)";

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle
          cx="72" cy="72" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-black tabular-nums" style={{ color }}>{score}</p>
        <p className="text-xs text-[var(--muted-foreground)] font-arabic">من 100</p>
      </div>
    </div>
  );
}

export default function CreditPage() {
  const [sharing, setSharing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"ratios" | "banks">("ratios");

  async function handleShare() {
    setSharing(true);
    await new Promise(r => setTimeout(r, 1500));
    setSharing(false);
    toast.success("تم إنشاء رابط مشاركة آمن — صالح لمدة 30 يوماً");
  }

  async function handleRegenerate() {
    setRegenerating(true);
    await new Promise(r => setTimeout(r, 2400));
    setRegenerating(false);
    toast.success("تم تحديث التقرير الائتماني بآخر بيانات بنكية");
  }

  const goodCount = ratios.filter(r => r.status === "good").length;
  const warningCount = ratios.filter(r => r.status === "warning").length;

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">التقرير الائتماني</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">
            تقييم جاهزيتك للتمويل البنكي بناءً على بياناتك المالية الحقيقية
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            className="font-arabic gap-2"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
            {regenerating ? "جاري التحديث..." : "تحديث التقرير"}
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
            {/* Score + rating row */}
            <div className="flex items-center gap-4 sm:gap-6">
              <ScoreRing score={creditScore.score} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 sm:gap-3 sm:mb-2">
                  <span className="text-3xl font-black text-[var(--success)] sm:text-4xl">{creditScore.rating}</span>
                  <Badge variant="success" className="font-arabic text-xs px-2 py-0.5 sm:text-sm sm:px-3 sm:py-1">جيد جداً</Badge>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic sm:text-sm">
                  صدر: {creditScore.generatedAt} · صالح حتى: {creditScore.validUntil}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-3">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />
                    <span className="text-xs font-bold text-[var(--success)] font-arabic sm:text-sm">{goodCount} مؤشر إيجابي</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-[var(--warning)]" />
                    <span className="text-xs font-bold text-[var(--warning)] font-arabic sm:text-sm">{warningCount} تحتاج تحسين</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & risks */}
            <div className="grid grid-cols-1 gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-2 font-bold">نقاط القوة</p>
                <ul className="space-y-1.5">
                  {strengths.slice(0, 2).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[var(--foreground)] font-arabic">
                      <TrendingUp className="h-3.5 w-3.5 text-[var(--success)] mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-2 font-bold">مخاطر تحتاج معالجة</p>
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
      <div className="flex gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--muted)] p-1 w-fit">
        {[
          { key: "ratios", label: "المؤشرات المالية" },
          { key: "banks", label: "عروض تمويل متاحة" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "ratios" | "banks")}
            className={`rounded-[10px] px-4 py-2 text-sm font-medium font-arabic transition-all ${
              activeTab === tab.key
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow-soft)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "ratios" ? (
        <div className="space-y-4">
          {/* Ratios grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ratios.map((ratio) => {
              const pct = Math.min(100, Math.round((ratio.value / (ratio.benchmark * 1.6)) * 100));
              return (
                <Card key={ratio.key} className={ratio.status === "warning" ? "border-[var(--warning)]/30" : ""}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-sm font-bold text-[var(--foreground)] font-arabic leading-snug">{ratio.label}</p>
                      {ratio.status === "good"
                        ? <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0" />
                        : <AlertCircle className="h-4 w-4 text-[var(--warning)] shrink-0" />
                      }
                    </div>
                    <p
                      className="text-2xl font-black tabular-nums mb-1"
                      style={{ color: ratio.status === "good" ? "var(--success)" : "var(--warning)" }}
                      dir="ltr"
                    >
                      {ratio.value}{ratio.unit}
                    </p>
                    <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: ratio.status === "good" ? "var(--success)" : "var(--warning)",
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">{ratio.benchmarkLabel}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)] font-arabic mt-1 leading-relaxed">{ratio.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recommendations */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">توصيات لتحسين التصنيف</h2>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-[12px] border border-[var(--primary)]/15 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)] px-4 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white text-xs font-black">
                      {i + 1}
                    </span>
                    <p className="text-sm text-[var(--foreground)] font-arabic leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[14px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_5%,transparent)] px-5 py-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[var(--foreground)] font-arabic">
                  بناءً على تصنيفك A-، أنت مؤهل للحصول على تمويل يصل إلى 3 مليون ريال
                </p>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-1">
                  شارك تقريرك الائتماني مباشرة مع أي بنك بنقرة واحدة لتسريع عملية طلب التمويل
                </p>
              </div>
            </div>
          </div>

          {banksList.map((bank) => (
            <Card key={bank.name}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
                      <Building2 className="h-6 w-6 text-[var(--primary)]" />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--foreground)] font-arabic">{bank.name}</p>
                      <p className="text-sm text-[var(--muted-foreground)] font-arabic">{bank.product}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-[var(--muted-foreground)] font-arabic">الحد الأقصى</p>
                      <p className="text-base font-bold text-[var(--foreground)] font-arabic" dir="ltr">{bank.maxAmount} ر.س</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[var(--muted-foreground)] font-arabic">معدل الربح</p>
                      <p className="text-base font-bold text-[var(--success)]" dir="ltr">{bank.rate}</p>
                    </div>
                    <Button size="sm" className="font-arabic gap-1.5" onClick={() => toast.success(`تم إرسال تقريرك الائتماني إلى ${bank.name}`)}>
                      <Share2 className="h-3.5 w-3.5" />
                      إرسال التقرير
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
