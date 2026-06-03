"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FilingDocument } from "@/components/FilingDocument";
import { Upload, CheckCheck, Clock, AlertCircle, Building2, Shield, FileText, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import Link from "next/link";

const statusMap: Record<string, { label: string; variant: any }> = {
  pending:      { label: "بانتظار الإيداع",  variant: "warning" },
  submitted:    { label: "مُودع",             variant: "default" },
  acknowledged: { label: "مُعترف به",         variant: "success" },
  rejected:     { label: "مرفوض",            variant: "destructive" },
};

const typeMap: Record<string, { label: string; icon: any }> = {
  ministry_of_commerce: { label: "وزارة التجارة", icon: Building2 },
  zakat_tax:            { label: "هيئة الزكاة والضريبة", icon: Shield },
  other:                { label: "جهة أخرى", icon: FileText },
};

export default function FilingsPage() {
  const [filings, setFilings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [statements, setStatements] = useState<any[]>([]);
  const [approvalsMap, setApprovalsMap] = useState<Record<string, any[]>>({});
  const [filingInProgress, setFilingInProgress] = useState<string | null>(null);
  const [documentFiling, setDocumentFiling] = useState<any | null>(null);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string>("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data: profile } = await supabase.from("users").select("company_id").eq("id", user.id).single() as { data: any };
    if (!profile?.company_id) { setLoading(false); return; }

    const [filingsRes, companyRes, stmtRes, approvalsRes] = await Promise.all([
      supabase.from("filings").select("*").eq("company_id", profile.company_id).order("created_at", { ascending: false }) as any,
      supabase.from("companies").select("*").eq("id", profile.company_id).single() as any,
      supabase.from("financial_statements").select("*").eq("company_id", profile.company_id) as any,
      supabase.from("approvals").select("*").eq("company_id", profile.company_id).eq("status", "approved") as any,
    ]);

    setFilings(filingsRes.data || []);
    setCompany(companyRes.data);
    setStatements(stmtRes.data || []);

    const aMap: Record<string, any[]> = {};
    (approvalsRes.data || []).forEach((a: any) => {
      if (!aMap[a.entity_id]) aMap[a.entity_id] = [];
      aMap[a.entity_id].push(a);
    });
    setApprovalsMap(aMap);
    setLoading(false);
  }

  // Auto-create filings for approved statements that don't have one yet
  useEffect(() => {
    if (!loading && statements.length > 0 && filings.length === 0) {
      const approvedStmts = statements.filter((s) => s.status === "approved");
      if (approvedStmts.length > 0) {
        createFilingsForStatements(approvedStmts);
      }
    }
  }, [loading]); // eslint-disable-line

  async function createFilingsForStatements(stmts: any[]) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("users").select("company_id").eq("id", user.id).single() as { data: any };
    if (!profile?.company_id) return;

    for (const stmt of stmts) {
      await (supabase.from("filings") as any).insert({
        company_id: profile.company_id,
        statement_id: stmt.id,
        filing_type: "ministry_of_commerce",
        status: "pending",
        created_by: user.id,
      });
    }
    await loadData();
  }

  async function handleSubmit(filingId: string) {
    setFilingInProgress(filingId);
    try {
      await new Promise((r) => setTimeout(r, 2500)); // Simulate API call
      const res = await fetch(`/api/filings/${filingId}/submit`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setReferenceNumber(json.data.reference_number);
        setCelebratingId(filingId);
        setFilings((prev) => prev.map((f) => f.id === filingId ? { ...f, status: "submitted", reference_number: json.data.reference_number } : f));
      } else toast.error(json.error);
    } catch { toast.error("حدث خطأ"); }
    finally { setFilingInProgress(null); }
  }

  const acknowledged = filings.filter((f) => f.status === "acknowledged").length;
  const submitted = filings.filter((f) => f.status === "submitted").length;
  const pending = filings.filter((f) => f.status === "pending").length;

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">الإيداع الرسمي</h1>
        <p className="text-sm text-[var(--muted-foreground)] font-arabic">إيداع القوائم المالية المعتمدة لدى الجهات الحكومية</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "مودع ومعترف به", count: acknowledged, color: "var(--success)", icon: CheckCheck },
          { label: "مودع بانتظار الاعتراف", count: submitted, color: "var(--primary)", icon: Clock },
          { label: "بانتظار الإيداع", count: pending, color: "var(--warning)", icon: AlertCircle },
        ].map((s) => { const Icon = s.icon; return (
          <Card key={s.label}><CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2"><Icon className="h-4 w-4" style={{ color: s.color }} /><p className="text-xs text-[var(--muted-foreground)] font-arabic">{s.label}</p></div>
            <p className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.count}</p>
          </CardContent></Card>
        );})}
      </div>

      {/* Process steps */}
      <Card><CardContent className="p-5">
        <h2 className="text-sm font-bold text-[var(--foreground)] font-arabic mb-4">مسار الإيداع الرسمي</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { num: "1", label: "إنشاء القوائم", done: statements.length > 0 },
            { num: "2", label: "مراجعة المحاسب", done: Object.keys(approvalsMap).length > 0 },
            { num: "3", label: "اعتماد الإدارة", done: statements.some((s) => s.status === "approved") },
            { num: "4", label: "تعميد الإيداع", done: filings.some((f) => f.status !== "pending") },
            { num: "5", label: "وزارة التجارة", done: filings.some((f) => f.status === "acknowledged") },
          ].map((step, i, arr) => (
            <div key={step.num} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-colors"
                  style={{ background: step.done ? "var(--primary)" : "var(--muted)", color: step.done ? "white" : "var(--muted-foreground)" }}
                >
                  {step.done ? <Check className="h-4 w-4" /> : step.num}
                </div>
                <span className="text-[11px] text-[var(--muted-foreground)] font-arabic whitespace-nowrap">{step.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`mx-2 h-0.5 w-8 shrink-0 rounded-full ${step.done ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />
              )}
            </div>
          ))}
        </div>
      </CardContent></Card>

      {/* Filings */}
      {loading ? (
        <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-[20px] bg-[var(--muted)]" />)}</div>
      ) : filings.length === 0 ? (
        <Card><CardContent className="p-10 text-center">
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">لا توجد إيداعات بعد</p>
          <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-1">اعتمد القوائم المالية أولاً لإنشاء طلبات الإيداع</p>
          <Link href="/approvals" className="mt-4 inline-block">
            <Button size="sm" variant="outline" className="font-arabic">الذهاب للموافقات</Button>
          </Link>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filings.map((filing) => {
            const s = statusMap[filing.status];
            const ft = typeMap[filing.filing_type] || typeMap.other;
            const Icon = ft.icon;
            const isFiling = filingInProgress === filing.id;
            const isCelebrating = celebratingId === filing.id;
            const relatedStmt = statements.find((st) => st.id === filing.statement_id);
            const typeLabel = relatedStmt?.statement_type === "income_statement" ? "قائمة الدخل" : relatedStmt?.statement_type === "balance_sheet" ? "الميزانية العمومية" : "قائمة مالية";

            return (
              <Card key={filing.id}><CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)]">
                      <Icon className="h-5 w-5 text-[var(--primary)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-[var(--foreground)] font-arabic">{typeLabel}</p>
                        <Badge variant={s?.variant} className="font-arabic text-[11px]">{s?.label}</Badge>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-2">{ft.label}</p>
                      {filing.reference_number && (
                        <div className="flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 w-fit">
                          <span className="text-xs text-[var(--muted-foreground)] font-arabic">رقم المرجع:</span>
                          <span className="text-xs font-bold text-[var(--foreground)]" dir="ltr">{filing.reference_number}</span>
                        </div>
                      )}
                      {filing.filed_at && (
                        <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-1">تاريخ الإيداع: {formatDate(filing.filed_at)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {filing.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-arabic gap-1.5"
                          onClick={() => setDocumentFiling(filing)}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          معاينة وثيقة التعميد
                        </Button>
                        <Button
                          size="sm"
                          className="font-arabic gap-1.5"
                          disabled={isFiling}
                          onClick={() => handleSubmit(filing.id)}
                        >
                          {isFiling ? (
                            <span className="flex items-center gap-2">
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              جاري الإرسال...
                            </span>
                          ) : <><Upload className="h-4 w-4" />إيداع الآن</>}
                        </Button>
                      </>
                    )}
                    {(filing.status === "submitted" || filing.status === "acknowledged") && (
                      <Button variant="outline" size="sm" className="font-arabic gap-1.5" onClick={() => setDocumentFiling(filing)}>
                        <CheckCheck className="h-4 w-4 text-[var(--success)]" />
                        عرض وثيقة التعميد
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent></Card>
            );
          })}
        </div>
      )}

      {/* Filing document dialog */}
      <Dialog open={!!documentFiling} onOpenChange={(open) => { if (!open) { setDocumentFiling(null); setCelebratingId(null); } }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-arabic">وثيقة تعميد الإيداع الرسمي</DialogTitle>
          </DialogHeader>

          {celebratingId === documentFiling?.id ? (
            <div className="flex flex-col items-center text-center gap-5 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)]">
                <CheckCheck className="h-8 w-8 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-lg font-black text-[var(--foreground)] font-arabic">تم الإيداع بنجاح</p>
                <p className="text-sm text-[var(--muted-foreground)] font-arabic mt-1">القوائم المالية الآن في قيد المراجعة من وزارة التجارة والاستثمار</p>
              </div>
              <div className="rounded-[12px] border border-[var(--border)] bg-[var(--muted)] px-6 py-3">
                <p className="text-xs text-[var(--muted-foreground)] font-arabic">رقم المرجع الرسمي</p>
                <p className="text-lg font-black text-[var(--primary)]" dir="ltr">{referenceNumber}</p>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic">الوقت المتوقع للاعتراف: 3-5 أيام عمل</p>
              <Button className="font-arabic" onClick={() => { setDocumentFiling(null); setCelebratingId(null); }}>إغلاق</Button>
            </div>
          ) : documentFiling && company ? (
            <>
              <FilingDocument
                referenceNumber={documentFiling.reference_number || `MC-${new Date().getFullYear()}-XXXX`}
                companyName={company.name_ar || company.name}
                companyNameEn={company.name}
                commercialRegistration={company.commercial_registration}
                taxNumber={company.tax_number}
                bankIban={company.bank_account_iban}
                statementType="قائمة الدخل"
                periodStart={statements[0]?.period_start || new Date().toISOString().slice(0, 10)}
                periodEnd={statements[0]?.period_end || new Date().toISOString().slice(0, 10)}
                totalRevenue={statements[0]?.data?.total_revenue || 0}
                totalExpenses={statements[0]?.data?.total_expenses || 0}
                netProfit={statements[0]?.data?.net_profit || 0}
                approvalChain={[
                  { name: "المحاسب", role: "مراجعة أولية", approvedAt: new Date().toISOString() },
                  { name: "المدقق", role: "تدقيق واعتماد", approvedAt: new Date().toISOString() },
                  { name: "مدير الشركة", role: "الموافقة النهائية", approvedAt: new Date().toISOString() },
                ]}
                filedAt={documentFiling.filed_at}
              />
              <div className="flex gap-3 mt-4 no-print">
                <Button variant="outline" className="flex-1 font-arabic" onClick={() => window.print()}>
                  طباعة
                </Button>
                {documentFiling.status === "pending" && (
                  <Button
                    className="flex-1 font-arabic gap-2"
                    disabled={filingInProgress === documentFiling.id}
                    onClick={() => handleSubmit(documentFiling.id)}
                  >
                    {filingInProgress === documentFiling.id ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        جاري الإرسال لوزارة التجارة...
                      </span>
                    ) : <><Upload className="h-4 w-4" />إرسال إلكترونياً لوزارة التجارة</>}
                  </Button>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
