import type {
  SustainabilityScore,
  FinancialGoal,
  AlertThreshold,
  ManualEntry,
  ScenarioInputs,
  ScenarioResult,
  IndicatorsOverview,
} from "./types";
import { FINANCIAL_METRICS_BY_YEAR, type FinancialYear } from "@/lib/data/financial-statements";
import { getCreditReportForYear } from "./credit";

export const SUSTAINABILITY_SCORE: SustainabilityScore = {
  value: 78,
  max: 100,
  subMetrics: [
    { key: "liquidity", label: "السيولة", value: 85 },
    { key: "profitability", label: "الربحية", value: 88 },
    { key: "operational_discipline", label: "الانضباط التشغيلي", value: 64 },
  ],
};

export const FINANCIAL_GOALS: FinancialGoal[] = [
  { key: "runway", label: "مدار نقدي (Runway)", current: 7.2, target: 9, unit: "أشهر", progressPct: 80, status: "good" },
  { key: "dso", label: "خفض فترة التحصيل DSO", current: 42, target: 35, unit: "يوم", progressPct: 60, status: "warning" },
  { key: "savings_rate", label: "معدل الادخار الشهري", current: 14, target: 20, unit: "%", progressPct: 70, status: "good" },
];

export const ALERT_THRESHOLDS: AlertThreshold[] = [
  { key: "low_liquidity", label: "سيولة تقل عن 300,000 ر.س", sub: "تنبيه فوري + بريد إلكتروني", enabled: true },
  { key: "unusual_expense", label: "مصروف غير معتاد > 50,000 ر.س", sub: "تنبيه فوري", enabled: true },
  { key: "customer_concentration", label: "تركّز عميل واحد > 35%", sub: "تقرير أسبوعي", enabled: false },
];

export const MANUAL_ENTRIES: ManualEntry[] = [
  { id: "m1", desc: "عهدة نقدية — معرض تجاري", type: "expense", amount: 12_000, date: "2026-07-05" },
  { id: "m2", desc: "دفعة مقدّمة من عميل (نقداً)", type: "income", amount: 30_000, date: "2026-07-02" },
];

export const SCENARIO_BASELINE: ScenarioInputs = {
  revenueGrowthPct: 5,
  expenseReductionPct: -8,
  additionalFinancing: 200_000,
};

/**
 * Deterministic demo projection based on the selected year's actual figures.
 * Every year therefore starts from its own cash runway, credit assessment,
 * and sustainability position.
 */
export function computeScenario(inputs: ScenarioInputs, year: FinancialYear = "2025"): ScenarioResult {
  const { revenueGrowthPct, expenseReductionPct, additionalFinancing } = inputs;
  const metrics = FINANCIAL_METRICS_BY_YEAR[year];
  const creditReport = getCreditReportForYear(year);
  const annualExpenses = Math.max(1, metrics.revenue - metrics.netProfit);
  const baseRunwayMonths = Math.min(24, metrics.cash / (annualExpenses / 12));
  const liquidity = metrics.currentAssets / Math.max(1, metrics.currentLiabilities);
  const margin = (metrics.netProfit / Math.max(1, metrics.revenue)) * 100;
  const baseSustainabilityScore = Math.round(Math.min(100, Math.max(0,
    Math.min(100, liquidity / 2 * 100) * 0.35 +
    Math.min(100, Math.max(0, margin) / 12 * 100) * 0.35 +
    (metrics.operatingCashFlow > 0 ? 90 : 30) * 0.30
  )));
  const financingUnits = additionalFinancing / 200_000;

  const runwayFromRevenue = revenueGrowthPct * 0.2;
  const runwayFromExpense = -expenseReductionPct * 0.15;
  const runwayFromFinancing = financingUnits * 2.0;
  const projectedRunwayMonths = Math.round(
    (baseRunwayMonths + runwayFromRevenue + runwayFromExpense + runwayFromFinancing) * 10
  ) / 10;

  const scoreDelta =
    revenueGrowthPct * 3 +
    -expenseReductionPct * 2 +
    financingUnits * 9;
  const projectedCreditScore = Math.min(900, Math.round(creditReport.score + scoreDelta));
  const projectedCreditRating = ratingForScore(projectedCreditScore);

  const sustainabilityDelta =
    revenueGrowthPct * 0.4 +
    -expenseReductionPct * 0.3 +
    financingUnits * 1.6;
  const projectedSustainabilityScore = Math.min(
    100,
    Math.round(baseSustainabilityScore + sustainabilityDelta)
  );

  return { projectedRunwayMonths, projectedCreditRating, projectedSustainabilityScore };
}

function ratingForScore(score: number): string {
  if (score >= 800) return "A+";
  if (score >= 750) return "A";
  if (score >= 700) return "B+";
  if (score >= 650) return "B";
  if (score >= 600) return "B-";
  return "C";
}

export const INDICATORS_OVERVIEW: IndicatorsOverview = {
  sustainability: SUSTAINABILITY_SCORE,
  goals: FINANCIAL_GOALS,
  alertThresholds: ALERT_THRESHOLDS,
  scenarioBaseline: SCENARIO_BASELINE,
  manualEntries: MANUAL_ENTRIES,
};
