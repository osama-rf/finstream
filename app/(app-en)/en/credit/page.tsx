"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Share2, RefreshCw, CheckCircle2,
  AlertCircle, TrendingUp, Building2, Send,
} from "lucide-react";
import { toast } from "sonner";

const creditScore = { score: 74, rating: "A-", generatedAt: "2026-06-28", validUntil: "2026-07-28" };

const ratios = [
  { key: "profit_margin", label: "Net Profit Margin", value: 32.5, unit: "%", benchmark: 24, benchmarkLabel: "Sector avg: 24%", status: "good" as const },
  { key: "current_ratio", label: "Current Ratio", value: 1.8, unit: "x", benchmark: 1.5, benchmarkLabel: "Bank req: ≥ 1.5", status: "good" as const },
  { key: "debt_equity", label: "Debt-to-Equity", value: 0.65, unit: "x", benchmark: 0.8, benchmarkLabel: "Bank req: ≤ 0.8", status: "good" as const },
  { key: "dso", label: "Days Sales Outstanding", value: 42, unit: "days", benchmark: 35, benchmarkLabel: "Sector avg: 35 days", status: "warning" as const },
  { key: "revenue_growth", label: "Revenue Growth (YoY)", value: 18.4, unit: "%", benchmark: 12, benchmarkLabel: "Sector avg: 12%", status: "good" as const },
  { key: "cash_coverage", label: "Cash Coverage Ratio", value: 2.1, unit: "x", benchmark: 1.5, benchmarkLabel: "Bank req: ≥ 1.5", status: "good" as const },
];

const banksList = [
  { name: "Saudi National Bank", product: "Working Capital Finance", maxAmount: "3,000,000", rate: "6.5%" },
  { name: "Al Rajhi Bank", product: "SME Project Finance", maxAmount: "2,500,000", rate: "6.9%" },
  { name: "Bank Albilad", product: "Revolving Credit Line", maxAmount: "1,500,000", rate: "7.2%" },
];

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "var(--success)" : score >= 50 ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle cx="72" cy="72" r={radius} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-black tabular-nums" style={{ color }}>{score}</p>
        <p className="text-xs text-[var(--muted-foreground)]">/ 100</p>
      </div>
    </div>
  );
}

export default function CreditEnPage() {
  const [sharing, setSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<"ratios" | "banks">("ratios");

  async function handleShare() {
    setSharing(true);
    await new Promise(r => setTimeout(r, 1500));
    setSharing(false);
    toast.success("Secure share link created — valid for 30 days");
  }

  const goodCount = ratios.filter(r => r.status === "good").length;
  const warningCount = ratios.filter(r => r.status === "warning").length;

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Credit Report</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Assess your financing readiness based on your real financial data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Report
          </Button>
          <Button size="sm" className="gap-2" onClick={handleShare} disabled={sharing}>
            <Share2 className="h-4 w-4" />
            {sharing ? "Creating link..." : "Share with Bank"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-6">
              <ScoreRing score={creditScore.score} />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl font-black text-[var(--success)]">{creditScore.rating}</span>
                  <Badge variant="success" className="text-sm px-3 py-1">Very Good</Badge>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Generated: {creditScore.generatedAt} · Valid until: {creditScore.validUntil}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--success)]">
                    <CheckCircle2 className="h-4 w-4" /> {goodCount} positive indicators
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--warning)]">
                    <AlertCircle className="h-4 w-4" /> {warningCount} need improvement
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--muted)] p-1 w-fit">
        {[{ key: "ratios", label: "Financial Ratios" }, { key: "banks", label: "Financing Offers" }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as "ratios" | "banks")}
            className={`rounded-[10px] px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.key ? "bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow-soft)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "ratios" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ratios.map(ratio => (
            <Card key={ratio.key} className={ratio.status === "warning" ? "border-[var(--warning)]/30" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-bold text-[var(--foreground)] leading-snug">{ratio.label}</p>
                  {ratio.status === "good"
                    ? <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0" />
                    : <AlertCircle className="h-4 w-4 text-[var(--warning)] shrink-0" />}
                </div>
                <p className="text-2xl font-black tabular-nums mb-2" style={{ color: ratio.status === "good" ? "var(--success)" : "var(--warning)" }}>
                  {ratio.value}{ratio.unit}
                </p>
                <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden mb-2">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (ratio.value / (ratio.benchmark * 1.6)) * 100)}%`, background: ratio.status === "good" ? "var(--success)" : "var(--warning)" }} />
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)]">{ratio.benchmarkLabel}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[16px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_5%,transparent)] px-5 py-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--foreground)]">
                Based on your <strong>A-</strong> rating, you qualify for financing up to <strong>SAR 3,000,000</strong>.
                Share your credit report directly with any bank to accelerate your financing application.
              </p>
            </div>
          </div>
          {banksList.map(bank => (
            <Card key={bank.name}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
                      <Building2 className="h-6 w-6 text-[var(--primary)]" />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--foreground)]">{bank.name}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">{bank.product}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-[var(--muted-foreground)]">Max Amount</p>
                      <p className="text-base font-bold text-[var(--foreground)]">SAR {bank.maxAmount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[var(--muted-foreground)]">Rate</p>
                      <p className="text-base font-bold text-[var(--success)]">{bank.rate}</p>
                    </div>
                    <Button size="sm" className="gap-1.5" onClick={() => toast.success(`Report sent to ${bank.name}`)}>
                      <Send className="h-3.5 w-3.5" />
                      Send Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
