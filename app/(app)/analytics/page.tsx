"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, TrendingDown, BarChart3, PieChart,
  ArrowUpRight, ArrowDownRight, Calendar,
  Wallet, Users, DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { AgentPanel } from "@/components/AgentPanel";
import { useUser } from "@/lib/contexts/UserContext";

const periods = ["آخر 30 يوم", "Q2 2026", "Q1 2026", "2025 كامل"];

const monthlyData = [
  { month: "يناير", revenue: 680_000, expenses: 410_000 },
  { month: "فبراير", revenue: 720_000, expenses: 390_000 },
  { month: "مارس", revenue: 850_000, expenses: 450_000 },
  { month: "أبريل", revenue: 790_000, expenses: 430_000 },
  { month: "مايو", revenue: 910_000, expenses: 480_000 },
  { month: "يونيو", revenue: 940_000, expenses: 445_000, partial: true },
];

const maxVal = Math.max(...monthlyData.flatMap(m => [m.revenue, m.expenses]));

const expenseBreakdown = [
  { label: "الرواتب والأجور", amount: 420_000, pct: 41, color: "var(--primary)" },
  { label: "تكلفة الخدمات", amount: 280_000, pct: 27, color: "var(--success)" },
  { label: "إدارية وعمومية", amount: 180_000, pct: 18, color: "var(--warning)" },
  { label: "تسويق وإعلان", amount: 73_200, pct: 7, color: "var(--destructive)" },
  { label: "تقنية ومصروفات بنكية", amount: 70_000, pct: 7, color: "var(--muted-foreground)" },
];

const revenueBySource = [
  { label: "إيرادات الخدمات", amount: 2_250_000, pct: 79, change: "+14%" },
  { label: "إيرادات الاستشارات", amount: 597_500, pct: 21, change: "+8%" },
];

const kpis = [
  { label: "إيرادات 2026 حتى الآن", value: 4_890_000, change: "+18.4%", up: true, icon: TrendingUp, color: "var(--success)" },
  { label: "إجمالي المصروفات", value: 2_605_000, change: "+9.1%", up: false, icon: TrendingDown, color: "var(--destructive)" },
  { label: "صافي الربح", value: 2_285_000, change: "+30.2%", up: true, icon: DollarSign, color: "var(--primary)" },
  { label: "الإيراد لكل موظف", value: 385_000, change: "+12%", up: true, icon: Users, color: "var(--warning)" },
];

export default function AnalyticsPage() {
  const { user } = useUser();
  const [period, setPeriod] = useState(periods[0]);

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">التحليل المالي</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">
            تحليل شامل للأداء المالي مجمّعاً من جميع مصادرك البنكية
          </p>
        </div>
        <div className="flex gap-1 rounded-[12px] border border-[var(--border)] bg-[var(--muted)] p-1">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-[8px] px-3 py-1.5 text-xs font-medium font-arabic transition-all ${
                period === p
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow-soft)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-[12px]"
                    style={{ background: `color-mix(in srgb, ${kpi.color} 14%, transparent)` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: kpi.color }} />
                  </div>
                  <div className="flex items-center gap-1">
                    {kpi.up
                      ? <ArrowUpRight className="h-3.5 w-3.5 text-[var(--success)]" />
                      : <ArrowDownRight className="h-3.5 w-3.5 text-[var(--destructive)]" />
                    }
                    <span className="text-xs font-medium" style={{ color: kpi.up ? "var(--success)" : "var(--destructive)" }}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <p className="text-xl font-bold tabular-nums" style={{ color: kpi.color }} dir="ltr">
                  {formatCurrency(kpi.value)}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        {/* Revenue vs Expenses bar chart */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[var(--foreground)] font-arabic flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
                الإيرادات مقابل المصروفات الشهرية
              </h2>
              <div className="flex items-center gap-3 text-xs font-arabic">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]" />
                  إيرادات
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--destructive)]" />
                  مصروفات
                </span>
              </div>
            </div>
            <div className="flex items-end gap-3 h-48 pb-6 relative">
              {/* Y-axis labels */}
              <div className="absolute inset-y-0 start-0 end-0 flex flex-col justify-between pointer-events-none">
                {[1, 0.75, 0.5, 0.25, 0].map(frac => (
                  <div key={frac} className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--muted-foreground)] w-12 text-end shrink-0 font-arabic" dir="ltr">
                      {Math.round(maxVal * frac / 1000)}k
                    </span>
                    <div className="flex-1 border-t border-[var(--border)]/50" />
                  </div>
                ))}
              </div>
              {/* Bars */}
              <div className="flex-1 flex items-end justify-around gap-1 ps-16">
                {monthlyData.map(m => (
                  <div key={m.month} className="flex flex-col items-center gap-1 flex-1">
                    <div className="flex items-end gap-0.5 w-full justify-center">
                      <div
                        className="w-3 rounded-t-sm transition-all"
                        style={{
                          height: `${(m.revenue / maxVal) * 160}px`,
                          background: m.partial ? "color-mix(in srgb, var(--success) 60%, transparent)" : "var(--success)",
                        }}
                      />
                      <div
                        className="w-3 rounded-t-sm transition-all"
                        style={{
                          height: `${(m.expenses / maxVal) * 160}px`,
                          background: m.partial ? "color-mix(in srgb, var(--destructive) 60%, transparent)" : "var(--destructive)",
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--muted-foreground)] font-arabic">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense breakdown */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-5 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[var(--border)]" />
              توزيع المصروفات
            </h2>
            <div className="space-y-3">
              {expenseBreakdown.map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--foreground)] font-arabic">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--foreground)] tabular-nums" dir="ltr">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="text-[11px] text-[var(--muted-foreground)]" dir="ltr">{item.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by source */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-[var(--success)]" />
            مصادر الإيرادات
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {revenueBySource.map(src => (
              <div key={src.label} className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-[var(--foreground)] font-arabic">{src.label}</p>
                  <Badge variant="success" className="font-arabic text-[11px]">{src.change}</Badge>
                </div>
                <p className="text-2xl font-black text-[var(--success)] tabular-nums mb-1" dir="ltr">
                  {formatCurrency(src.amount)}
                </p>
                <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--success)]"
                    style={{ width: `${src.pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] font-arabic mt-1">{src.pct}% من إجمالي الإيرادات</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI panel */}
      <AgentPanel userRole={user?.role ?? "company_admin"} />
    </div>
  );
}
