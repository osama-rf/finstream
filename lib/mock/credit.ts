import type { CreditReport, CreditRatio, FinancingOffer, BenchmarkRow } from "./types";

export const CREDIT_RATIOS: CreditRatio[] = [
  { key: "profit_margin", label: "هامش الربح الصافي", value: 32.5, unit: "%", benchmark: 24, benchmarkLabel: "متوسط القطاع: 24%", status: "good", description: "نسبة الربح الصافي من إجمالي الإيرادات" },
  { key: "current_ratio", label: "نسبة السيولة الجارية", value: 1.8, unit: "x", benchmark: 1.5, benchmarkLabel: "معيار البنوك: ≥ 1.5", status: "good", description: "قدرة الشركة على تغطية التزاماتها قصيرة الأجل" },
  { key: "debt_equity", label: "نسبة الدين إلى حقوق الملكية", value: 0.65, unit: "x", benchmark: 0.8, benchmarkLabel: "معيار البنوك: ≤ 0.8", status: "good", description: "مستوى الرافعة المالية للشركة" },
  { key: "dso", label: "متوسط فترة التحصيل", value: 42, unit: "يوم", benchmark: 35, benchmarkLabel: "متوسط القطاع: 35 يوم", status: "warning", description: "متوسط الأيام اللازمة لتحصيل المستحقات" },
  { key: "revenue_growth", label: "نمو الإيرادات (سنوي)", value: 18.4, unit: "%", benchmark: 12, benchmarkLabel: "متوسط القطاع: 12%", status: "good", description: "معدل نمو الإيرادات مقارنةً بالعام الماضي" },
  { key: "cash_coverage", label: "نسبة تغطية النقد", value: 2.1, unit: "x", benchmark: 1.5, benchmarkLabel: "معيار البنوك: ≥ 1.5", status: "good", description: "قدرة التدفقات النقدية على تغطية خدمة الدين" },
];

export const FINANCING_OFFERS: FinancingOffer[] = [
  { bank: "تمويل رأس مال عامل — بنك الراجحي", product: "حتى 500,000 ر.س", sub: "نسبة تنافسية", eligibility: "eligible" },
  { bank: "ضمان كفالة لتمويل التوسع", product: "برنامج كفالة الحكومي", sub: "", eligibility: "eligible" },
  { bank: "تمويل فواتير (Invoice Financing)", product: "لتحسين DSO مباشرة", sub: "", eligibility: "needs_docs" },
];

export const BENCHMARK_ROWS: BenchmarkRow[] = [
  { key: "profit_margin", label: "هامش الربح الصافي", companyValue: "32.5%", sectorAverage: "24.1%", favorable: true },
  { key: "revenue_growth", label: "نمو الإيرادات السنوي", companyValue: "18.4%", sectorAverage: "12.3%", favorable: true },
  { key: "current_ratio", label: "نسبة السيولة الجارية", companyValue: "1.8x", sectorAverage: "1.5x", favorable: true },
  { key: "dso", label: "متوسط فترة التحصيل (DSO)", companyValue: "42 يوم", sectorAverage: "35 يوم", favorable: false },
  { key: "debt_equity", label: "نسبة الدين إلى حقوق الملكية", companyValue: "0.65x", sectorAverage: "0.78x", favorable: true },
];

export const CREDIT_REPORT: CreditReport = {
  score: 720,
  max: 900,
  letter: "B+",
  rating: "جيد جداً",
  percentile: 71,
  strengths: [
    "هامش ربح أعلى من متوسط القطاع بـ 8.4 نقطة",
    "نمو إيرادات سنوي مستقر فوق 18%",
    "نسبة دين إلى حقوق ملكية منخفضة (0.65x)",
  ],
  risks: [
    "فترة تحصيل ذمم مرتفعة (42 يوم مقابل 35 للقطاع)",
    "تركّز 3 عملاء يشكّلون 41% من الإيرادات",
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
    aboveAverage: 7,
    belowAverage: 1,
    belowAverageNote: "DSO",
    total: 8,
  },
};
