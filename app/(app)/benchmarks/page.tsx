"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3, TrendingUp, TrendingDown, CheckCircle2,
  AlertCircle, Globe, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { toast } from "sonner";

const sectors = [
  { key: "tech", label: "تقنية المعلومات" },
  { key: "consulting", label: "الاستشارات والخدمات" },
  { key: "retail", label: "التجزئة" },
  { key: "manufacturing", label: "الصناعة والتصنيع" },
];

const regions = [
  { key: "gcc", label: "دول الخليج (GCC)" },
  { key: "mena", label: "الشرق الأوسط وشمال أفريقيا" },
  { key: "global", label: "عالمي" },
];

type MetricStatus = "above" | "below" | "close";

const metrics: {
  key: string;
  label: string;
  description: string;
  company: number;
  sectorAvg: number;
  topQuartile: number;
  unit: string;
  higherIsBetter: boolean;
  icon: typeof TrendingUp;
}[] = [
  {
    key: "net_margin",
    label: "هامش الربح الصافي",
    description: "صافي الربح كنسبة من الإيرادات",
    company: 32.5,
    sectorAvg: 24.1,
    topQuartile: 38,
    unit: "%",
    higherIsBetter: true,
    icon: TrendingUp,
  },
  {
    key: "revenue_growth",
    label: "نمو الإيرادات السنوي",
    description: "معدل نمو الإيرادات مقارنةً بالسنة الماضية",
    company: 18.4,
    sectorAvg: 12.3,
    topQuartile: 28,
    unit: "%",
    higherIsBetter: true,
    icon: TrendingUp,
  },
  {
    key: "gross_margin",
    label: "هامش الربح الإجمالي",
    description: "الربح الإجمالي بعد تكلفة الخدمة/البضاعة",
    company: 61,
    sectorAvg: 58,
    topQuartile: 72,
    unit: "%",
    higherIsBetter: true,
    icon: TrendingUp,
  },
  {
    key: "current_ratio",
    label: "نسبة السيولة الجارية",
    description: "الأصول المتداولة ÷ الخصوم المتداولة",
    company: 1.8,
    sectorAvg: 1.5,
    topQuartile: 2.4,
    unit: "x",
    higherIsBetter: true,
    icon: TrendingUp,
  },
  {
    key: "dso",
    label: "متوسط فترة التحصيل (DSO)",
    description: "متوسط الأيام لتحصيل المديونية من العملاء",
    company: 42,
    sectorAvg: 35,
    topQuartile: 22,
    unit: "يوم",
    higherIsBetter: false,
    icon: TrendingDown,
  },
  {
    key: "opex_ratio",
    label: "نسبة المصروفات التشغيلية",
    description: "المصروفات التشغيلية كنسبة من الإيرادات",
    company: 48,
    sectorAvg: 52,
    topQuartile: 38,
    unit: "%",
    higherIsBetter: false,
    icon: TrendingDown,
  },
  {
    key: "revenue_per_employee",
    label: "الإيراد لكل موظف",
    description: "إجمالي الإيرادات مقسوماً على عدد الموظفين",
    company: 385,
    sectorAvg: 310,
    topQuartile: 520,
    unit: "ألف ر.س",
    higherIsBetter: true,
    icon: TrendingUp,
  },
  {
    key: "debt_equity",
    label: "نسبة الدين إلى حقوق الملكية",
    description: "مستوى الرافعة المالية للشركة",
    company: 0.65,
    sectorAvg: 0.78,
    topQuartile: 0.45,
    unit: "x",
    higherIsBetter: false,
    icon: TrendingDown,
  },
];

function getStatus(metric: typeof metrics[0]): MetricStatus {
  const threshold = metric.sectorAvg * 0.05;
  if (metric.higherIsBetter) {
    if (metric.company >= metric.sectorAvg + threshold) return "above";
    if (metric.company <= metric.sectorAvg - threshold) return "below";
    return "close";
  } else {
    if (metric.company <= metric.sectorAvg - threshold) return "above";
    if (metric.company >= metric.sectorAvg + threshold) return "below";
    return "close";
  }
}

function MiniBar({ company, avg, top, higherIsBetter }: {
  company: number; avg: number; top: number; higherIsBetter: boolean;
}) {
  const max = Math.max(company, avg, top) * 1.15;
  const companyPct = Math.round((company / max) * 100);
  const avgPct = Math.round((avg / max) * 100);
  const topPct = Math.round((top / max) * 100);

  const status: MetricStatus = higherIsBetter
    ? company >= avg * 1.05 ? "above" : company <= avg * 0.95 ? "below" : "close"
    : company <= avg * 0.95 ? "above" : company >= avg * 1.05 ? "below" : "close";

  return (
    <div className="space-y-2 mt-3">
      {[
        { label: "شركتك", pct: companyPct, val: company, cls: "", style: { background: status === "above" ? "var(--success)" : status === "below" ? "var(--destructive)" : "var(--warning)" } as React.CSSProperties },
        { label: "متوسط القطاع", pct: avgPct, val: avg, cls: "bg-[var(--muted-foreground)]/40", style: undefined },
        { label: "الربع الأول", pct: topPct, val: top, cls: "bg-[var(--primary)]/30", style: undefined },
      ].map(row => (
        <div key={row.label} className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] w-16 shrink-0 text-[var(--muted-foreground)] font-arabic sm:text-[11px] sm:w-24">{row.label}</span>
          <div className="flex-1 h-2 rounded-full bg-[var(--muted)] overflow-hidden sm:h-2.5">
            <div className={`h-full rounded-full ${row.cls}`} style={{ width: `${row.pct}%`, ...row.style }} />
          </div>
          <span className="text-[10px] font-bold tabular-nums w-8 text-end shrink-0 sm:text-xs sm:w-14" dir="ltr">{row.val}</span>
        </div>
      ))}
    </div>
  );
}

