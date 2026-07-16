// Async-shaped getters over the static mock data. Each resolves synchronously
// today but keeps the same signature real Supabase queries will use later —
// call sites (React Query hooks, server components) don't need to change
// when the mock data source is swapped for a live one.

import { BANKING_SUMMARY } from "./banking";
import { INDICATORS_OVERVIEW } from "./indicators";
import { STATEMENTS_OVERVIEW } from "./statements";
import { ANALYTICS_OVERVIEW } from "./analytics";
import { CREDIT_REPORT } from "./credit";
import { COMPANY_OVERVIEW } from "./company";
import { SETTINGS_OVERVIEW } from "./settings";
import type {
  BankingSummary,
  IndicatorsOverview,
  StatementsOverview,
  AnalyticsOverview,
  CreditReport,
  CompanyOverview,
  SettingsOverview,
} from "./types";

export async function getBankingSummary(): Promise<BankingSummary> {
  return BANKING_SUMMARY;
}

export async function getIndicatorsOverview(): Promise<IndicatorsOverview> {
  return INDICATORS_OVERVIEW;
}

export async function getStatementsOverview(): Promise<StatementsOverview> {
  return STATEMENTS_OVERVIEW;
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  return ANALYTICS_OVERVIEW;
}

export async function getCreditReport(): Promise<CreditReport> {
  return CREDIT_REPORT;
}

export async function getCompanyOverview(): Promise<CompanyOverview> {
  return COMPANY_OVERVIEW;
}

export async function getSettingsOverview(): Promise<SettingsOverview> {
  return SETTINGS_OVERVIEW;
}
