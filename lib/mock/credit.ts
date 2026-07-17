import type { CreditReport, CreditRatio, FinancingOffer, BenchmarkRow } from "./types";
import { FINANCIAL_METRICS, FINANCIAL_METRICS_BY_YEAR, type FinancialYear } from "@/lib/data/financial-statements";

export const CREDIT_RATIOS: CreditRatio[] = [
  { key: "profit_margin", label: "هامش الربح الصافي", value: FINANCIAL_METRICS.netMarginPct, unit: "%", benchmark: 24, benchmarkLabel: "متوسط القطاع: 24%", status: "bad", description: "نسبة الربح الصافي من إجمالي الإيرادات" },
  { key: "current_ratio", label: "نسبة السيولة الجارية", value: FINANCIAL_METRICS.currentRatio, unit: "x", benchmark: 1.5, benchmarkLabel: "معيار البنوك: ≥ 1.5", status: "good", description: "قدرة الشركة على تغطية التزاماتها قصيرة الأجل" },
  { key: "debt_equity", label: "نسبة الدين إلى حقوق الملكية", value: FINANCIAL_METRICS.debtToEquity, unit: "x", benchmark: 0.8, benchmarkLabel: "معيار البنوك: ≤ 0.8", status: "good", description: "مستوى الرافعة المالية للشركة" },
  { key: "dso", label: "متوسط فترة التحصيل", value: 42, unit: "يوم", benchmark: 35, benchmarkLabel: "متوسط القطاع: 35 يوم", status: "warning", description: "متوسط الأيام اللازمة لتحصيل المستحقات" },
  { key: "revenue_growth", label: "نمو الإيرادات (سنوي)", value: FINANCIAL_METRICS.revenueGrowthPct, unit: "%", benchmark: 12, benchmarkLabel: "متوسط القطاع: 12%", status: "warning", description: "معدل نمو الإيرادات مقارنةً بالعام الماضي" },
  { key: "cash_coverage", label: "نسبة تغطية النقد", value: 2.1, unit: "x", benchmark: 1.5, benchmarkLabel: "معيار البنوك: ≥ 1.5", status: "good", description: "قدرة التدفقات النقدية على تغطية خدمة الدين" },
];

export const FINANCING_OFFERS: FinancingOffer[] = [
  { bank: "تمويل رأس مال عامل — بنك الراجحي", product: "حتى 500,000 ر.س", sub: "نسبة تنافسية", eligibility: "eligible" },
  { bank: "ضمان كفالة لتمويل التوسع", product: "برنامج كفالة الحكومي", sub: "", eligibility: "eligible" },
  { bank: "تمويل فواتير (Invoice Financing)", product: "لتحسين DSO مباشرة", sub: "", eligibility: "needs_docs" },
];

export const BENCHMARK_ROWS: BenchmarkRow[] = [
  { key: "profit_margin", label: "هامش الربح الصافي", companyValue: "0.3%", sectorAverage: "24.1%", favorable: false },
  { key: "revenue_growth", label: "نمو الإيرادات السنوي", companyValue: "1.3%", sectorAverage: "12.3%", favorable: false },
  { key: "current_ratio", label: "نسبة السيولة الجارية", companyValue: "2.15x", sectorAverage: "1.5x", favorable: true },
  { key: "dso", label: "متوسط فترة التحصيل (DSO)", companyValue: "42 يوم", sectorAverage: "35 يوم", favorable: false },
  { key: "debt_equity", label: "نسبة الدين إلى حقوق الملكية", companyValue: "0.71x", sectorAverage: "0.78x", favorable: true },
];

export const CREDIT_REPORT: CreditReport = {
  score: 720,
  max: 900,
  letter: "B+",
  rating: "جيد جداً",
  percentile: 71,
  strengths: [
    "نسبة السيولة الجارية قوية عند 2.15x",
    "ارتفع النقد وما في حكمه إلى 135.3 مليون ريال",
    "نسبة المطلوبات إلى حقوق الملكية 0.71x",
  ],
  risks: [
    "انخفاض صافي الربح من 71.7 مليون إلى 3.0 مليون ريال",
    "نمو الإيرادات محدود عند 1.3%",
  ],
  recommendations: [
    { text: "خفض DSO إلى 35 يوماً قد يرفع الدرجة بنحو 15 نقطة", sub: "فعّل تمويل الفواتير المقترح أدناه لتسريع التحصيل", impact: "high" },
    { text: "تنويع قاعدة العملاء لتقليل التركّز عن 35%", sub: "يحسّن مؤشر الاستدامة المالية بند \"الانضباط التشغيلي\"", impact: "medium" },
  ],
  ratios: CREDIT_RATIOS,
  financingOffers: FINANCING_OFFERS,
  benchmarkRows: BENCHMARK_ROWS,
  benchmarkSummary: {
    sector: "الاستشارات والخدمات",
    region: "دول الخليج",
    aboveAverage: 3,
    belowAverage: 2,
    belowAverageNote: "هامش الربح ونمو الإيرادات",
    total: 8,
  },
};

