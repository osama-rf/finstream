import type { Statement, ProFormaMonth, ZatcaReadiness, AuditCenterKpi, StatementsOverview } from "./types";

export const QUARTERS = ["Q2 2026", "Q1 2026", "2025 كامل"];

const Q1_2026_STATEMENTS: Statement[] = [
  {
    id: "income-q1-2026",
    type: "income",
    title: "قائمة الدخل",
    period: "Q1 2026 — يناير إلى مارس",
    status: "approved",
    aiGenerated: true,
    approvedBy: "خالد العمر",
    approvedAt: "2026-04-10",
    lines: [
      { label: "الإيرادات", value: 4_282_500 },
      { label: "المصروفات", value: 2_343_200 },
      { label: "صافي الربح", value: 1_939_300, emphasis: "positive" },
    ],
  },
  {
    id: "balance-q1-2026",
    type: "balance",
    title: "الميزانية العمومية",
    period: "Q1 2026 — يناير إلى مارس",
    status: "approved",
    aiGenerated: true,
    approvedBy: "خالد العمر",
    lines: [
      { label: "إجمالي الأصول", value: 5_120_000 },
      { label: "إجمالي الالتزامات", value: 1_860_000 },
      { label: "حقوق الملكية", value: 3_260_000, emphasis: "positive" },
    ],
  },
  {
    id: "cashflow-q1-2026",
    type: "cashflow",
    title: "قائمة التدفقات النقدية",
    period: "Q1 2026",
    status: "pending_review",
    aiGenerated: true,
    createdAt: "2026-04-12",
    lines: [
      { label: "تدفقات تشغيلية", value: 612_000 },
      { label: "تدفقات استثمارية", value: -85_000, emphasis: "negative" },
    ],
  },
];

const Q2_2026_STATEMENTS: Statement[] = [
  {
    id: "income-q2-2026",
    type: "income",
    title: "قائمة الدخل",
    period: "Q2 2026 — أبريل إلى يونيو",
    status: "draft",
    aiGenerated: false,
    lines: [
      { label: "الإيرادات", value: 0 },
      { label: "المصروفات", value: 0 },
      { label: "صافي الربح", value: 0 },
    ],
  },
];

export const STATEMENTS_BY_QUARTER: Record<string, Statement[]> = {
  "Q2 2026": Q2_2026_STATEMENTS,
  "Q1 2026": Q1_2026_STATEMENTS,
  "2025 كامل": Q1_2026_STATEMENTS,
};

export const PRO_FORMA: ProFormaMonth[] = [
  { label: "يوليو المتوقع", projected: 415_000 },
  { label: "أغسطس المتوقع", projected: 390_000 },
  { label: "سبتمبر المتوقع", projected: 460_000 },
];

export const ZATCA_READINESS: ZatcaReadiness = {
  linkedInvoicesPct: 96,
  invoicesNeedingReviewCount: 4,
  lastSyncedAt: "اليوم 09:10",
};

export const AUDIT_CENTER_KPIS: AuditCenterKpi[] = [
  { key: "reconciled", icon: "check", badge: "منخفض", value: "94%", label: "حسابات مطابقة تلقائياً" },
  { key: "needs_review", icon: "warning", badge: "راجع", value: "5", label: "بنود تحتاج مراجعة يدوية" },
  { key: "distribution", icon: "lock", badge: "سري", value: "لجنة التدقيق", label: "مستوى تداول التقرير" },
  { key: "comparisons", icon: "chart", badge: "تلقائي", value: "3", label: "فترات مقارنة (حالية/سابقة/موازنة)" },
];

export const STATEMENTS_OVERVIEW: StatementsOverview = {
  quarters: QUARTERS,
  statementsByQuarter: STATEMENTS_BY_QUARTER,
  proForma: PRO_FORMA,
  zatca: ZATCA_READINESS,
  auditCenter: AUDIT_CENTER_KPIS,
};
