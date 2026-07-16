import type { SubscriptionInfo, ServiceItem, ClientItem, NotificationSetting, SettingsOverview } from "./types";

export const SUBSCRIPTION: SubscriptionInfo = {
  planName: "الأعمال — شهري",
  monthlyPrice: 349,
  renewalDate: "2026-08-01",
};

export const SERVICES: ServiceItem[] = [
  { id: "s1", name: "استشارات تقنية (بالساعة)", price: "450 ر.س", active: true },
  { id: "s2", name: "تطوير برمجيات (مشروع)", price: "حسب النطاق", active: true },
  { id: "s3", name: "تدريب وورش عمل (يوم)", price: "3,500 ر.س", active: false },
];

export const CLIENTS: ClientItem[] = [
  { id: "cl1", name: "شركة نماء للتطوير العقاري", totalTransactions: 620_000, lastInvoiceDate: "2026-07-02", status: "active" },
  { id: "cl2", name: "مؤسسة درب للاستشارات", totalTransactions: 285_000, lastInvoiceDate: "2026-06-18", status: "active" },
  { id: "cl3", name: "مجموعة الفا التجارية", totalTransactions: 140_000, lastInvoiceDate: "2026-04-30", status: "overdue" },
];

export const NOTIFICATIONS: NotificationSetting[] = [
  { key: "liquidity_alert", label: "تنبيهات تجاوز حدود السيولة", enabled: true },
  { key: "weekly_report", label: "تقرير أسبوعي بالبريد الإلكتروني", enabled: true },
  { key: "credit_rating_change", label: "تنبيهات تغيّر التصنيف الائتماني", enabled: true },
  { key: "new_financing_offers", label: "عروض تمويل جديدة مطابقة", enabled: false },
];

export const SETTINGS_OVERVIEW: SettingsOverview = {
  subscription: SUBSCRIPTION,
  services: SERVICES,
  clients: CLIENTS,
  notifications: NOTIFICATIONS,
};
