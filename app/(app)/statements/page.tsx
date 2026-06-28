"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText, Plus, Sparkles, TrendingUp, TrendingDown,
  ArrowLeftRight, Share2, Download, Eye, CheckCircle2,
  Building2, Clock, Send,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";

const statements = [
  {
    id: "1",
    type: "قائمة الدخل",
    typeKey: "income",
    period: "Q1 2026 — يناير إلى مارس",
    status: "approved",
    createdAt: "2026-04-10",
    approvedBy: "خالد العمر",
    aiGenerated: true,
    sharedWith: ["البنك الأهلي"],
  },
  {
    id: "2",
    type: "الميزانية العمومية",
    typeKey: "balance",
    period: "Q1 2026 — يناير إلى مارس",
    status: "approved",
    createdAt: "2026-04-10",
    approvedBy: "خالد العمر",
    aiGenerated: true,
    sharedWith: [],
  },
  {
    id: "3",
    type: "قائمة التدفقات النقدية",
    typeKey: "cashflow",
    period: "Q1 2026 — يناير إلى مارس",
    status: "pending_review",
    createdAt: "2026-04-12",
    approvedBy: null,
    aiGenerated: true,
    sharedWith: [],
  },
  {
    id: "4",
    type: "قائمة الدخل",
    typeKey: "income",
    period: "Q2 2026 — أبريل إلى يونيو",
    status: "draft",
    createdAt: "2026-06-01",
    approvedBy: null,
    aiGenerated: false,
    sharedWith: [],
  },
];

const statusMap: Record<string, { label: string; variant: "secondary" | "warning" | "success" | "default" }> = {
  draft: { label: "مسودة", variant: "secondary" },
  pending_review: { label: "بانتظار المراجعة", variant: "warning" },
  approved: { label: "معتمدة", variant: "success" },
  filed: { label: "مودعة", variant: "default" },
};

const incomeData = {
  revenues: [
    { label: "إيرادات الخدمات", amount: 2_250_000 },
    { label: "إيرادات الاستشارات", amount: 597_500 },
  ],
  expenses: [
    { label: "تكلفة الخدمات", amount: 980_000 },
    { label: "مصروفات إدارية وعمومية", amount: 450_000 },
    { label: "رواتب وأجور", amount: 420_000 },
    { label: "مصروفات تسويقية", amount: 73_200 },
  ],
};

const totalRevenue = incomeData.revenues.reduce((s, r) => s + r.amount, 0);
const totalExpenses = incomeData.expenses.reduce((s, e) => s + e.amount, 0);
const netProfit = totalRevenue - totalExpenses;

const banks = ["البنك الأهلي السعودي", "بنك الراجحي", "مصرف الإنماء", "بنك الرياض"];

export default function StatementsPage() {
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "income">("list");
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState(banks[0]);

  async function handleGenerate() {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2400));
    setGenerating(false);
    toast.success("أنشأ الذكاء الاصطناعي قائمة الدخل لـ Q2 2026 من بيانات البنوك المربوطة");
  }

  async function handleShare(id: string) {
    setSharingId(id);
    await new Promise(r => setTimeout(r, 1500));
    setSharingId(null);
    toast.success(`تم إرسال القائمة المالية إلى ${selectedBank}`);
  }

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">القوائم المالية</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">
            أنشئ قوائمك المالية بالذكاء الاصطناعي من بيانات بنوكك وشاركها مع البنوك
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="font-arabic gap-2" onClick={handleGenerate} disabled={generating}>
            <Sparkles className="h-4 w-4" />
            {generating ? "الذكاء الاصطناعي يعمل..." : "إنشاء بالـ AI"}
          </Button>
          <Button size="sm" className="font-arabic gap-2">
            <Plus className="h-4 w-4" />
            قائمة جديدة
          </Button>
        </div>
      </div>

      {/* AI generation info */}
      <div className="rounded-[16px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_5%,transparent)] px-5 py-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[var(--foreground)] font-arabic">
              إنشاء القوائم المالية بالذكاء الاصطناعي
            </p>
            <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-1 leading-relaxed">
              يقوم الذكاء الاصطناعي بتحليل بياناتك من 3 بنوك مربوطة وتوليد قوائم مالية دقيقة جاهزة للإيداع أو المشاركة مع البنوك للحصول على تمويل.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--muted)] p-1 w-fit">
        {[
          { key: "list", label: "القوائم" },
          { key: "income", label: "قائمة الدخل التفصيلية" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "list" | "income")}
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
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                        <FileText className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-[var(--foreground)] font-arabic text-sm">{stmt.type}</p>
                          {stmt.aiGenerated && (
                            <Badge variant="secondary" className="font-arabic text-[10px] gap-0.5 px-1.5">
                              <Sparkles className="h-2.5 w-2.5" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] font-arabic">{stmt.period}</p>
                      </div>
                    </div>
                    <Badge variant={status.variant} className="font-arabic shrink-0 text-[11px]">{status.label}</Badge>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                      أُنشئت: {stmt.createdAt}
                    </p>
                    {stmt.approvedBy && (
                      <p className="text-xs text-[var(--success)] font-arabic flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        اعتمدها: {stmt.approvedBy}
                      </p>
                    )}
                  </div>

                  {stmt.sharedWith.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Building2 className="h-3.5 w-3.5 text-[var(--success)]" />
                      <span className="text-xs text-[var(--success)] font-arabic">
                        مشاركة مع: {stmt.sharedWith.join("، ")}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 font-arabic text-xs gap-1">
                      <Eye className="h-3 w-3" />
                      معاينة
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => toast.success("جاري التنزيل...")}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    {stmt.status === "approved" && (
                      <Button
                        size="sm"
                        className="flex-1 font-arabic text-xs gap-1"
                        disabled={sharingId === stmt.id}
                        onClick={() => handleShare(stmt.id)}
                      >
                        {sharingId === stmt.id ? (
                          <span className="flex items-center gap-1">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            إرسال...
                          </span>
                        ) : (
                          <>
                            <Send className="h-3 w-3" />
                            مشاركة مع بنك
                          </>
                        )}
                      </Button>
                    )}
                    {stmt.status === "draft" && (
                      <Button variant="secondary" size="sm" className="flex-1 font-arabic text-xs gap-1">
                        <Clock className="h-3 w-3" />
                        إرسال للمراجعة
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Share bar */}
          <Card className="border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)]">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-[var(--primary)]" />
                  <span className="text-sm font-bold text-[var(--foreground)] font-arabic">مشاركة هذه القائمة مع بنك</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                    className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-arabic text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                  >
                    {banks.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <Button size="sm" className="font-arabic gap-1.5 shrink-0" onClick={() => handleShare("income-q1")}>
                    <Send className="h-3.5 w-3.5" />
                    إرسال
                  </Button>
                  <Button variant="outline" size="sm" className="font-arabic gap-1.5 shrink-0" onClick={() => toast.success("جاري التنزيل...")}>
                    <Download className="h-3.5 w-3.5" />
                    تنزيل PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)] font-arabic">قائمة الدخل</h2>
                  <p className="text-sm text-[var(--muted-foreground)] font-arabic">Q1 2026 — يناير إلى مارس</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
                    <span className="text-xs text-[var(--primary)] font-arabic">أُنشئت بالذكاء الاصطناعي من بيانات البنوك</span>
                  </div>
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
                  هامش الربح: <span dir="ltr" className="tabular-nums font-bold text-[var(--primary)]">{Math.round((netProfit / totalRevenue) * 100)}%</span>
                  {" "}· <span className="text-[var(--success)]">أعلى من متوسط القطاع (24%)</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
