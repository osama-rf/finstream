"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Sparkles, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";

const statements = [
  { id: "1", type: "قائمة الدخل", period: "Q1 2026 — يناير إلى مارس", status: "approved", createdAt: "2026-04-10", approvedBy: "خالد العمر" },
  { id: "2", type: "الميزانية العمومية", period: "Q1 2026 — يناير إلى مارس", status: "approved", createdAt: "2026-04-10", approvedBy: "خالد العمر" },
  { id: "3", type: "قائمة التدفقات النقدية", period: "Q1 2026 — يناير إلى مارس", status: "pending_review", createdAt: "2026-04-12", approvedBy: null },
  { id: "4", type: "قائمة الدخل", period: "Q2 2026 — أبريل إلى يونيو", status: "draft", createdAt: "2026-06-01", approvedBy: null },
];

const statusMap: Record<string, { label: string; variant: any }> = {
  draft: { label: "مسودة", variant: "secondary" },
  pending_review: { label: "بانتظار المراجعة", variant: "warning" },
  approved: { label: "معتمدة", variant: "success" },
  filed: { label: "مودعة", variant: "default" },
};

// Sample income statement data
const incomeData = {
  revenues: [
    { label: "إيرادات الخدمات", amount: 2250000 },
    { label: "إيرادات الاستشارات", amount: 597500 },
  ],
  expenses: [
    { label: "تكلفة الخدمات", amount: 980000 },
    { label: "مصروفات إدارية وعمومية", amount: 450000 },
    { label: "رواتب وأجور", amount: 420000 },
    { label: "مصروفات تسويقية", amount: 73200 },
  ],
};

const totalRevenue = incomeData.revenues.reduce((s, r) => s + r.amount, 0);
const totalExpenses = incomeData.expenses.reduce((s, e) => s + e.amount, 0);
const netProfit = totalRevenue - totalExpenses;

export default function StatementsPage() {
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "income">("list");

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2400));
    setGenerating(false);
    toast.success("تم إنشاء قائمة الدخل لـ Q2 2026 بالذكاء الاصطناعي");
  }

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">القوائم المالية</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">إنشاء ومراجعة القوائم المالية الدورية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
            <Sparkles className="h-4 w-4" />
            {generating ? "يعمل الذكاء الاصطناعي..." : "إنشاء تلقائي بالـ AI"}
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            قائمة جديدة
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--muted)] p-1 w-fit">
        {[{ key: "list", label: "القوائم" }, { key: "income", label: "قائمة الدخل" }].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`rounded-[10px] px-4 py-2 text-sm font-medium font-arabic transition-all ${
              activeTab === tab.key
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow-soft)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "list" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {statements.map((stmt) => {
            const status = statusMap[stmt.status];
            return (
              <Card key={stmt.id} className="cursor-pointer hover:border-[var(--primary)] transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                        <FileText className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--foreground)] font-arabic text-sm">{stmt.type}</p>
                        <p className="text-xs text-[var(--muted-foreground)] font-arabic">{stmt.period}</p>
                      </div>
                    </div>
                    <Badge variant={status.variant} className="font-arabic shrink-0">{status.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                      أُنشئت: {stmt.createdAt}
                    </p>
                    {stmt.approvedBy && (
                      <p className="text-xs text-[var(--success)] font-arabic">
                        اعتمدها: {stmt.approvedBy}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 font-arabic text-xs">معاينة</Button>
                    {stmt.status === "approved" && (
                      <Button size="sm" className="flex-1 font-arabic text-xs">رفع للإيداع</Button>
                    )}
                    {stmt.status === "draft" && (
                      <Button variant="secondary" size="sm" className="flex-1 font-arabic text-xs">إرسال للمراجعة</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--foreground)] font-arabic">قائمة الدخل</h2>
                <p className="text-sm text-[var(--muted-foreground)] font-arabic">Q1 2026 — يناير إلى مارس</p>
              </div>
              <Badge variant="success" className="font-arabic">معتمدة</Badge>
            </div>

            {/* Revenues */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-[var(--success)]" />
                <h3 className="text-sm font-bold text-[var(--success)] font-arabic">الإيرادات</h3>
              </div>
              <div className="space-y-2">
                {incomeData.revenues.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-[10px] bg-[var(--surface)] px-4 py-3">
                    <span className="text-sm text-[var(--foreground)] font-arabic">{item.label}</span>
                    <span className="text-sm font-bold text-[var(--success)] tabular-nums" dir="ltr">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-[10px] border border-[var(--success)]/20 bg-[color:color-mix(in_srgb,var(--success)_6%,transparent)] px-4 py-3">
                  <span className="text-sm font-bold text-[var(--foreground)] font-arabic">إجمالي الإيرادات</span>
                  <span className="text-sm font-bold text-[var(--success)] tabular-nums" dir="ltr">{formatCurrency(totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-4 w-4 text-[var(--destructive)]" />
                <h3 className="text-sm font-bold text-[var(--destructive)] font-arabic">المصروفات</h3>
              </div>
              <div className="space-y-2">
                {incomeData.expenses.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-[10px] bg-[var(--surface)] px-4 py-3">
                    <span className="text-sm text-[var(--foreground)] font-arabic">{item.label}</span>
                    <span className="text-sm font-bold text-[var(--destructive)] tabular-nums" dir="ltr">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-[10px] border border-[var(--destructive)]/20 bg-[color:color-mix(in_srgb,var(--destructive)_6%,transparent)] px-4 py-3">
                  <span className="text-sm font-bold text-[var(--foreground)] font-arabic">إجمالي المصروفات</span>
                  <span className="text-sm font-bold text-[var(--destructive)] tabular-nums" dir="ltr">{formatCurrency(totalExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Net profit */}
            <div className="rounded-[14px] border-2 border-[var(--primary)]/30 bg-[color:color-mix(in_srgb,var(--primary)_6%,transparent)] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-[var(--primary)]" />
                  <span className="text-base font-bold text-[var(--foreground)] font-arabic">صافي الربح</span>
                </div>
                <span className="text-xl font-black text-[var(--primary)] tabular-nums" dir="ltr">
                  {formatCurrency(netProfit)}
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-1">
                هامش الربح: <span dir="ltr" className="tabular-nums">{Math.round((netProfit / totalRevenue) * 100)}%</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
