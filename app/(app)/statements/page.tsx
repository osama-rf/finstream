"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, TrendingUp, TrendingDown, ArrowLeftRight, Bot, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

const statusMap: Record<string, { label: string; variant: any }> = {
  draft:          { label: "مسودة",            variant: "secondary" },
  pending_review: { label: "بانتظار المراجعة", variant: "warning" },
  approved:       { label: "معتمدة",           variant: "success" },
  filed:          { label: "مودعة",            variant: "default" },
};

const typeLabels: Record<string, string> = {
  income_statement: "قائمة الدخل",
  balance_sheet:    "الميزانية العمومية",
  cash_flow:        "قائمة التدفقات النقدية",
};

export default function StatementsPage() {
  const [statements, setStatements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "income">("list");
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    loadStatements();
  }, []);

  async function loadStatements() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data: profile } = await supabase.from("users").select("company_id").eq("id", user.id).single() as { data: any };
    if (!profile?.company_id) { setLoading(false); return; }
    const { data } = await supabase
      .from("financial_statements")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false });
    setStatements(data || []);
    setLoading(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/openbanking/generate-statements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`تم إنشاء ${json.data.statements.length} قائمة مالية — أُنشئت ${json.data.approvals_created} طلب موافقة`);
        await loadStatements();
      } else {
        toast.error(json.error || "فشل إنشاء القوائم");
      }
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSendForReview(id: string) {
    setSendingId(id);
    try {
      const res = await fetch(`/api/statements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending_review" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("تم إرسال القائمة للمراجعة");
        setStatements((prev) => prev.map((s) => s.id === id ? { ...s, status: "pending_review" } : s));
      } else {
        toast.error(json.error);
      }
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setSendingId(null);
    }
  }

  const incomeStmt = statements.find((s) => s.statement_type === "income_statement");
  const incomeData = incomeStmt?.data || {};
  const revenues: Record<string, number> = incomeData.revenues || {};
  const expenses: Record<string, number> = incomeData.expenses || {};
  const totalRevenue = incomeData.total_revenue || Object.values(revenues).reduce((s: number, v: any) => s + v, 0);
  const totalExpenses = incomeData.total_expenses || Object.values(expenses).reduce((s: number, v: any) => s + v, 0);
  const netProfit = incomeData.net_profit ?? (totalRevenue - totalExpenses);

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">القوائم المالية</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">إنشاء ومراجعة القوائم المالية الدورية</p>
        </div>
        <Button size="sm" onClick={handleGenerate} disabled={generating} className="font-arabic gap-2">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {generating ? "الوكيل يحلل البيانات..." : "إنشاء القوائم تلقائياً"}
        </Button>
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
        loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[...Array(2)].map((_, i) => <div key={i} className="h-40 animate-pulse rounded-[20px] bg-[var(--muted)]" />)}
          </div>
        ) : statements.length === 0 ? (
          <Card><CardContent className="p-10">
            <div className="flex flex-col items-center text-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)]">
                <Bot className="h-8 w-8 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-base font-bold text-[var(--foreground)] font-arabic">لا توجد قوائم مالية بعد</p>
                <p className="text-sm text-[var(--muted-foreground)] font-arabic mt-1">
                  وكيل الذكاء الاصطناعي يستطيع إنشاء قائمة الدخل والميزانية العمومية تلقائياً من البيانات المصنفة
                </p>
              </div>
              <Button onClick={handleGenerate} disabled={generating} className="font-arabic gap-2">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? "الوكيل يحلل البيانات..." : "إنشاء القوائم الآن"}
              </Button>
            </div>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {statements.map((stmt) => {
              const s = statusMap[stmt.status] || statusMap.draft;
              const data = stmt.data || {};
              return (
                <Card key={stmt.id} className="cursor-pointer hover:border-[var(--primary)] transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                          <FileText className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="font-bold text-[var(--foreground)] font-arabic text-sm">{typeLabels[stmt.statement_type] || stmt.statement_type}</p>
                          <p className="text-xs text-[var(--muted-foreground)] font-arabic">{formatDate(stmt.period_start)} — {formatDate(stmt.period_end)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={s.variant} className="font-arabic">{s.label}</Badge>
                        {stmt.ai_generated && <Badge variant="default" className="font-arabic text-[10px]">وكيل الذكاء الاصطناعي</Badge>}
                      </div>
                    </div>
                    {stmt.statement_type === "income_statement" && data.total_revenue && (
                      <div className="flex items-center justify-between rounded-[10px] bg-[var(--muted)] px-3 py-2 mb-3">
                        <span className="text-xs text-[var(--muted-foreground)] font-arabic">صافي الربح</span>
                        <span className="text-sm font-bold tabular-nums" style={{ color: (data.net_profit ?? 0) >= 0 ? "var(--success)" : "var(--destructive)" }} dir="ltr">
                          {formatCurrency(data.net_profit ?? 0)}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 font-arabic text-xs" onClick={() => setActiveTab("income")}>معاينة</Button>
                      {stmt.status === "draft" && (
                        <Button size="sm" className="flex-1 font-arabic text-xs" disabled={sendingId === stmt.id} onClick={() => handleSendForReview(stmt.id)}>
                          {sendingId === stmt.id ? "جاري الإرسال..." : "إرسال للمراجعة"}
                        </Button>
                      )}
                      {stmt.status === "approved" && (
                        <Link href="/filings" className="flex-1">
                          <Button size="sm" className="w-full font-arabic text-xs">رفع للإيداع</Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <Card><CardContent className="p-6">
          {!incomeStmt ? (
            <div className="flex flex-col items-center text-center gap-4 py-8">
              <p className="text-sm text-[var(--muted-foreground)] font-arabic">لا توجد قائمة دخل بعد</p>
              <Button onClick={handleGenerate} disabled={generating} size="sm" className="font-arabic gap-2">
                <Sparkles className="h-4 w-4" />
                إنشاء القوائم
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)] font-arabic">قائمة الدخل</h2>
                  <p className="text-sm text-[var(--muted-foreground)] font-arabic">
                    {formatDate(incomeStmt.period_start)} — {formatDate(incomeStmt.period_end)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={statusMap[incomeStmt.status]?.variant || "secondary"} className="font-arabic">
                    {statusMap[incomeStmt.status]?.label || incomeStmt.status}
                  </Badge>
                  {incomeStmt.ai_generated && <Badge variant="default" className="font-arabic text-[10px]">وكيل الذكاء الاصطناعي</Badge>}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-4 w-4 text-[var(--success)]" /><h3 className="text-sm font-bold text-[var(--success)] font-arabic">الإيرادات</h3></div>
                <div className="space-y-2">
                  {Object.entries(revenues).map(([label, amount]) => (
                    <div key={label} className="flex items-center justify-between rounded-[10px] bg-[var(--surface)] px-4 py-3">
                      <span className="text-sm text-[var(--foreground)] font-arabic">{label}</span>
                      <span className="text-sm font-bold text-[var(--success)] tabular-nums" dir="ltr">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-[10px] border border-[color:color-mix(in_srgb,var(--success)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--success)_6%,transparent)] px-4 py-3">
                    <span className="text-sm font-bold text-[var(--foreground)] font-arabic">إجمالي الإيرادات</span>
                    <span className="text-sm font-bold text-[var(--success)] tabular-nums" dir="ltr">{formatCurrency(totalRevenue)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3"><TrendingDown className="h-4 w-4 text-[var(--destructive)]" /><h3 className="text-sm font-bold text-[var(--destructive)] font-arabic">المصروفات</h3></div>
                <div className="space-y-2">
                  {Object.entries(expenses).map(([label, amount]) => (
                    <div key={label} className="flex items-center justify-between rounded-[10px] bg-[var(--surface)] px-4 py-3">
                      <span className="text-sm text-[var(--foreground)] font-arabic">{label}</span>
                      <span className="text-sm font-bold text-[var(--destructive)] tabular-nums" dir="ltr">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-[10px] border border-[color:color-mix(in_srgb,var(--destructive)_16%,transparent)] bg-[color:color-mix(in_srgb,var(--destructive)_5%,transparent)] px-4 py-3">
                    <span className="text-sm font-bold text-[var(--foreground)] font-arabic">إجمالي المصروفات</span>
                    <span className="text-sm font-bold text-[var(--destructive)] tabular-nums" dir="ltr">{formatCurrency(totalExpenses)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] border-2 border-[color:color-mix(in_srgb,var(--primary)_25%,transparent)] bg-[color:color-mix(in_srgb,var(--primary)_6%,transparent)] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5 text-[var(--primary)]" />
                    <span className="text-base font-bold text-[var(--foreground)] font-arabic">صافي الربح</span>
                  </div>
                  <span className="text-xl font-black tabular-nums" style={{ color: netProfit >= 0 ? "var(--primary)" : "var(--destructive)" }} dir="ltr">
                    {formatCurrency(netProfit)}
                  </span>
                </div>
                {totalRevenue > 0 && (
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-1">
                    هامش الربح: <span className="tabular-nums" dir="ltr">{Math.round((netProfit / totalRevenue) * 100)}%</span>
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent></Card>
      )}
    </div>
  );
}
