import { useQuery } from "@tanstack/react-query";
import {
  getBankingSummary,
  getIndicatorsOverview,
  getStatementsOverview,
  getAnalyticsOverview,
  getCreditReport,
  getCompanyOverview,
  getSettingsOverview,
} from "./getters";

export function useBankingSummary() {
  return useQuery({ queryKey: ["banking-summary"], queryFn: getBankingSummary });
}

export function useIndicatorsOverview() {
  return useQuery({ queryKey: ["indicators-overview"], queryFn: getIndicatorsOverview });
}

export function useStatementsOverview() {
  return useQuery({ queryKey: ["statements-overview"], queryFn: getStatementsOverview });
}

export function useAnalyticsOverview() {
  return useQuery({ queryKey: ["analytics-overview"], queryFn: getAnalyticsOverview });
}

export function useCreditReport() {
  return useQuery({ queryKey: ["credit-report"], queryFn: getCreditReport });
}

export function useCompanyOverview() {
  return useQuery({ queryKey: ["company-overview"], queryFn: getCompanyOverview });
}

export function useSettingsOverview() {
  return useQuery({ queryKey: ["settings-overview"], queryFn: getSettingsOverview });
}
