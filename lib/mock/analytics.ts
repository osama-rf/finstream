import type {
  MonthlySeriesPoint,
  ExpenseBreakdownItem,
  RevenueSourceItem,
  AnomalyItem,
  AnalyticsOverview,
} from "./types";
import { FINANCIAL_METRICS } from "@/lib/data/financial-statements";

export const MONTHLY_SERIES: MonthlySeriesPoint[] = [
  { label: "2024", revenue: FINANCIAL_METRICS.revenuePrevious, expense: FINANCIAL_METRICS.revenuePrevious - FINANCIAL_METRICS.netProfitPrevious },
  { label: "2025", revenue: FINANCIAL_METRICS.revenue, expense: FINANCIAL_METRICS.revenue - FINANCIAL_METRICS.netProfit },
];

export const EXPENSE_BREAKDOWN: ExpenseBreakdownItem[] = [
  { label: "تكلفة المبيعات", pct: 76, color: "var(--primary)" },
  { label: "بيع وتوزيع", pct: 18, color: "#31577D" },
  { label: "إدارية وعمومية", pct: 5, color: "#6684A2" },
  { label: "أخرى", pct: 1, color: "#A7B8C9" },
];

export const REVENUE_BY_SOURCE: RevenueSourceItem[] = [
  { label: "إيرادات النشاط", pct: 100, color: "var(--primary)" },
];

// Net profit trend expressed as monthly series where `revenue` carries the profit value.
export const NET_PROFIT_TREND: MonthlySeriesPoint[] = [
  { label: "2024", revenue: FINANCIAL_METRICS.netProfitPrevious, expense: 0 },
  { label: "2025", revenue: FINANCIAL_METRICS.netProfit, expense: 0 },
];

export const ANOMALIES: AnomalyItem[] = [
  { title: "انخفاض جوهري في صافي الربح", sub: "من 71.7 مليون في 2024 إلى 3.0 مليون ريال في 2025", severity: "danger" },
  { title: "تحسن قوي في الرصيد النقدي", sub: "ارتفع من 50.0 مليون إلى 135.3 مليون ريال", severity: "warning" },
];

export const ANALYTICS_OVERVIEW: AnalyticsOverview = {
  monthlySeries: MONTHLY_SERIES,
  expenseBreakdown: EXPENSE_BREAKDOWN,
  revenueBySource: REVENUE_BY_SOURCE,
  netProfitTrend: NET_PROFIT_TREND,
  totalRevenueQuarter: FINANCIAL_METRICS.revenue,
  burnRatePerMonth: Math.round((FINANCIAL_METRICS.revenue - FINANCIAL_METRICS.netProfit) / 12),
  projectedRunwayMonths: 1.6,
  anomalies: ANOMALIES,
};