export default function BenchmarksPage() {
  const [selectedSector, setSelectedSector] = useState("consulting");
  const [selectedRegion, setSelectedRegion] = useState("gcc");

  const aboveCount = metrics.filter(m => getStatus(m) === "above").length;
  const belowCount = metrics.filter(m => getStatus(m) === "below").length;
  const closeCount = metrics.filter(m => getStatus(m) === "close").length;

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">مقارنة القطاع</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">
            قارن مؤشراتك المالية بمتوسطات القطاع عالمياً لتحديد فرص التحسين
          </p>
        </div>
        <Button
          variant="outline" size="sm"
          className="font-arabic gap-2 w-fit"
          onClick={() => toast.success("تم تصدير تقرير المقارنة بصيغة PDF")}
        >
          تصدير التقرير
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[var(--muted-foreground)]" />
              <span className="text-sm font-bold text-[var(--foreground)] font-arabic">القطاع:</span>
              <div className="flex gap-1 flex-wrap">
                {sectors.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSelectedSector(s.key)}
                    className={`rounded-full px-3 py-1 text-xs font-medium font-arabic transition-all ${
                      selectedSector === s.key
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--foreground)] font-arabic">النطاق:</span>
              <div className="flex gap-1">
                {regions.map(r => (
                  <button
                    key={r.key}
                    onClick={() => setSelectedRegion(r.key)}
                    className={`rounded-full px-3 py-1 text-xs font-medium font-arabic transition-all ${
                      selectedRegion === r.key
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-[var(--success)]/20 bg-[color:color-mix(in_srgb,var(--success)_4%,transparent)]">
          <CardContent className="p-3 flex items-center gap-2 sm:gap-3 sm:p-4">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-[var(--success)] sm:h-8 sm:w-8" />
            <div className="min-w-0">
              <p className="text-xl font-black text-[var(--success)] tabular-nums sm:text-2xl">{aboveCount}</p>
              <p className="text-[10px] text-[var(--muted-foreground)] font-arabic sm:text-xs">فوق المتوسط</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2 sm:gap-3 sm:p-4">
            <BarChart3 className="h-6 w-6 shrink-0 text-[var(--warning)] sm:h-8 sm:w-8" />
            <div className="min-w-0">
              <p className="text-xl font-black text-[var(--warning)] tabular-nums sm:text-2xl">{closeCount}</p>
              <p className="text-[10px] text-[var(--muted-foreground)] font-arabic sm:text-xs">قريب المتوسط</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[var(--destructive)]/15">
          <CardContent className="p-3 flex items-center gap-2 sm:gap-3 sm:p-4">
            <AlertCircle className="h-6 w-6 shrink-0 text-[var(--destructive)] sm:h-8 sm:w-8" />
            <div className="min-w-0">
              <p className="text-xl font-black text-[var(--destructive)] tabular-nums sm:text-2xl">{belowCount}</p>
              <p className="text-[10px] text-[var(--muted-foreground)] font-arabic sm:text-xs">أدنى المتوسط</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {metrics.map((metric) => {
          const status = getStatus(metric);
          const diff = metric.higherIsBetter
            ? ((metric.company - metric.sectorAvg) / metric.sectorAvg * 100).toFixed(1)
            : ((metric.sectorAvg - metric.company) / metric.sectorAvg * 100).toFixed(1);
          const isPositiveDiff = parseFloat(diff) >= 0;

          return (
            <Card
              key={metric.key}
              className={
                status === "above" ? "border-[var(--success)]/20" :
                status === "below" ? "border-[var(--destructive)]/15" :
                ""
              }
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-[var(--foreground)] font-arabic">{metric.label}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isPositiveDiff ? (
                      <ArrowUpRight className="h-4 w-4 text-[var(--success)]" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-[var(--destructive)]" />
                    )}
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{ color: isPositiveDiff ? "var(--success)" : "var(--destructive)" }}
                      dir="ltr"
                    >
                      {isPositiveDiff ? "+" : ""}{diff}%
                    </span>
                    <Badge
                      variant={status === "above" ? "success" : status === "below" ? "destructive" : "warning"}
                      className="font-arabic text-[10px] px-1.5 py-0.5"
                    >
                      {status === "above" ? "أفضل" : status === "below" ? "أدنى" : "متقارب"}
                    </Badge>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] font-arabic mb-2">{metric.description}</p>
                <MiniBar
                  company={metric.company}
                  avg={metric.sectorAvg}
                  top={metric.topQuartile}
                  higherIsBetter={metric.higherIsBetter}
                />
                <p className="text-[10px] text-[var(--muted-foreground)] font-arabic mt-2">
                  الوحدة: {metric.unit}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insight banner */}
      <Card className="border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)]">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[var(--foreground)] font-arabic mb-2">
                ملخص المقارنة — {sectors.find(s => s.key === selectedSector)?.label} · {regions.find(r => r.key === selectedRegion)?.label}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic leading-relaxed">
                منشأتك تتفوق على {aboveCount} من أصل {metrics.length} مؤشراً مقارنةً بمتوسط القطاع.
                أبرز نقاط القوة هي هامش الربح ونمو الإيرادات. أكبر فرصة للتحسين هي تقليل فترة التحصيل (DSO)
                والتي ستؤثر إيجاباً على التصنيف الائتماني وتسريع الحصول على تمويل أفضل.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
