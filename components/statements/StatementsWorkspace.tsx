"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BANKS, CATEGORIZED_TRANSACTIONS, QUARTERS, STATEMENTS_BY_QUARTER } from "@/lib/mock";
import type { Statement } from "@/lib/mock/types";
import { formatCurrency } from "@/lib/utils/format";
import { BookOpen, CheckCircle2, CircleAlert, Database, Download, Eye, FileText, Plus, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Lang = "ar" | "en";
type Entry = { id: string; date: string; description: string; debitAccount: string; creditAccount: string; amount: number; status: "balanced" };

const copy = {
  ar: {
    title: "القوائم المالية", subtitle: "قوائم مالية يُعدّها وكيل الذكاء الاصطناعي من بيانات المنشأة الفعلية، مع تحقق داخلي وقيود يدوية.",
    agentTitle: "وكيل إعداد القوائم المالية", agentText: "يقرأ الوكيل معاملات البنوك، يصنّف الحركة المالية، يطابق الأرصدة، ثم يُعد مسودات القوائم للفترة المحددة.",
    sources: "مصادر جاهزة للتحليل", banks: "بنوك ومصادر متصلة", transactions: "معاملات مصنفة", period: "الفترة", generate: "إعداد القوائم بالوكيل", working: "الوكيل يحلل البيانات...",
    income: "قائمة الدخل", balance: "قائمة المركز المالي", cashflow: "قائمة التدفقات النقدية", draft: "مسودة AI", ready: "جاهزة للمراجعة", generated: "أعدّ الوكيل 3 قوائم مالية وربط كل بند بمصدره.",
    verification: "التحقق الداخلي", verificationSub: "فحوص آلية قبل الاعتماد للتأكد من الاتزان، اكتمال البيانات، وإمكانية تتبع الأرقام.",
    manual: "القيود اليدوية", manualSub: "أضف التسويات والمصروفات غير البنكية مع الحفاظ على توازن المدين والدائن.", add: "إضافة قيد", save: "حفظ القيد", cancel: "إلغاء",
    date: "التاريخ", description: "البيان", debit: "الحساب المدين", credit: "الحساب الدائن", amount: "المبلغ", noEntries: "لا توجد قيود يدوية بعد.", balanced: "متوازن",
    report: "تقرير وكيل القوائم المالية", refresh: "إعادة التحليل", reportSummary: "راجع الوكيل بيانات البنوك والمعاملات المحاسبية وحدد مدى جاهزية القوائم المالية للفترة المحددة.", coverage: "تغطية البيانات", checks: "نتيجة التحقق", exceptions: "استثناءات", priorities: "أولويات المراجعة", next: "الإجراء التالي",
  },
  en: {
    title: "Financial Statements", subtitle: "AI-agent-prepared statements from real company data, with internal verification and manual journals.",
    agentTitle: "Financial Statement Agent", agentText: "The agent reads bank transactions, classifies activity, reconciles balances, and prepares statement drafts for the selected period.",
    sources: "Sources ready for analysis", banks: "Connected banks and sources", transactions: "Categorized transactions", period: "Period", generate: "Prepare statements with agent", working: "Agent is analyzing data...",
    income: "Income Statement", balance: "Statement of Financial Position", cashflow: "Cash Flow Statement", draft: "AI draft", ready: "Ready for review", generated: "The agent prepared 3 statements and linked every line to its source.",
    verification: "Internal Verification", verificationSub: "Automated checks before approval for balance, completeness, and source traceability.",
    manual: "Manual Journal Entries", manualSub: "Add adjustments and non-bank expenses while keeping debit and credit balanced.", add: "Add entry", save: "Save entry", cancel: "Cancel",
    date: "Date", description: "Description", debit: "Debit account", credit: "Credit account", amount: "Amount", noEntries: "No manual entries yet.", balanced: "Balanced",
    report: "Financial Statement Agent Report", refresh: "Run analysis again", reportSummary: "The agent reviewed banking data and accounting transactions to assess statement readiness for the selected period.", coverage: "Data coverage", checks: "Verification result", exceptions: "Exceptions", priorities: "Review priorities", next: "Next action",
  },
};

export function StatementsWorkspace({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const [period, setPeriod] = useState("Q2 2026");
  const [statementData, setStatementData] = useState<Record<string, Statement[]>>(() =>
    Object.fromEntries(Object.entries(STATEMENTS_BY_QUARTER).map(([key, value]) => [key, value.map(statement => ({ ...statement, lines: statement.lines.map(line => ({ ...line })) }))]))
  );
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [agentResult, setAgentResult] = useState("");
  const [agentTools, setAgentTools] = useState<string[]>([]);
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);
  const [showEntry, setShowEntry] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<Statement | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState({ date: "2026-07-16", description: "", debitAccount: "", creditAccount: "", amount: "" });
  const connected = BANKS.filter(bank => bank.status === "connected");
  const disconnected = BANKS.filter(bank => bank.status === "disconnected");
  const coveragePct = Math.round((connected.length / BANKS.length) * 100);
  const exceptionCount = disconnected.length;
  const dir = lang === "ar" ? "rtl" : "ltr";
  const statements = statementData[period] ?? [];
  const balanceStatement = statements.find(statement => statement.type === "balance");
  const statementValue = (statement: Statement | undefined, label: string) => statement?.lines.find(line => line.label === label)?.value;
  const totalAssets = statementValue(balanceStatement, "إجمالي الأصول");
  const totalLiabilities = statementValue(balanceStatement, "إجمالي الالتزامات");
  const totalEquity = statementValue(balanceStatement, "حقوق الملكية");
  const accountingBalanced = totalAssets !== undefined && totalLiabilities !== undefined && totalEquity !== undefined && totalAssets === totalLiabilities + totalEquity;
  const checks = useMemo(() => lang === "ar" ? [
    ["توازن قائمة المركز المالي", accountingBalanced ? "الأصول تساوي الالتزامات وحقوق الملكية" : "القائمة غير متوازنة وتحتاج مراجعة", accountingBalanced ? "تم" : "تنبيه"],
    ["مطابقة الأرصدة البنكية", `${connected.length} من ${BANKS.length} مصادر متصلة`, disconnected.length === 0 ? "تم" : "تنبيه"],
    ["اكتمال التصنيف", `${CATEGORIZED_TRANSACTIONS.length} معاملات مرتبطة بحساباتها`, CATEGORIZED_TRANSACTIONS.length ? "تم" : "تنبيه"],
    ["اكتمال القوائم", `${statements.length} من 3 قوائم متاحة للفترة`, statements.length === 3 ? "تم" : "تنبيه"],
  ] : [
    ["Statement of financial position", accountingBalanced ? "Assets equal liabilities plus equity" : "Statement is out of balance", accountingBalanced ? "Passed" : "Alert"],
    ["Bank reconciliation", `${connected.length} of ${BANKS.length} sources connected`, disconnected.length === 0 ? "Passed" : "Alert"],
    ["Classification coverage", `${CATEGORIZED_TRANSACTIONS.length} transactions linked to accounts`, CATEGORIZED_TRANSACTIONS.length ? "Passed" : "Alert"],
    ["Statement completeness", `${statements.length} of 3 statements available`, statements.length === 3 ? "Passed" : "Alert"],
  ], [accountingBalanced, connected.length, disconnected.length, lang, statements.length]);
  const passedChecks = [accountingBalanced, disconnected.length === 0, CATEGORIZED_TRANSACTIONS.length > 0, statements.length === 3].filter(Boolean).length;

  async function generate() {
    setGenerating(true);
    try {
      const message = lang === "ar"
        ? `اقرأ بيانات البنوك المجمعة والمعاملات المالية للمنشأة، ثم استخدم أداة إنشاء القوائم المالية لإعداد قائمة الدخل وقائمة المركز المالي وقائمة التدفقات النقدية للفترة ${period}.`
        : `Read the company's aggregated banking data and financial transactions, then use the financial-statement tool to prepare the income statement, statement of financial position, and cash-flow statement for ${period}.`;
      const response = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: [] }),
      });
      if (!response.ok || !response.body) throw new Error("Agent unavailable");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalText = "";
      const tools: string[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const line of events) {
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6)) as { type: string; toolName?: string; text?: string };
          if (event.type === "tool_start" && event.toolName && !tools.includes(event.toolName)) tools.push(event.toolName);
          if (event.type === "text" && event.text) finalText = event.text;
          if (event.type === "error") throw new Error(event.text ?? "Agent error");
        }
      }
      setAgentResult(finalText);
      setAgentTools(tools);
      setAnalyzedAt(new Date().toLocaleTimeString(lang === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { hour: "2-digit", minute: "2-digit" }));
      setGenerated(true);
      setStatementData(prev => ({ ...prev, [period]: (prev[period] ?? []).map(statement => ({ ...statement, aiGenerated: true, status: "pending_review" })) }));
      toast.success(t.generated);
    } catch {
      toast.error(lang === "ar" ? "تعذّر تشغيل الوكيل. تحقق من إعدادات خدمة الذكاء الاصطناعي." : "Could not run the agent. Check the AI service configuration.");
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
    setForm({ date: "2026-07-16", description: "", debitAccount: "", creditAccount: "", amount: "" });
    setShowEntry(false); toast.success(lang === "ar" ? "تم حفظ القيد المتوازن" : "Balanced entry saved");
  }

  return <div className="space-y-6 page-transition-shell" dir={dir}>
    {selectedStatement && <StatementDocumentModal statement={selectedStatement} lang={lang} onClose={() => setSelectedStatement(null)} />}
    <div><h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">{t.title}</h1><p className="mt-1 max-w-3xl text-sm text-[var(--muted-foreground)] font-arabic">{t.subtitle}</p></div>

    <Card className="border-[var(--primary)]/25"><CardContent className="p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]"><Sparkles className="h-5 w-5 text-[var(--primary)]" /></div><div><h2 className="font-bold text-[var(--foreground)] font-arabic">{t.agentTitle}</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--muted-foreground)] font-arabic">{t.agentText}</p></div></div>
        <div className="flex flex-wrap items-end gap-2"><label className="text-[10px] text-[var(--muted-foreground)] font-arabic">{t.period}<select value={period} onChange={e => { setPeriod(e.target.value); setGenerated(false); setAgentResult(""); }} className="mt-1 block rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs">{QUARTERS.map(option => <option key={option}>{option}</option>)}</select></label><Button onClick={generate} disabled={generating} className="gap-2 font-arabic"><Sparkles className="h-4 w-4" />{generating ? t.working : t.generate}</Button></div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[var(--surface)] p-3"><Database className="mb-2 h-4 w-4 text-[var(--primary)]" /><p className="text-xs text-[var(--muted-foreground)] font-arabic">{t.banks}</p><b>{connected.length}/{BANKS.length}</b></div><div className="rounded-xl bg-[var(--surface)] p-3"><BookOpen className="mb-2 h-4 w-4 text-[var(--primary)]" /><p className="text-xs text-[var(--muted-foreground)] font-arabic">{t.transactions}</p><b>{CATEGORIZED_TRANSACTIONS.length}</b></div><div className="rounded-xl bg-[var(--surface)] p-3"><ShieldCheck className="mb-2 h-4 w-4 text-[var(--success)]" /><p className="text-xs text-[var(--muted-foreground)] font-arabic">{t.sources}</p><b className="text-[var(--success)]">{coveragePct}%</b></div></div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">{statements.map(statement => <div key={statement.id} className="rounded-xl border border-[var(--border)] p-4"><div className="flex items-center justify-between"><FileText className="h-5 w-5 text-[var(--primary)]" /><Badge variant={statement.status === "approved" ? "success" : statement.status === "pending_review" ? "warning" : "secondary"}>{statement.status === "approved" ? (lang === "ar" ? "معتمدة" : "Approved") : statement.status === "pending_review" ? t.ready : t.draft}</Badge></div><p className="mt-3 text-sm font-bold font-arabic">{lang === "en" ? (statement.type === "income" ? t.income : statement.type === "balance" ? t.balance : t.cashflow) : statement.title}</p><p className="mt-1 text-[10px] text-[var(--muted-foreground)] font-arabic">{statement.period}</p><div className="mt-3 space-y-2 border-t border-[var(--border)] pt-3">{statement.lines.filter(line => line.emphasis).slice(-3).map(line => <div key={line.label} className="flex items-center justify-between gap-3 text-xs"><span className="text-[var(--muted-foreground)] font-arabic">{line.label}</span><b className={line.emphasis === "positive" ? "text-[var(--success)]" : "text-[var(--destructive)]"}>{formatCurrency(line.value)}</b></div>)}</div><Button variant="outline" size="sm" className="mt-3 w-full gap-1 font-arabic" onClick={() => setSelectedStatement(statement)}><Eye className="h-3.5 w-3.5" />{lang === "ar" ? "فتح القائمة" : "Open statement"}</Button>{statement.approvedBy && <p className="mt-3 text-[9px] text-[var(--success)] font-arabic">{lang === "ar" ? `اعتمدها: ${statement.approvedBy}` : `Approved by: ${statement.approvedBy}`}</p>}</div>)}</div>
    </CardContent></Card>

    <div><h2 className="font-bold text-[var(--foreground)] font-arabic">{t.verification}</h2><p className="mb-3 mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{t.verificationSub}</p><div className="grid gap-3 sm:grid-cols-2">{checks.map(([name, detail, status]) => { const warning = status === "تنبيه" || status === "Alert"; return <Card key={name}><CardContent className="flex items-start gap-3 p-4">{warning ? <CircleAlert className="h-5 w-5 shrink-0 text-[var(--warning)]" /> : <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" />}<div className="flex-1"><div className="flex justify-between gap-2"><p className="text-sm font-bold font-arabic">{name}</p><Badge variant={warning ? "warning" : "success"}>{status}</Badge></div><p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{detail}</p></div></CardContent></Card>; })}</div></div>

    <div><div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="font-bold text-[var(--foreground)] font-arabic">{t.manual}</h2><p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{t.manualSub}</p></div><Button size="sm" onClick={() => setShowEntry(true)} className="gap-1 font-arabic"><Plus className="h-4 w-4" />{t.add}</Button></div>
      {showEntry && <Card className="mb-3"><CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">{(["date", "description", "debitAccount", "creditAccount", "amount"] as const).map(key => <label key={key} className="text-[10px] text-[var(--muted-foreground)] font-arabic">{t[key === "debitAccount" ? "debit" : key === "creditAccount" ? "credit" : key]}<input type={key === "amount" ? "number" : key === "date" ? "date" : "text"} value={form[key]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--foreground)]" /></label>)}<div className="flex gap-2 lg:col-span-5"><Button size="sm" onClick={saveEntry}>{t.save}</Button><Button size="sm" variant="outline" onClick={() => setShowEntry(false)}>{t.cancel}</Button></div></CardContent></Card>}
      <Card><CardContent className="p-0">{entries.length === 0 ? <p className="p-6 text-center text-xs text-[var(--muted-foreground)] font-arabic">{t.noEntries}</p> : entries.map(entry => <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4 last:border-0"><div><p className="text-sm font-bold font-arabic">{entry.description}</p><p className="text-[10px] text-[var(--muted-foreground)]">{entry.date} · {entry.debitAccount} ← {entry.creditAccount}</p></div><div className="flex items-center gap-3"><b>{formatCurrency(entry.amount)}</b><Badge variant="success">{t.balanced}</Badge></div></div>)}</CardContent></Card>
    </div>

    <div>
      <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="font-bold text-[var(--foreground)] font-arabic">{t.report}</h2><p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{t.reportSummary}</p></div><Button variant="outline" size="sm" onClick={generate} disabled={generating} className="shrink-0 gap-1 font-arabic"><RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} />{t.refresh}</Button></div>
      <Card><CardContent className="space-y-5 p-5">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--primary)]" /><p className="text-sm font-bold font-arabic">{generated ? (lang === "ar" ? `اكتمل تحليل ${period}` : `${period} analysis complete`) : (lang === "ar" ? `تحليل ${period} جاهز للتشغيل` : `${period} analysis ready to run`)}</p></div><p className="mt-2 max-w-3xl whitespace-pre-line text-xs leading-5 text-[var(--muted-foreground)] font-arabic">{agentResult || (lang === "ar" ? "شغّل الوكيل لقراءة البيانات وإعداد القوائم ثم عرض نتيجة التحقق والاستثناءات هنا." : "Run the agent to read the data, prepare statements, and show verification results and exceptions here.")}</p>{agentTools.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{agentTools.map(tool => <Badge key={tool} variant="secondary" className="text-[9px]">{tool}</Badge>)}</div>}{analyzedAt && <p className="mt-2 text-[9px] text-[var(--muted-foreground)] font-arabic">{lang === "ar" ? `آخر تحليل: ${analyzedAt}` : `Last analyzed: ${analyzedAt}`}</p>}</div><Badge variant={generated ? "success" : "secondary"}>{generated ? t.ready : t.draft}</Badge></div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl bg-[var(--surface)] p-3"><p className="text-[10px] text-[var(--muted-foreground)] font-arabic">{t.coverage}</p><p className="mt-1 text-lg font-bold text-[var(--success)]">{coveragePct}%</p><p className="text-[10px] text-[var(--muted-foreground)] font-arabic">{connected.length}/{BANKS.length} {lang === "ar" ? "مصادر متصلة" : "sources connected"}</p></div>
          <div className="rounded-xl bg-[var(--surface)] p-3"><p className="text-[10px] text-[var(--muted-foreground)] font-arabic">{t.checks}</p><p className="mt-1 text-lg font-bold text-[var(--success)]">{passedChecks}/4</p><p className="text-[10px] text-[var(--muted-foreground)] font-arabic">{lang === "ar" ? "فحوص ناجحة" : "checks passed"}</p></div>
          <div className="rounded-xl bg-[var(--surface)] p-3"><p className="text-[10px] text-[var(--muted-foreground)] font-arabic">{t.exceptions}</p><p className="mt-1 text-lg font-bold text-[var(--warning)]">{exceptionCount}</p><p className="text-[10px] text-[var(--muted-foreground)] font-arabic">{lang === "ar" ? "مصادر تحتاج متابعة" : "sources need attention"}</p></div>
          <div className="rounded-xl bg-[var(--surface)] p-3"><p className="text-[10px] text-[var(--muted-foreground)] font-arabic">{lang === "ar" ? "القيود اليدوية" : "Manual entries"}</p><p className="mt-1 text-lg font-bold">{entries.length}</p><p className="text-[10px] text-[var(--muted-foreground)] font-arabic">{t.balanced}</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2"><div><p className="mb-2 text-xs font-bold text-[var(--foreground)] font-arabic">{t.priorities}</p><div className="space-y-2">{disconnected.map(bank => <p key={bank.id} className="flex items-start gap-2 text-xs text-[var(--muted-foreground)] font-arabic"><CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--warning)]" />{lang === "ar" ? `إعادة ربط ${bank.name} قبل اعتماد اكتمال بيانات الفترة.` : `Reconnect ${bank.name} before confirming period completeness.`}</p>)}<p className="flex items-start gap-2 text-xs text-[var(--muted-foreground)] font-arabic"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--success)]" />{entries.length ? (lang === "ar" ? `مراجعة ${entries.length} من القيود اليدوية ضمن الفترة.` : `Review ${entries.length} manual entries in the period.`) : (lang === "ar" ? "لا توجد قيود يدوية معلقة للمراجعة." : "No manual entries are pending review.")}</p></div></div><div><p className="mb-2 text-xs font-bold text-[var(--foreground)] font-arabic">{t.next}</p><div className="rounded-xl border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_5%,transparent)] p-3"><p className="text-xs leading-5 text-[var(--foreground)] font-arabic">{generated ? (exceptionCount ? (lang === "ar" ? "عالج المصادر غير المتصلة ثم أعد التحليل قبل إرسال القوائم للمراجع الداخلي." : "Resolve disconnected sources and rerun analysis before internal review.") : (lang === "ar" ? "البيانات مكتملة؛ أرسل القوائم الثلاث للمراجع الداخلي." : "Data is complete; send all three statements to internal review.")) : (lang === "ar" ? "شغّل الوكيل أولاً لإعداد القوائم وتحديد الإجراء التالي." : "Run the agent first to prepare statements and determine the next action.")}</p></div></div></div>
      </CardContent></Card>
    </div>

  </div>;
}