const round = (value: number, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export function getCreditReportForYear(year: FinancialYear): CreditReport {
  const metrics = FINANCIAL_METRICS_BY_YEAR[year];
  const previousYear = Number(year) > 2023 ? String(Number(year) - 1) as FinancialYear : null;
  const previous = previousYear ? FINANCIAL_METRICS_BY_YEAR[previousYear] : null;
  const netMargin = (metrics.netProfit / metrics.revenue) * 100;
  const currentRatio = metrics.currentAssets / metrics.currentLiabilities;
  const debtEquity = metrics.totalLiabilities / metrics.equity;
  const dso = (metrics.tradeReceivables / metrics.revenue) * 365;
  const revenueGrowth = previous ? ((metrics.revenue - previous.revenue) / previous.revenue) * 100 : 0;
  const cashCoverage = metrics.cash / metrics.currentLiabilities;

  const quality = (
    Math.min(100, (currentRatio / 2) * 100) * 0.22 +
    Math.max(0, Math.min(100, ((2 - debtEquity) / 1.5) * 100)) * 0.20 +
    Math.min(100, Math.max(0, netMargin * 10)) * 0.20 +
    Math.min(100, Math.max(0, ((revenueGrowth + 10) / 30) * 100)) * 0.18 +
    (metrics.operatingCashFlow > 0 ? 100 : 20) * 0.20
  );
  const score = Math.round(450 + quality * 4.5);
  const letter = score >= 800 ? "A+" : score >= 750 ? "A" : score >= 700 ? "B+" : score >= 650 ? "B" : score >= 600 ? "B-" : "C";
  const rating = score >= 750 ? "ممتاز" : score >= 700 ? "جيد جداً" : score >= 650 ? "جيد" : score >= 600 ? "مقبول" : "يحتاج تحسين";
  const percentile = Math.max(10, Math.min(95, Math.round((score - 450) / 4.5)));

  const ratios: CreditRatio[] = CREDIT_RATIOS.map(ratio => {
    const value = ratio.key === "profit_margin" ? netMargin : ratio.key === "current_ratio" ? currentRatio
      : ratio.key === "debt_equity" ? debtEquity : ratio.key === "dso" ? dso
        : ratio.key === "revenue_growth" ? revenueGrowth : cashCoverage;
    const favorable = ["debt_equity", "dso"].includes(ratio.key) ? value <= ratio.benchmark : value >= ratio.benchmark;
    return { ...ratio, value: round(value), status: favorable ? "good" : value < ratio.benchmark * 0.5 ? "bad" : "warning" };
  });

  const benchmarkRows: BenchmarkRow[] = ratios.slice(0, 5).map(ratio => ({
    key: ratio.key,
    label: ratio.label,
    companyValue: `${ratio.value}${ratio.unit}`,
    sectorAverage: ratio.key === "profit_margin" ? "24.1%" : ratio.key === "revenue_growth" ? "12.3%"
      : ratio.key === "current_ratio" ? "1.5x" : ratio.key === "dso" ? "35 يوم" : "0.78x",
    favorable: ratio.status === "good",
  }));
  const aboveAverage = benchmarkRows.filter(row => row.favorable).length;
  const weakLabels = benchmarkRows.filter(row => !row.favorable).map(row => row.label);

  return {
    ...CREDIT_REPORT,
    score, letter, rating, percentile, ratios, benchmarkRows,
    strengths: [
      `السيولة الجارية ${round(currentRatio)}x`,
      `حقوق الملكية ${metrics.equity.toLocaleString()} ريال`,
      metrics.operatingCashFlow > 0 ? `تدفق تشغيلي مرتفع ${metrics.operatingCashFlow.toLocaleString()} ريال` : `إيرادات ${metrics.revenue.toLocaleString()} ريال`,
    ],
    risks: [
      ...(netMargin < 5 ? [`هامش الربح الصافي منخفض عند ${round(netMargin)}%`] : []),
      ...(metrics.operatingCashFlow < 0 ? [`التدفق النقدي التشغيلي منخفض بمقدار ${Math.abs(metrics.operatingCashFlow).toLocaleString()} ريال`] : []),
      ...(debtEquity > 1 ? [`نسبة الالتزامات إلى حقوق الملكية مرتفعة عند ${round(debtEquity)}x`] : []),
      ...(revenueGrowth < 5 && previous ? [`نمو الإيرادات محدود عند ${round(revenueGrowth)}%`] : []),
    ],
    recommendations: [
      { text: netMargin < 5 ? "رفع هامش الربح عبر ضبط تكلفة المبيعات والمصروفات التشغيلية" : "الحفاظ على هامش الربح وتحسين كفاءة رأس المال العامل", sub: `هامش ${year}: ${round(netMargin)}%`, impact: "high" },
      { text: metrics.operatingCashFlow < 0 ? "تحويل التدفق التشغيلي إلى مرتفع عبر تحسين دورة التحصيل والمخزون" : "تعزيز استدامة التدفق النقدي التشغيلي المرتفع", sub: `التدفق التشغيلي: ${metrics.operatingCashFlow.toLocaleString()} ريال`, impact: "medium" },
    ],
    benchmarkSummary: {
      ...CREDIT_REPORT.benchmarkSummary,
      aboveAverage,
      belowAverage: benchmarkRows.length - aboveAverage,
      belowAverageNote: weakLabels.join("، ") || "لا يوجد",
      total: benchmarkRows.length,
    },
  };
}
