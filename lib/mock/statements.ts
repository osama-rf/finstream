import type { ProFormaMonth, ZatcaReadiness, AuditCenterKpi, StatementsOverview } from "./types";
import { QUARTERS, STATEMENTS_BY_QUARTER } from "@/lib/data/financial-statements";

// Compatibility exports for older consumers. Financial figures come exclusively
// from the imported 2025 filing in lib/data/financial-statements.ts.
export { QUARTERS, STATEMENTS_BY_QUARTER };

export const PRO_FORMA: ProFormaMonth[] = [];

export const ZATCA_READINESS: ZatcaReadiness = {
  linkedInvoicesPct: 0,
  invoicesNeedingReviewCount: 0,
  lastSyncedAt: "غير متاح في ملف القوائم",
};

export const AUDIT_CENTER_KPIS: AuditCenterKpi[] = [
  { key: "reconciled", icon: "check", badge: "تم", value: "100%", label: "اتزان قائمة المركز المالي" },
  { key: "needs_review", icon: "warning", badge: "مراجعة", value: "2025", label: "الفترة المالية الحالية" },
  { key: "distribution", icon: "lock", badge: "موحدة", value: "SAR", label: "عملة عرض القوائم" },
  { key: "comparisons", icon: "chart", badge: "فعلي", value: "3", label: "سنوات مالية متاحة" },
];

export const STATEMENTS_OVERVIEW: StatementsOverview = {
  quarters: [...QUARTERS],
  statementsByQuarter: STATEMENTS_BY_QUARTER,
  proForma: PRO_FORMA,
  zatca: ZATCA_READINESS,
  auditCenter: AUDIT_CENTER_KPIS,
};
