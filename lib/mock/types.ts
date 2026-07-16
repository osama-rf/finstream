// Shared types for the mock data layer. Shapes mirror lib/types/database.ts
// so getters in getters.ts can be swapped for real Supabase queries later
// without changing call sites.

export type BankSourceType = "bank" | "gateway";
export type BankStatus = "connected" | "disconnected";

export interface BankSource {
  id: string;
  name: string;
  code: string;
  balance: number;
  currency: string;
  iban: string | null;
  status: BankStatus;
  lastSync: string | null;
  monthlyIn: number;
  monthlyOut: number;
  color: string;
  type: BankSourceType;
}

export interface AvailableSource {
  name: string;
  color: string;
  type: BankSourceType;
}

export interface Transaction {
  id: string;
  bank: string;
  desc: string;
  amount: number;
  type: "credit" | "debit";
  date: string;
}

export interface CategorizedTransaction extends Transaction {
  category: string;
}

export interface BankingSummary {
  banks: BankSource[];
  availableToConnect: AvailableSource[];
  recentTransactions: Transaction[];
  categorizedTransactions: CategorizedTransaction[];
  totalBalance: number;
  totalMonthlyIn: number;
  totalMonthlyOut: number;
  avgDailyNetBalance: number;
  liquidityRatio: number;
}

export interface SustainabilitySubMetric {
  key: string;
  label: string;
  value: number;
}

export interface SustainabilityScore {
  value: number;
  max: number;
  subMetrics: SustainabilitySubMetric[];
}

export interface FinancialGoal {
  key: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  progressPct: number;
  status: "good" | "warning";
}

export interface AlertThreshold {
  key: string;
  label: string;
  sub: string;
  enabled: boolean;
}

export interface ManualEntry {
  id: string;
  desc: string;
  type: "income" | "expense";
  amount: number;
  date: string;
}

export interface ScenarioInputs {
  revenueGrowthPct: number;
  expenseReductionPct: number;
  additionalFinancing: number;
}

export interface ScenarioResult {
  projectedRunwayMonths: number;
  projectedCreditRating: string;
  projectedSustainabilityScore: number;
}

export interface IndicatorsOverview {
  sustainability: SustainabilityScore;
  goals: FinancialGoal[];
  alertThresholds: AlertThreshold[];
  scenarioBaseline: ScenarioInputs;
  manualEntries: ManualEntry[];
}

export type StatementStatus = "draft" | "pending_review" | "approved";

export interface StatementLineItem {
  label: string;
  value: number;
  emphasis?: "positive" | "negative";
}

export interface Statement {
  id: string;
  type: "income" | "balance" | "cashflow";
  title: string;
  period: string;
  status: StatementStatus;
  aiGenerated: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  lines: StatementLineItem[];
}

export interface ProFormaMonth {
  label: string;
  projected: number;
}

export interface ZatcaReadiness {
  linkedInvoicesPct: number;
  invoicesNeedingReviewCount: number;
  lastSyncedAt: string;
}

export interface AuditCenterKpi {
  key: string;
  icon: string;
  badge: string;
  value: string;
  label: string;
}

export interface StatementsOverview {
  quarters: string[];
  statementsByQuarter: Record<string, Statement[]>;
  proForma: ProFormaMonth[];
  zatca: ZatcaReadiness;
  auditCenter: AuditCenterKpi[];
}

export interface MonthlySeriesPoint {
  label: string;
  revenue: number;
  expense: number;
}

export interface ExpenseBreakdownItem {
  label: string;
  pct: number;
  color: string;
}

export interface RevenueSourceItem {
  label: string;
  pct: number;
  color: string;
}

export interface AnomalyItem {
  title: string;
  sub: string;
  severity: "warning" | "danger";
}

export interface AnalyticsOverview {
  monthlySeries: MonthlySeriesPoint[];
  expenseBreakdown: ExpenseBreakdownItem[];
  revenueBySource: RevenueSourceItem[];
  netProfitTrend: MonthlySeriesPoint[]; // reuses label/revenue as the value axis
  totalRevenueQuarter: number;
  burnRatePerMonth: number;
  projectedRunwayMonths: number;
  anomalies: AnomalyItem[];
}

export interface CreditRatio {
  key: string;
  label: string;
  value: number;
  unit: string;
  benchmark: number;
  benchmarkLabel: string;
  status: "good" | "warning" | "bad";
  description: string;
}

export interface FinancingOffer {
  bank: string;
  product: string;
  sub: string;
  eligibility: "eligible" | "needs_docs";
}

export interface BenchmarkRow {
  key: string;
  label: string;
  companyValue: string;
  sectorAverage: string;
  favorable: boolean;
}

export interface CreditReport {
  score: number;
  max: number;
  letter: string;
  rating: string;
  percentile: number;
  strengths: string[];
  risks: string[];
  recommendations: { text: string; sub: string; impact: "high" | "medium" }[];
  ratios: CreditRatio[];
  financingOffers: FinancingOffer[];
  benchmarkRows: BenchmarkRow[];
  benchmarkSummary: {
    sector: string;
    region: string;
    aboveAverage: number;
    belowAverage: number;
    belowAverageNote: string;
    total: number;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  permissionLabel: string;
  permissionVariant: "navy" | "green" | "gray" | "amber";
  lastActivity: string;
  isPendingInvite?: boolean;
}

export interface ActivityLogEntry {
  id: string;
  icon: string;
  title: string;
  timestamp: string;
}

export interface CompanyProfile {
  name: string;
  commercialRegistration: string;
  taxNumber: string;
  sector: string;
  servicesOffered: string;
}

export interface CompanyOverview {
  profile: CompanyProfile;
  team: TeamMember[];
  activityLog: ActivityLogEntry[];
}

export interface SubscriptionInfo {
  planName: string;
  monthlyPrice: number;
  renewalDate: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: string;
  active: boolean;
}

export interface ClientItem {
  id: string;
  name: string;
  totalTransactions: number;
  lastInvoiceDate: string;
  status: "active" | "overdue";
}

export interface NotificationSetting {
  key: string;
  label: string;
  enabled: boolean;
}

export interface SettingsOverview {
  subscription: SubscriptionInfo;
  services: ServiceItem[];
  clients: ClientItem[];
  notifications: NotificationSetting[];
}
