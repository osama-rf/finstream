import type {
  MonthlySeriesPoint,
  ExpenseBreakdownItem,
  RevenueSourceItem,
  AnomalyItem,
  AnalyticsOverview,
} from "./types";

export const MONTHLY_SERIES: MonthlySeriesPoint[] = [
  { label: "يناير", revenue: 580_000, expense: 310_000 },
  { label: "فبراير", revenue: 620_000, expense: 290_000 },
  { label: "مارس", revenue: 695_000, expense: 340_000 },
  { label: "أبريل", revenue: 730_000, expense: 365_000 },
  { label: "مايو", revenue: 810_000, expense: 390_000 },
  { label: "يونيو", revenue: 847_500, expense: 423_200 },
];

export const EXPENSE_BREAKDOWN: ExpenseBreakdownItem[] = [
  { label: "تكلفة الخدمات", pct: 42, color: "var(--primary)" },
  { label: "رواتب وأجور", pct: 18, color: "#0e766e" },
  { label: "إدارية وعمومية", pct: 19, color: "#14b8a6" },
  { label: "تسويق ومبيعات", pct: 3, color: "#5eead4" },
];

export const REVENUE_BY_SOURCE: RevenueSourceItem[] = [
  { label: "خدمات استشارية", pct: 44, color: "var(--primary)" },
  { label: "مشاريع تقنية", pct: 32, color: "#0e766e" },
  { label: "تدريب وورش عمل", pct: 15, color: "#14b8a6" },
  { label: "تراخيص برمجيات", pct: 9, color: "#5eead4" },
];

// Net profit trend expressed as monthly series where `revenue` carries the profit value.
export const NET_PROFIT_TREND: MonthlySeriesPoint[] = [
  { label: "يناير", revenue: 270_000, expense: 0 },
  { label: "فبراير", revenue: 330_000, expense: 0 },
  { label: "مارس", revenue: 355_000, expense: 0 },
  { label: "أبريل", revenue: 365_000, expense: 0 },
  { label: "مايو", revenue: 420_000, expense: 0 },
  { label: "يونيو", revenue: 424_300, expense: 0 },
];

export const ANOMALIES: AnomalyItem[] = [
  { title: "ارتفاع غير معتاد في مصروفات \"أخرى\"", sub: "+140% عن المتوسط الشهري", severity: "warning" },
  { title: "انخفاض إيرادات تراخيص البرمجيات", sub: "-22% مقارنة بالربع السابق", severity: "danger" },
];

export const ANALYTICS_OVERVIEW: AnalyticsOverview = {
  monthlySeries: MONTHLY_SERIES,
  expenseBreakdown: EXPENSE_BREAKDOWN,
  revenueBySource: REVENUE_BY_SOURCE,
  netProfitTrend: NET_PROFIT_TREND,
  totalRevenueQuarter: 2_847_500,
  burnRatePerMonth: 67_400,
  projectedRunwayMonths: 7.2,
  anomalies: ANOMALIES,
};
