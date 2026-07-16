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
    aiGenerated: true,
    createdAt: "2026-07-02",
    lines: [
      { label: "إيرادات الخدمات والاستشارات", value: 1_845_000 },
      { label: "إيرادات المشاريع التقنية", value: 542_500 },
      { label: "إجمالي الإيرادات", value: 2_387_500, emphasis: "positive" },
      { label: "تكلفة الخدمات", value: 612_000 },
      { label: "الرواتب والأجور", value: 286_000 },
      { label: "مصروفات إدارية وعمومية", value: 221_200 },
      { label: "مصروفات تسويق ومبيعات", value: 59_000 },
      { label: "إجمالي المصروفات", value: 1_178_200, emphasis: "negative" },
      { label: "صافي الربح", value: 1_209_300, emphasis: "positive" },
    ],
  },
  {
    id: "balance-q2-2026", type: "balance", title: "قائمة المركز المالي", period: "Q2 2026 — كما في 30 يونيو", status: "draft", aiGenerated: true, createdAt: "2026-07-02",
    lines: [
      { label: "النقد وما في حكمه", value: 2_558_700 },
      { label: "الذمم المدينة", value: 487_300 },
      { label: "الأصول الثابتة — صافي", value: 312_000 },
      { label: "أصول أخرى", value: 95_000 },
      { label: "إجمالي الأصول", value: 3_453_000, emphasis: "positive" },
      { label: "الذمم الدائنة", value: 218_400 },
      { label: "قروض قصيرة الأجل", value: 350_000 },
      { label: "التزامات أخرى", value: 84_600 },
      { label: "إجمالي الالتزامات", value: 653_000, emphasis: "negative" },
      { label: "حقوق الملكية", value: 2_800_000, emphasis: "positive" },
    ],
  },
  {
    id: "cashflow-q2-2026", type: "cashflow", title: "قائمة التدفقات النقدية", period: "Q2 2026 — أبريل إلى يونيو", status: "draft", aiGenerated: true, createdAt: "2026-07-02",
    lines: [
      { label: "صافي الربح للفترة", value: 1_209_300, emphasis: "positive" },
      { label: "الإهلاك والإطفاء", value: 48_000 },
      { label: "التغير في الذمم المدينة", value: -62_400, emphasis: "negative" },
      { label: "التغير في الذمم الدائنة", value: 31_200 },
      { label: "صافي التدفق التشغيلي", value: 1_008_500, emphasis: "positive" },
      { label: "شراء أصول ثابتة", value: -120_000, emphasis: "negative" },
      { label: "عائد استثمارات قصيرة الأجل", value: 18_500 },
      { label: "صافي التدفق الاستثماري", value: -101_500, emphasis: "negative" },
      { label: "سداد قرض بنكي", value: -200_000, emphasis: "negative" },
      { label: "توزيعات أرباح", value: -150_000, emphasis: "negative" },
      { label: "صافي التدفق التمويلي", value: -350_000, emphasis: "negative" },
      { label: "صافي التغير في النقد", value: 557_000, emphasis: "positive" },
    ],
  },
];

const FY_2025_STATEMENTS: Statement[] = [
  { id: "income-2025", type: "income", title: "قائمة الدخل", period: "السنة المنتهية في 31 ديسمبر 2025", status: "approved", aiGenerated: true, approvedBy: "خالد العمر", lines: [{ label: "الإيرادات", value: 7_842_000 }, { label: "المصروفات", value: 4_615_000 }, { label: "صافي الربح", value: 3_227_000, emphasis: "positive" }] },
  { id: "balance-2025", type: "balance", title: "قائمة المركز المالي", period: "كما في 31 ديسمبر 2025", status: "approved", aiGenerated: true, approvedBy: "خالد العمر", lines: [{ label: "إجمالي الأصول", value: 4_760_000 }, { label: "إجمالي الالتزامات", value: 1_780_000 }, { label: "حقوق الملكية", value: 2_980_000, emphasis: "positive" }] },
  { id: "cashflow-2025", type: "cashflow", title: "قائمة التدفقات النقدية", period: "السنة المنتهية في 31 ديسمبر 2025", status: "approved", aiGenerated: true, approvedBy: "خالد العمر", lines: [{ label: "التدفقات التشغيلية", value: 2_890_000, emphasis: "positive" }, { label: "التدفقات الاستثمارية", value: -640_000, emphasis: "negative" }, { label: "التدفقات التمويلية", value: -520_000, emphasis: "negative" }] },
];

export const STATEMENTS_BY_QUARTER: Record<string, Statement[]> = {
  "Q2 2026": Q2_2026_STATEMENTS,
  "Q1 2026": Q1_2026_STATEMENTS,
  "2025 كامل": FY_2025_STATEMENTS,
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
