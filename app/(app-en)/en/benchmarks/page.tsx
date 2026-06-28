"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3, CheckCircle2, AlertCircle,
  ArrowUpRight, ArrowDownRight, Globe,
} from "lucide-react";
import { toast } from "sonner";

const sectors = [
  { key: "tech", label: "Technology" },
  { key: "consulting", label: "Consulting & Services" },
  { key: "retail", label: "Retail" },
  { key: "manufacturing", label: "Manufacturing" },
];

const regions = [
  { key: "gcc", label: "GCC" },
  { key: "mena", label: "MENA" },
  { key: "global", label: "Global" },
];

const metrics = [
  { key: "net_margin", label: "Net Profit Margin", company: 32.5, sectorAvg: 24.1, topQuartile: 38, unit: "%", higherIsBetter: true },
  { key: "revenue_growth", label: "Revenue Growth (YoY)", company: 18.4, sectorAvg: 12.3, topQuartile: 28, unit: "%", higherIsBetter: true },
  { key: "gross_margin", label: "Gross Margin", company: 61, sectorAvg: 58, topQuartile: 72, unit: "%", higherIsBetter: true },
  { key: "current_ratio", label: "Current Ratio", company: 1.8, sectorAvg: 1.5, topQuartile: 2.4, unit: "x", higherIsBetter: true },
  { key: "dso", label: "Days Sales Outstanding", company: 42, sectorAvg: 35, topQuartile: 22, unit: "days", higherIsBetter: false },
  { key: "opex_ratio", label: "OpEx Ratio", company: 48, sectorAvg: 52, topQuartile: 38, unit: "%", higherIsBetter: false },
];

type MetricStatus = "above" | "below" | "close";

function getStatus(m: typeof metrics[0]): MetricStatus {
  const threshold = m.sectorAvg * 0.05;
  if (m.higherIsBetter) {
    if (m.company >= m.sectorAvg + threshold) return "above";
    if (m.company <= m.sectorAvg - threshold) return "below";
    return "close";
  } else {
    if (m.company <= m.sectorAvg - threshold) return "above";
    if (m.company >= m.sectorAvg + threshold) return "below";
    return "close";
  }
}

export default function BenchmarksEnPage() {
  const [selectedSector, setSelectedSector] = useState("consulting");
  const [selectedRegion, setSelectedRegion] = useState("gcc");

  const aboveCount = metrics.filter(m => getStatus(m) === "above").length;
  const belowCount = metrics.filter(m => getStatus(m) === "below").length;
  const closeCount = metrics.filter(m => getStatus(m) === "close").length;

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Sector Benchmarking</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Compare your financial KPIs against global sector averages to identify improvement opportunities
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 w-fit" onClick={() => toast.success("Benchmark report exported as PDF")}>
          Export Report
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[var(--muted-foreground)]" />
              <span className="text-sm font-bold text-[var(--foreground)]">Sector:</span>
              <div className="flex gap-1 flex-wrap">
                {sectors.map(s => (
                  <button key={s.key} onClick={() => setSelectedSector(s.key)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${selectedSector === s.key ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--foreground)]">Region:</span>
              <div className="flex gap-1">
                {regions.map(r => (
                  <button key={r.key} onClick={() => setSelectedRegion(r.key)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${selectedRegion === r.key ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-[var(--success)]/20 bg-[color:color-mix(in_srgb,var(--success)_4%,transparent)]">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
            <div>
              <p className="text-2xl font-black text-[var(--success)] tabular-nums">{aboveCount}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Above Average</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-[var(--warning)]" />
            <div>
              <p className="text-2xl font-black text-[var(--warning)] tabular-nums">{closeCount}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Near Average</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[var(--destructive)]/15">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-[var(--destructive)]" />
            <div>
              <p className="text-2xl font-black text-[var(--destructive)] tabular-nums">{belowCount}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Below Average</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(m => {
          const status = getStatus(m);
          const diff = m.higherIsBetter
            ? ((m.company - m.sectorAvg) / m.sectorAvg * 100).toFixed(1)
            : ((m.sectorAvg - m.company) / m.sectorAvg * 100).toFixed(1);
          const isPos = parseFloat(diff) >= 0;
          const max = Math.max(m.company, m.sectorAvg, m.topQuartile) * 1.15;

          return (
            <Card key={m.key} className={status === "above" ? "border-[var(--success)]/20" : status === "below" ? "border-[var(--destructive)]/15" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-bold text-[var(--foreground)]">{m.label}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    {isPos ? <ArrowUpRight className="h-4 w-4 text-[var(--success)]" /> : <ArrowDownRight className="h-4 w-4 text-[var(--destructive)]" />}
                    <span className="text-xs font-bold tabular-nums" style={{ color: isPos ? "var(--success)" : "var(--destructive)" }}>
                      {isPos ? "+" : ""}{diff}%
                    </span>
                    <Badge variant={status === "above" ? "success" : status === "below" ? "destructive" : "warning"} className="text-[10px] px-1.5 py-0.5">
                      {status === "above" ? "Better" : status === "below" ? "Lower" : "Close"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                  {[
                    { label: "Your company", value: m.company, color: status === "above" ? "var(--success)" : status === "below" ? "var(--destructive)" : "var(--warning)" },
                    { label: "Sector avg", value: m.sectorAvg, color: "var(--muted-foreground)" },
                    { label: "Top quartile", value: m.topQuartile, color: "var(--primary)" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-2">
                      <span className="text-[11px] w-20 text-[var(--muted-foreground)] shrink-0">{row.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(row.value / max) * 100}%`, background: row.color }} />
                      </div>
                      <span className="text-xs font-bold tabular-nums w-10 text-end">{row.value}{m.unit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
