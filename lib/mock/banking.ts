import type { BankSource, AvailableSource, Transaction, CategorizedTransaction, BankingSummary } from "./types";

export const BANKS: BankSource[] = [
  { id: "1", name: "بنك الراجحي", code: "RJHI", balance: 1_840_000, currency: "SAR", iban: "SA44 2000 0001 2345 6789 1234", status: "connected", lastSync: "2026-07-02 10:32", monthlyIn: 650_000, monthlyOut: 312_000, color: "#006838", type: "bank" },
  { id: "2", name: "البنك الأهلي السعودي", code: "ANB", balance: 620_500, currency: "SAR", iban: "SA03 8000 0000 6080 1016 7519", status: "connected", lastSync: "2026-07-02 06:15", monthlyIn: 197_500, monthlyOut: 111_200, color: "#00574B", type: "bank" },
  { id: "3", name: "STC Pay", code: "STCPAY", balance: 98_200, currency: "SAR", iban: null, status: "connected", lastSync: "2026-07-02 11:05", monthlyIn: 43_000, monthlyOut: 21_800, color: "#7B2D8B", type: "gateway" },
  { id: "4", name: "بنك الرياض", code: "RIBL", balance: 0, currency: "SAR", iban: "SA04 2000 0001 9999 8888 7777", status: "disconnected", lastSync: null, monthlyIn: 0, monthlyOut: 0, color: "#C8102E", type: "bank" },
];

export const AVAILABLE_TO_CONNECT: AvailableSource[] = [
  { name: "مصرف الإنماء", color: "#005CA9", type: "bank" },
  { name: "بنك البلاد", color: "#4A1942", type: "bank" },
  { name: "تمارا", color: "#2B3A8C", type: "gateway" },
  { name: "تابي", color: "#3DBE9E", type: "gateway" },
];

export const RECENT_TRANSACTIONS: Transaction[] = [
  { id: "t1", bank: "بنك الراجحي", desc: "تحويل وارد — شركة الأفق للتجارة", amount: 250_000, type: "credit", date: "2026-07-01" },
  { id: "t2", bank: "البنك الأهلي", desc: "مصروف استضافة سحابية", amount: -3_200, type: "debit", date: "2026-07-01" },
  { id: "t3", bank: "STC Pay", desc: "إيراد مبيعات إلكترونية", amount: 18_400, type: "credit", date: "2026-06-30" },
  { id: "t4", bank: "بنك الراجحي", desc: "رواتب موظفين — يونيو", amount: -92_000, type: "debit", date: "2026-06-29" },
  { id: "t5", bank: "البنك الأهلي", desc: "إيراد خدمات استشارية", amount: 65_000, type: "credit", date: "2026-06-28" },
];

export const CATEGORIZED_TRANSACTIONS: CategorizedTransaction[] = [
  { id: "c1", bank: "بنك الراجحي", desc: "تحويل وارد — شركة الأفق للتجارة", category: "إيرادات مبيعات", amount: 250_000, type: "credit", date: "2026-07-01" },
  { id: "c2", bank: "الأهلي", desc: "مصروف استضافة سحابية", category: "تقنية وبنية تحتية", amount: -3_200, type: "debit", date: "2026-07-01" },
  { id: "c3", bank: "بنك الراجحي", desc: "رواتب موظفين — يونيو", category: "رواتب وأجور", amount: -92_000, type: "debit", date: "2026-06-29" },
];

const TOTAL_BALANCE = BANKS.filter(b => b.status === "connected").reduce((s, b) => s + b.balance, 0);
const TOTAL_MONTHLY_IN = BANKS.filter(b => b.status === "connected").reduce((s, b) => s + b.monthlyIn, 0);
const TOTAL_MONTHLY_OUT = BANKS.filter(b => b.status === "connected").reduce((s, b) => s + b.monthlyOut, 0);

export const BANKING_SUMMARY: BankingSummary = {
  banks: BANKS,
  availableToConnect: AVAILABLE_TO_CONNECT,
  recentTransactions: RECENT_TRANSACTIONS,
  categorizedTransactions: CATEGORIZED_TRANSACTIONS,
  totalBalance: TOTAL_BALANCE,
  totalMonthlyIn: TOTAL_MONTHLY_IN,
  totalMonthlyOut: TOTAL_MONTHLY_OUT,
  avgDailyNetBalance: 2_180_400,
  liquidityRatio: 1.8,
};
