import type { CompanyProfile, TeamMember, ActivityLogEntry, CompanyOverview } from "./types";

export const COMPANY_PROFILE: CompanyProfile = {
  name: "Glowpick",
  commercialRegistration: "1010123456",
  taxNumber: "300012345600003",
  sector: "الاستشارات والخدمات التقنية",
  servicesOffered: "استشارات تقنية، تطوير برمجيات، تدريب وورش عمل",
};

export const TEAM: TeamMember[] = [
  { id: "u1", name: "أسامة الرفاعي", initials: "أا", role: "مدير الشركة", permissionLabel: "مالك", permissionVariant: "navy", lastActivity: "الآن" },
  { id: "u2", name: "خالد العمر", initials: "خع", role: "مدير مالي", permissionLabel: "اعتماد القوائم", permissionVariant: "green", lastActivity: "منذ يوم" },
  { id: "u3", name: "نورة السالم", initials: "نس", role: "محاسبة", permissionLabel: "إدخال بيانات فقط", permissionVariant: "gray", lastActivity: "منذ 3 أيام" },
  { id: "u4", name: "دعوة معلّقة", initials: "؟", role: "مستثمر / مطّلع", permissionLabel: "عرض فقط", permissionVariant: "amber", lastActivity: "—", isPendingInvite: true },
];

export const ACTIVITY_LOG: ActivityLogEntry[] = [
  { id: "a1", icon: "check", title: "تم استيراد القوائم المالية السنوية للأعوام 2023–2025", timestamp: "2026-07-17 · 11:20 ص" },
  { id: "a2", icon: "link", title: "أسامة الرفاعي ربط STC Pay", timestamp: "2026-07-13 · 09:02 ص" },
  { id: "a3", icon: "share", title: "تمت مشاركة التقرير الائتماني مع بنك الراجحي", timestamp: "2026-07-06 · 03:41 م" },
];

export const COMPANY_OVERVIEW: CompanyOverview = {
  profile: COMPANY_PROFILE,
  team: TEAM,
  activityLog: ACTIVITY_LOG,
};