function StatementDocumentModal({ statement, lang, onClose }: { statement: Statement; lang: Lang; onClose: () => void }) {
  const isAr = lang === "ar";
  const title = isAr ? statement.title : statement.type === "income" ? "Income Statement" : statement.type === "balance" ? "Statement of Financial Position" : "Statement of Cash Flows";
  const isTotal = (label: string) => /إجمالي|صافي|حقوق الملكية|Total|Net|Equity/.test(label);
  return <Dialog open onOpenChange={onClose}><DialogContent className="max-h-[92dvh] w-[95vw] max-w-3xl overflow-y-auto p-0" dir={isAr ? "rtl" : "ltr"}>
    <DialogHeader className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card)] px-5 py-4 pe-14"><div className="flex items-start justify-between gap-3"><div><DialogTitle className="font-arabic">{title}</DialogTitle><p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{statement.period}</p></div><Button variant="outline" size="sm" onClick={() => toast.success(isAr ? "تم تجهيز ملف PDF" : "PDF prepared")}><Download className="h-3.5 w-3.5" />PDF</Button></div></DialogHeader>
    <div className="space-y-5 p-5"><div className="text-center"><p className="text-lg font-black text-[var(--foreground)] font-arabic">{isAr ? "شركة ركائز للخدمات والاستشارات" : "Rakaez Services & Consulting"}</p><p className="mt-1 text-xs text-[var(--muted-foreground)] font-arabic">{title} · {statement.period}</p></div>
      {/* <div className="flex flex-wrap justify-center gap-2"><Badge variant={statement.aiGenerated ? "secondary" : "default"}><Sparkles className="me-1 h-3 w-3" />{isAr ? "أعدّها وكيل الذكاء الاصطناعي" : "Prepared by AI agent"}</Badge><Badge variant={statement.status === "approved" ? "success" : statement.status === "pending_review" ? "warning" : "secondary"}>{statement.status === "approved" ? (isAr ? "معتمدة" : "Approved") : statement.status === "pending_review" ? (isAr ? "بانتظار المراجعة" : "Pending review") : (isAr ? "مسودة" : "Draft")}</Badge></div> */}
      <div className="overflow-hidden rounded-xl border border-[var(--border)]"><div className="grid grid-cols-[1fr_auto] bg-[var(--surface)] px-4 py-3 text-xs font-bold"><span>{isAr ? "البيان" : "Line item"}</span><span>{isAr ? "المبلغ (ر.س)" : "Amount (SAR)"}</span></div>{statement.lines.map((line, index) => <div key={`${line.label}-${index}`} className={`grid grid-cols-[1fr_auto] gap-4 border-t border-[var(--border)] px-4 py-3 text-sm ${isTotal(line.label) ? "bg-[color:color-mix(in_srgb,var(--primary)_5%,transparent)] font-bold" : ""}`}><span className="font-arabic">{line.label}</span><span className={line.value < 0 ? "font-bold text-[var(--destructive)]" : line.emphasis === "positive" ? "font-bold text-[var(--success)]" : "tabular-nums"} dir="ltr">{line.value < 0 ? `(${formatCurrency(Math.abs(line.value))})` : formatCurrency(line.value)}</span></div>)}</div>
      <div className="grid gap-3 text-xs sm:grid-cols-3"><div className="rounded-xl bg-[var(--surface)] p-3"><p className="text-[var(--muted-foreground)] font-arabic">{isAr ? "أساس الإعداد" : "Basis"}</p><b className="font-arabic">{isAr ? "الاستحقاق المحاسبي" : "Accrual basis"}</b></div><div className="rounded-xl bg-[var(--surface)] p-3"><p className="text-[var(--muted-foreground)] font-arabic">{isAr ? "العملة" : "Currency"}</p><b>SAR</b></div><div className="rounded-xl bg-[var(--surface)] p-3"><p className="text-[var(--muted-foreground)] font-arabic">{isAr ? "مصدر البيانات" : "Data source"}</p><b className="font-arabic">{isAr ? "البنوك والقيود المربوطة" : "Connected banks & journals"}</b></div></div>
    </div>
  </DialogContent></Dialog>;
}
