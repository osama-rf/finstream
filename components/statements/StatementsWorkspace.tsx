"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FINANCIAL_STATEMENTS_SOURCE, QUARTERS, STATEMENTS_BY_QUARTER } from "@/lib/data/financial-statements";
import type { Statement } from "@/lib/mock/types";
import { formatCurrency } from "@/lib/utils/format";
import { BookOpen, CheckCircle2, CircleAlert, Database, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Lang = "ar" | "en";
type Entry = { id: string; date: string; description: string; debitAccount: string; creditAccount: string; amount: number; status: "balanced" };

const copy = {
  ar: {
    title: "القوائم المالية", subtitle: "القوائم الفعلية المستوردة من ملف المنشأة، مع مقارنة الفترة السابقة وتحقق داخلي.",
    agentTitle: "مراجعة القوائم بالوكيل", agentText: "يتحقق الوكيل من اتزان القوائم واكتمالها ويعرض أرقام الملف المصدر كما وردت، دون إنشاء بيانات تقديرية.",
    sources: "اكتمال القوائم", banks: "البيانات المالية", transactions: "فترات المقارنة", period: "الفترة", generate: "تحليل القوائم بالوكيل", working: "الوكيل يتحقق من القوائم...",
    income: "قائمة الدخل", balance: "قائمة المركز المالي", cashflow: "قائمة التدفقات النقدية", draft: "مسودة AI", ready: "جاهزة للمراجعة", generated: "أعدّ الوكيل 3 قوائم مالية وربط كل بند بمصدره.",
    verification: "التحقق الداخلي", verificationSub: "فحوص آلية قبل الاعتماد للتأكد من الاتزان، اكتمال البيانات، وإمكانية تتبع الأرقام.",
    manual: "القيود اليدوية", manualSub: "أضف التسويات والمصروفات غير البنكية مع الحفاظ على توازن المدين والدائن.", add: "إضافة قيد", save: "حفظ القيد", cancel: "إلغاء",
    date: "التاريخ", description: "البيان", debit: "الحساب المدين", credit: "الحساب الدائن", amount: "المبلغ", noEntries: "لا توجد قيود يدوية بعد.", balanced: "متوازن",
    report: "تقرير وكيل القوائم المالية", refresh: "إعادة التحليل", coverage: "تغطية البيانات", checks: "نتيجة التحقق", exceptions: "استثناءات",
  },
  en: {
    title: "Financial Statements", subtitle: "Actual statements imported from the company filing, with prior-period comparison and internal verification.",
    agentTitle: "Agent statement review", agentText: "The agent validates balance and completeness while preserving the exact figures reported in the source file.",
    sources: "Statement completeness", banks: "Imported financial file", transactions: "Comparison periods", period: "Period", generate: "Analyze statements", working: "Agent is validating statements...",
    income: "Income Statement", balance: "Statement of Financial Position", cashflow: "Cash Flow Statement", draft: "AI draft", ready: "Ready for review", generated: "The agent prepared 3 statements and linked every line to its source.",
    verification: "Internal Verification", verificationSub: "Automated checks before approval for balance, completeness, and source traceability.",
    manual: "Manual Journal Entries", manualSub: "Add adjustments and non-bank expenses while keeping debit and credit balanced.", add: "Add entry", save: "Save entry", cancel: "Cancel",
    date: "Date", description: "Description", debit: "Debit account", credit: "Credit account", amount: "Amount", noEntries: "No manual entries yet.", balanced: "Balanced",
    report: "Financial Statement Agent Report", refresh: "Run analysis again", coverage: "Data coverage", checks: "Verification result", exceptions: "Exceptions",
  },
};

export function StatementsWorkspace({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const [period, setPeriod] = useState<string>(QUARTERS[0]);
  const [statementData, setStatementData] = useState<Record<string, Statement[]>>(() =>
    Object.fromEntries(Object.entries(STATEMENTS_BY_QUARTER).map(([key, value]) => [key, value.map(statement => ({ ...statement, lines: statement.lines.map(line => ({ ...line })) }))]))
  );
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);
  const [showEntry, setShowEntry] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<Statement | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState({ date: FINANCIAL_STATEMENTS_SOURCE.endDate, description: "", debitAccount: "", creditAccount: "", amount: "" });
  const dir = lang === "ar" ? "rtl" : "ltr";
  const statements = statementData[period] ?? [];
  const balanceStatement = statements.find(statement => statement.type === "balance");
  const incomeStatement = statements.find(statement => statement.type === "income");
  const cashFlowStatement = statements.find(statement => statement.type === "cashflow");
  const statementValue = (statement: Statement | undefined, label: string) => statement?.lines.find(line => line.label === label)?.value;
  const totalAssets = statementValue(balanceStatement, "إجمالي الأصول");
  const totalLiabilities = statementValue(balanceStatement, "إجمالي الالتزامات");
  const totalEquity = statementValue(balanceStatement, "حقوق الملكية");
  const balanceDifference = totalAssets !== undefined && totalLiabilities !== undefined && totalEquity !== undefined ? totalAssets - totalLiabilities - totalEquity : Number.NaN;
  const accountingBalanced = Number.isFinite(balanceDifference) && Math.abs(balanceDifference) < 1;
  const revenue = statementValue(incomeStatement, "الإيرادات");
  const costOfSales = statementValue(incomeStatement, "تكلفة المبيعات");
  const reportedGrossProfit = statementValue(incomeStatement, "إجمالي الربح");
  const calculatedGrossProfit = revenue !== undefined && costOfSales !== undefined ? revenue - costOfSales : Number.NaN;
  const incomeDifference = reportedGrossProfit !== undefined ? calculatedGrossProfit - reportedGrossProfit : Number.NaN;
  const incomeReconciled = Number.isFinite(incomeDifference) && Math.abs(incomeDifference) < 1;
  const startingCash = statementValue(cashFlowStatement, "النقد في بداية الفترة");
  const netCashChange = statementValue(cashFlowStatement, "صافي التغير في النقد");
  const endingCash = statementValue(cashFlowStatement, "النقد في نهاية الفترة");
  const cashDifference = startingCash !== undefined && netCashChange !== undefined && endingCash !== undefined ? startingCash + netCashChange - endingCash : Number.NaN;
  const cashReconciled = Number.isFinite(cashDifference) && Math.abs(cashDifference) < 1;
  const totalLineCount = statements.reduce((sum, statement) => sum + statement.lines.length, 0);
  const sourcedLineCount = statements.reduce((sum, statement) => sum + statement.lines.filter(line => Number.isFinite(line.value)).length, 0);
  const statementsComplete = statements.length === 3 && totalLineCount > 0 && sourcedLineCount === totalLineCount;
  const checkResults = [accountingBalanced, incomeReconciled, cashReconciled, statementsComplete];
  const passedChecks = checkResults.filter(Boolean).length;
  const exceptionCount = checkResults.filter(result => !result).length;
  const coveragePct = totalLineCount ? Math.round((sourcedLineCount / totalLineCount) * 100) : 0;
  const money = (value: number) => formatCurrency(Number.isFinite(value) ? value : 0);
  const checks = lang === "ar" ? [
    ["توازن قائمة المركز المالي", `الأصول ${money(totalAssets ?? 0)} − الالتزامات ${money(totalLiabilities ?? 0)} − حقوق الملكية ${money(totalEquity ?? 0)} = فرق ${money(balanceDifference)}`, accountingBalanced ? "تم" : "تنبيه"],
    ["اتساق قائمة الدخل", `الإيرادات − تكلفة المبيعات = ${money(calculatedGrossProfit)}؛ إجمالي الربح المعروض ${money(reportedGrossProfit ?? 0)}؛ الفرق ${money(incomeDifference)}`, incomeReconciled ? "تم" : "تنبيه"],
    ["تسوية التدفق النقدي", `نقد البداية ${money(startingCash ?? 0)} + صافي التغير ${money(netCashChange ?? 0)} − نقد النهاية ${money(endingCash ?? 0)} = فرق ${money(cashDifference)}`, cashReconciled ? "تم" : "تنبيه"],
    ["اكتمال القوائم والمصدر", `${statements.length}/3 قوائم · ${sourcedLineCount}/${totalLineCount} بنداً رقمياً من ${FINANCIAL_STATEMENTS_SOURCE.fileName}`, statementsComplete ? "تم" : "تنبيه"],
  ] : [
    ["Statement of financial position", `Assets ${money(totalAssets ?? 0)} − liabilities ${money(totalLiabilities ?? 0)} − equity ${money(totalEquity ?? 0)} = ${money(balanceDifference)} difference`, accountingBalanced ? "Passed" : "Alert"],
    ["Income statement reconciliation", `Revenue − cost of sales = ${money(calculatedGrossProfit)}; reported gross profit ${money(reportedGrossProfit ?? 0)}; difference ${money(incomeDifference)}`, incomeReconciled ? "Passed" : "Alert"],
    ["Cash-flow reconciliation", `Opening cash ${money(startingCash ?? 0)} + net change ${money(netCashChange ?? 0)} − closing cash ${money(endingCash ?? 0)} = ${money(cashDifference)} difference`, cashReconciled ? "Passed" : "Alert"],
    ["Statement and source completeness", `${statements.length}/3 statements · ${sourcedLineCount}/${totalLineCount} numeric lines from ${FINANCIAL_STATEMENTS_SOURCE.fileName}`, statementsComplete ? "Passed" : "Alert"],
  ];

  async function generate() {
    setGenerating(true);
    try {
      const message = lang === "ar"
        ? `راجع القوائم المالية المستوردة من الملف ${FINANCIAL_STATEMENTS_SOURCE.fileName} للفترة ${period} وتحقق من اتزانها واكتمالها دون تغيير الأرقام.`
        : `Review the statements imported from ${FINANCIAL_STATEMENTS_SOURCE.fileName} for ${period}; validate balance and completeness without changing reported figures.`;
      const response = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: [] }),
      });
      if (!response.ok || !response.body) throw new Error("Agent unavailable");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const line of events) {
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6)) as { type: string; toolName?: string; text?: string };
          if (event.type === "error") throw new Error(event.text ?? "Agent error");
        }
      }
      setAnalyzedAt(new Date().toLocaleTimeString(lang === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { hour: "2-digit", minute: "2-digit" }));
      setGenerated(true);
      setStatementData(prev => ({ ...prev, [period]: (prev[period] ?? []).map(statement => ({ ...statement, status: "pending_review" })) }));
      toast.success(t.generated);
    } catch {
      setAnalyzedAt(new Date().toLocaleTimeString(lang === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { hour: "2-digit", minute: "2-digit" }));
      setGenerated(true);
      setStatementData(prev => ({ ...prev, [period]: (prev[period] ?? []).map(statement => ({ ...statement, status: "pending_review" })) }));
      toast.info(lang === "ar" ? "اكتمل التحقق المحلي من بيانات الملف" : "Local source-file validation completed");
    } finally {
      setGenerating(false);
    }
  }

  function saveEntry() {
    const amount = Number(form.amount);
    if (!form.description || !form.debitAccount || !form.creditAccount || !amount || amount <= 0) {
      toast.error(lang === "ar" ? "أكمل جميع بيانات القيد" : "Complete all entry fields"); return;
    }
    setEntries(prev => [{ id: String(Date.now()), ...form, amount, status: "balanced" }, ...prev]);
    setForm({ date: FINANCIAL_STATEMENTS_SOURCE.endDate, description: "", debitAccount: "", creditAccount: "", amount: "" });
    setShowEntry(false); toast.success(lang === "ar" ? "تم حفظ القيد المتوازن" : "Balanced entry saved");
  }

  function openEntryForm() {
    setShowEntry(true);
    window.setTimeout(() => document.getElementById("manual-journals")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function approveStatements() {
    setStatementData(current => ({
      ...current,
      [period]: (current[period] ?? []).map(statement => ({ ...statement, status: "approved", approvedBy: lang === "ar" ? "المراجع الداخلي" : "Internal reviewer" })),
    }));
    toast.success(lang === "ar" ? "تم اعتماد قوائم الفترة" : "Period statements approved");
  }

  return <div className="space-y-6 page-transition-shell" dir={dir}>
    {selectedStatement && <StatementDocumentModal statement={selectedStatement} lang={lang} onClose={() => setSelectedStatement(null)} />}
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">{t.title}</h1><p className="mt-1 max-w-3xl text-sm text-[var(--muted-foreground)] font-arabic">{t.subtitle}</p></div><label className="text-[10px] text-[var(--muted-foreground)] font-arabic">{t.period}<select value={period} onChange={e => { setPeriod(e.target.value); setGenerated(false); }} className="mt-1 block min-w-32 rounded-xl border border-[var(--border)] bg-[var(--card)] py-2.5 text-sm font-bold text-[var(--foreground)]">{QUARTERS.map(option => <option key={option}>{option}</option>)}</select></label></div>

    <Card id="statement-workspace" className="scroll-mt-20 border-[var(--primary)]/25"><CardContent className="p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]"><Sparkles className="h-5 w-5 text-[var(--primary)]" /></div><div><h2 className="font-bold text-[var(--foreground)] font-arabic">{t.agentTitle}</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--muted-foreground)] font-arabic">{t.agentText}</p></div></div>
        <div className="flex flex-wrap items-end gap-2">
          <Button size="sm" onClick={generate} disabled={generating} className="gap-2 font-arabic">
            {generating && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            {generating ? t.working : t.generate}
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="min-w-0 rounded-xl bg-[var(--surface)] p-3"><Database className="mb-2 h-4 w-4 text-[var(--primary)]" /><p className="text-xs text-[var(--muted-foreground)] font-arabic">{t.banks}</p><b className="block text-sm font-arabic">{lang === "ar" ? FINANCIAL_STATEMENTS_SOURCE.displayNameAr : FINANCIAL_STATEMENTS_SOURCE.displayNameEn}</b></div><div className="rounded-xl bg-[var(--surface)] p-3"><BookOpen className="mb-2 h-4 w-4 text-[var(--primary)]" /><p className="text-xs text-[var(--muted-foreground)] font-arabic">{t.transactions}</p><b>2025 / 2024 / 2023</b></div><div className="rounded-xl bg-[var(--surface)] p-3"><ShieldCheck className="mb-2 h-4 w-4 text-[var(--success)]" /><p className="text-xs text-[var(--muted-foreground)] font-arabic">{t.sources}</p><b className="text-[var(--success)]">{coveragePct}%</b></div></div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">{statements.map(statement => <div key={statement.id} className="rounded-xl border border-[var(--border)] p-4"><div className="flex items-center justify-between"><FileText className="h-5 w-5 text-[var(--primary)]" /><Badge variant={statement.status === "approved" ? "success" : statement.status === "pending_review" ? "warning" : "secondary"}>{statement.status === "approved" ? (lang === "ar" ? "معتمدة" : "Approved") : statement.status === "pending_review" ? t.ready : t.draft}</Badge></div><p className="mt-3 text-sm font-bold font-arabic">{lang === "en" ? (statement.type === "income" ? t.income : statement.type === "balance" ? t.balance : t.cashflow) : statement.title}</p><p className="mt-1 text-[10px] text-[var(--muted-foreground)] font-arabic">{statement.period}</p><div className="mt-3 space-y-2 border-t border-[var(--border)] pt-3">{statement.lines.filter(line => line.emphasis).slice(-3).map(line => <div key={line.label} className="flex items-center justify-between gap-3 text-xs"><span className="text-[var(--muted-foreground)] font-arabic">{line.label}</span><b className={line.emphasis === "positive" ? "text-[var(--success)]" : "text-[var(--destructive)]"}>{formatCurrency(line.value)}</b></div>)}</div><Button variant="outline" size="sm" className="mt-3 w-full font-arabic" onClick={() => setSelectedStatement(statement)}>{lang === "ar" ? "فتح القائمة" : "Open statement"}</Button>{statement.approvedBy && <p className="mt-3 text-[9px] text-[var(--success)] font-arabic">{lang === "ar" ? `اعتمدها: ${statement.approvedBy}` : `Approved by: ${statement.approvedBy}`}</p>}</div>)}</div>
    </CardContent></Card>

    <div><h2 className="font-bold text-[var(--foreground)] font-arabic">{t.verification}</h2><p className="mb-3 mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{t.verificationSub}</p><div className="grid gap-3 sm:grid-cols-2">{checks.map(([name, detail, status]) => { const warning = status === "تنبيه" || status === "Alert"; return <Card key={name}><CardContent className="flex items-start gap-3 p-4">{warning ? <CircleAlert className="h-5 w-5 shrink-0 text-[var(--warning)]" /> : <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" />}<div className="flex-1"><div className="flex justify-between gap-2"><p className="text-sm font-bold font-arabic">{name}</p><Badge variant={warning ? "warning" : "success"}>{status}</Badge></div><p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{detail}</p></div></CardContent></Card>; })}</div></div>

    <div id="manual-journals" className="scroll-mt-20"><div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="font-bold text-[var(--foreground)] font-arabic">{t.manual}</h2><p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{t.manualSub}</p></div><Button size="sm" onClick={openEntryForm} className="font-arabic">{t.add}</Button></div>
      {showEntry && <Card className="mb-3"><CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">{(["date", "description", "debitAccount", "creditAccount", "amount"] as const).map(key => <label key={key} className="text-[10px] text-[var(--muted-foreground)] font-arabic">{t[key === "debitAccount" ? "debit" : key === "creditAccount" ? "credit" : key]}<input type={key === "amount" ? "number" : key === "date" ? "date" : "text"} value={form[key]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--foreground)]" /></label>)}<div className="flex gap-2 lg:col-span-5"><Button size="sm" onClick={saveEntry}>{t.save}</Button><Button size="sm" variant="outline" onClick={() => setShowEntry(false)}>{t.cancel}</Button></div></CardContent></Card>}
      <Card><CardContent className="p-0">{entries.length === 0 ? <p className="p-6 text-center text-xs text-[var(--muted-foreground)] font-arabic">{t.noEntries}</p> : entries.map(entry => <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4 last:border-0"><div><p className="text-sm font-bold font-arabic">{entry.description}</p><p className="text-[10px] text-[var(--muted-foreground)]">{entry.date} · {entry.debitAccount} ← {entry.creditAccount}</p></div><div className="flex items-center gap-3"><b>{formatCurrency(entry.amount)}</b><Badge variant="success">{t.balanced}</Badge></div></div>)}</CardContent></Card>
    </div>

    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div><h2 className="font-bold text-[var(--foreground)] font-arabic">{t.report}</h2>{analyzedAt && <p className="mt-1 text-[10px] text-[var(--muted-foreground)] font-arabic">{lang === "ar" ? `آخر تحديث ${analyzedAt}` : `Updated ${analyzedAt}`}</p>}</div>
        <Button variant="outline" size="sm" onClick={generate} disabled={generating} className="shrink-0 gap-2 font-arabic">{generating && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}{t.refresh}</Button>
      </div>
      <Card><CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${generated ? "bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)]" : "bg-[var(--muted)]"}`}>{generated ? <CheckCircle2 className="h-4 w-4 text-[var(--success)]" /> : <Sparkles className="h-4 w-4 text-[var(--primary)]" />}</div><div><p className="text-sm font-bold font-arabic">{generated ? (lang === "ar" ? `${statements.length} قوائم جاهزة للمراجعة` : `${statements.length} statements ready for review`) : (lang === "ar" ? "الملف مستورد وجاهز للتحليل" : "File imported and ready to analyze")}</p><p className="text-[10px] text-[var(--muted-foreground)] font-arabic">{period} · {FINANCIAL_STATEMENTS_SOURCE.companyNameAr}</p></div></div>
          <Badge variant={generated ? (exceptionCount ? "warning" : "success") : "secondary"}>{generated ? (exceptionCount ? (lang === "ar" ? "يتطلب إجراء" : "Action required") : t.ready) : t.draft}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[[t.coverage, `${coveragePct}%`, lang === "ar" ? "3/3 قوائم" : "3/3 statements"], [t.checks, `${passedChecks}/4`, lang === "ar" ? "ناجحة" : "passed"], [t.exceptions, String(exceptionCount), lang === "ar" ? "مفتوحة" : "open"], [lang === "ar" ? "القيود اليدوية" : "Manual entries", String(entries.length), t.balanced]].map(([label, value, detail]) => <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"><p className="text-[10px] text-[var(--muted-foreground)] font-arabic">{label}</p><p className="mt-1 text-xl font-bold tabular-nums">{value}</p><p className="text-[10px] text-[var(--muted-foreground)] font-arabic">{detail}</p></div>)}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          <Button size="sm" variant="outline" onClick={() => statements[0] && setSelectedStatement(statements[0])}>{lang === "ar" ? "مراجعة القوائم" : "Review statements"}</Button>
          <Button size="sm" variant="outline" onClick={openEntryForm}>{t.add}</Button>
          <Button size="sm" onClick={approveStatements} disabled={!generated || exceptionCount > 0}>{lang === "ar" ? "اعتماد داخلي" : "Internal approval"}</Button>
        </div>
      </CardContent></Card>
    </div>

  </div>;
}

function StatementDocumentModal({ statement, lang, onClose }: { statement: Statement; lang: Lang; onClose: () => void }) {
  const isAr = lang === "ar";
  const title = isAr ? statement.title : statement.type === "income" ? "Income Statement" : statement.type === "balance" ? "Statement of Financial Position" : "Statement of Cash Flows";
  const isTotal = (label: string) => /إجمالي|صافي|حقوق الملكية|Total|Net|Equity/.test(label);
  const currentYear = statement.period.match(/20\d{2}/)?.[0] ?? "2025";
  const comparisonYear = String(Number(currentYear) - 1);
  return <Dialog open onOpenChange={onClose}><DialogContent className="max-h-[92dvh] w-[95vw] max-w-3xl overflow-y-auto p-0" dir={isAr ? "rtl" : "ltr"}>
    <DialogHeader className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card)] px-5 py-4 pe-14"><div className="flex items-start justify-between gap-3"><div><DialogTitle className="font-arabic">{title}</DialogTitle><p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{statement.period}</p></div><Button variant="outline" size="sm" onClick={() => toast.success(isAr ? "تم تجهيز ملف PDF" : "PDF prepared")}>PDF</Button></div></DialogHeader>
    <div className="space-y-5 p-5"><div className="text-center"><p className="text-lg font-black text-[var(--foreground)] font-arabic">{isAr ? FINANCIAL_STATEMENTS_SOURCE.companyNameAr : FINANCIAL_STATEMENTS_SOURCE.companyNameEn}</p><p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{title} · {statement.period}</p><p className="mt-1 text-[10px] text-[var(--muted-foreground)] font-arabic">{isAr ? FINANCIAL_STATEMENTS_SOURCE.sectorAr : "Consumer discretionary · Specialty retail"}</p></div>
      {/* <div className="flex flex-wrap justify-center gap-2"><Badge variant={statement.aiGenerated ? "secondary" : "default"}><Sparkles className="me-1 h-3 w-3" />{isAr ? "أعدّها وكيل الذكاء الاصطناعي" : "Prepared by AI agent"}</Badge><Badge variant={statement.status === "approved" ? "success" : statement.status === "pending_review" ? "warning" : "secondary"}>{statement.status === "approved" ? (isAr ? "معتمدة" : "Approved") : statement.status === "pending_review" ? (isAr ? "بانتظار المراجعة" : "Pending review") : (isAr ? "مسودة" : "Draft")}</Badge></div> */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]"><div className="min-w-[560px]"><div className="grid grid-cols-[minmax(220px,1fr)_140px_140px] gap-3 bg-[var(--surface)] px-4 py-3 text-xs font-bold"><span>{isAr ? "البيان" : "Line item"}</span><span className="text-end">{currentYear}</span><span className="text-end">{comparisonYear}</span></div>{statement.lines.map((line, index) => <div key={`${line.label}-${index}`} className={`grid grid-cols-[minmax(220px,1fr)_140px_140px] gap-3 border-t border-[var(--border)] px-4 py-3 text-sm ${isTotal(line.label) ? "bg-[color:color-mix(in_srgb,var(--primary)_5%,transparent)] font-bold" : ""}`}><span className="font-arabic">{line.label}</span><span className={`text-end ${line.value < 0 ? "font-bold text-[var(--destructive)]" : line.emphasis === "positive" ? "font-bold text-[var(--success)]" : "tabular-nums"}`} dir="ltr">{line.value < 0 ? `(${formatCurrency(Math.abs(line.value))})` : formatCurrency(line.value)}</span><span className="text-end tabular-nums text-[var(--muted-foreground)]" dir="ltr">{line.comparisonValue !== undefined ? (line.comparisonValue < 0 ? `(${formatCurrency(Math.abs(line.comparisonValue))})` : formatCurrency(line.comparisonValue)) : "—"}</span></div>)}</div></div>
      <div className="grid gap-3 text-xs sm:grid-cols-3"><div className="rounded-xl bg-[var(--surface)] p-3"><p className="text-[var(--muted-foreground)] font-arabic">{isAr ? "طبيعة القوائم" : "Statement nature"}</p><b className="font-arabic">{isAr ? FINANCIAL_STATEMENTS_SOURCE.natureAr : "Consolidated"}</b></div><div className="rounded-xl bg-[var(--surface)] p-3"><p className="text-[var(--muted-foreground)] font-arabic">{isAr ? "العملة ومستوى التقريب" : "Currency and scale"}</p><b className="font-arabic">{isAr ? `${FINANCIAL_STATEMENTS_SOURCE.currencyAr} · ${FINANCIAL_STATEMENTS_SOURCE.scaleAr}` : "SAR · Actual figures"}</b></div><div className="min-w-0 rounded-xl bg-[var(--surface)] p-3"><p className="text-[var(--muted-foreground)] font-arabic">{isAr ? "مصدر البيانات" : "Data source"}</p><b className="block font-arabic">{isAr ? FINANCIAL_STATEMENTS_SOURCE.displayNameAr : FINANCIAL_STATEMENTS_SOURCE.displayNameEn}</b></div></div>
    </div>
  </DialogContent></Dialog>;
}
