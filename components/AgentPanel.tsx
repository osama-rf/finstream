"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Send, Bot, Loader2, RefreshCw, AlertTriangle, CheckCircle2,
  ArrowLeft, MessageSquare, BarChart2, Landmark, FileText,
  TrendingUp, TrendingDown, Upload, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import type { FinanceReport, ReportItem } from "@/lib/ai/finance-agent";

type Message = { role: "user" | "agent"; text: string; toolCalls?: string[] };
type ToolEvent = { type: "tool_start" | "tool_done" | "text" | "error"; toolName?: string; text?: string };

// ─── i18n ─────────────────────────────────────────────────────────────────────

const TOOL_NAMES = {
  ar: {
    get_financial_summary:         "قراءة الملخص المالي",
    get_unclassified_transactions: "البحث عن معاملات غير مصنفة",
    get_pending_approvals:         "مراجعة الموافقات المعلقة",
    get_statements_status:         "قراءة حالة القوائم المالية",
    get_filings_status:            "قراءة حالة الإيداعات",
    get_journal_entries:           "قراءة دفتر اليومية",
    classify_transaction:          "تصنيف معاملة بنكية",
    create_journal_entry:          "إنشاء قيد محاسبي",
    generate_income_statement:     "إنشاء قائمة دخل",
  },
  en: {
    get_financial_summary:         "Reading financial summary",
    get_unclassified_transactions: "Searching unclassified transactions",
    get_pending_approvals:         "Reviewing pending approvals",
    get_statements_status:         "Reading statements status",
    get_filings_status:            "Reading filings status",
    get_journal_entries:           "Reading journal entries",
    classify_transaction:          "Classifying bank transaction",
    create_journal_entry:          "Creating journal entry",
    generate_income_statement:     "Generating income statement",
  },
} as const;

const ATTENTION = {
  ar: {
    high:   { label: "يستلزم تدخلاً", color: "var(--destructive)", bg: "color-mix(in srgb, var(--destructive) 10%, transparent)" },
    medium: { label: "يحتاج متابعة",  color: "var(--warning)",     bg: "color-mix(in srgb, var(--warning) 10%, transparent)" },
    low:    { label: "وضع مستقر",     color: "#1F9A94",            bg: "#1F9A941a" },
  },
  en: {
    high:   { label: "Action Required", color: "var(--destructive)", bg: "color-mix(in srgb, var(--destructive) 10%, transparent)" },
    medium: { label: "Needs Attention", color: "var(--warning)",     bg: "color-mix(in srgb, var(--warning) 10%, transparent)" },
    low:    { label: "Stable",          color: "#1F9A94",            bg: "#1F9A941a" },
  },
};

const QUICK_ACTIONS = {
  ar: {
    company_admin: [
      { label: "الوضع المالي",        icon: BarChart2,    prompt: "أعطني ملخصاً شاملاً للوضع المالي للمنشأة: الأرصدة المجمّعة، الإيرادات، المصروفات، وصافي الربح من جميع البنوك." },
      { label: "التصنيف الائتماني",  icon: TrendingUp,   prompt: "حلّل المؤشرات المالية للمنشأة وأعطني تقييماً لجاهزيتها للحصول على تمويل بنكي." },
      { label: "مقارنة القطاع",       icon: BarChart2,    prompt: "قارن المؤشرات المالية للمنشأة بمتوسطات القطاع وأبرز نقاط القوة ��الضعف." },
      { label: "إنشاء قائمة مالية",  icon: FileText,     prompt: "أنشئ مسودة ق��ئمة دخل للفترة الحالية من بيانات البنوك المربوطة." },
      { label: "ربط البنوك",          icon: Landmark,     prompt: "كم عدد البنوك المربوطة حالياً؟ وهل هناك مصادر بيانات ناقصة تؤثر على دقة التقرير؟" },
      { label: "فرص التمويل",         icon: Upload,       prompt: "بناءً على المؤشرات المالي�� الحالية، ما البنوك التي يمكنني التقدم إليها للحصول على تمويل؟" },
    ],
    accountant: [
      { label: "الأرصدة المجمّعة",    icon: Landmark,     prompt: "ما الأرصدة الحالية لكل البنوك والمصادر المربوطة، وما إجمالي التدفقات النقدية هذا الشهر؟" },
      { label: "الملخص المالي",       icon: BarChart2,    prompt: "أعطني ملخصاً للإيرادات والمصروفات وصافي الربح لهذا الشهر من جميع المصادر." },
      { label: "إنشاء قائمة مالية",  icon: FileText,     prompt: "أنشئ مسودة قائمة دخل للفترة الح��لية بناءً على البيانات المت��حة." },
      { label: "تحليل التدفقات",      icon: TrendingUp,   prompt: "حلّل التدفقات النقدية للشهر الماضي وأبرز أكبر مصادر الإيراد والمصروف." },
    ],
    auditor: [
      { label: "مراجعة الم��افقات",    icon: CheckCircle2, prompt: "ما القوائم المالية التي تحتاج مراجعتي واعتمادي الآن؟" },
      { label: "التحقق من البيانات",  icon: BarChart2,    prompt: "أعطني م��خصاً شاملاً للبيانات المالية من جميع ��لمصادر للتدقيق والمراجعة." },
      { label: "التصنيف الائتم��ني",  icon: TrendingUp,   prompt: "راجع المؤشرات المالية وقيّم مدى دقة التصنيف الائتماني الحالي." },
    ],
  },
  en: {
    company_admin: [
      { label: "Financial Status",    icon: BarChart2,    prompt: "Give me a comprehensive financial overview: balance, revenue, expenses, unclassified transactions, and pending approvals." },
      { label: "AI Classify",         icon: Landmark,     prompt: "Review unclassified bank transactions and classify them automatically." },
      { label: "Generate Statement",  icon: FileText,     prompt: "Generate a draft income statement for the current month based on classified transactions." },
      { label: "Pending Approvals",   icon: CheckCircle2, prompt: "What financial statements and filings are pending approval right now?" },
      { label: "Filings Status",      icon: Upload,       prompt: "What is the status of official filings with the Ministry of Commerce and ZATCA?" },
      { label: "Journal Report",      icon: TrendingUp,   prompt: "Show me the latest journal entries and verify the debit/credit balance." },
    ],
    accountant: [
      { label: "Pending Transactions", icon: Landmark,   prompt: "What unclassified bank transactions need to be posted to accounting?" },
      { label: "Journal Entries",      icon: FileText,   prompt: "Show me the latest journal entries and verify the trial balance." },
      { label: "Generate Statement",   icon: BarChart2,  prompt: "Generate a draft income statement for the current period based on available data." },
      { label: "Financial Summary",    icon: TrendingUp, prompt: "Give me a quick financial summary: revenue, expenses, and net profit." },
    ],
    auditor: [
      { label: "Review Approvals",   icon: CheckCircle2, prompt: "What financial statements need my review and approval now?" },
      { label: "Financial Summary",  icon: BarChart2,    prompt: "Give me a comprehensive financial summary for auditing." },
      { label: "Filings Status",     icon: Upload,       prompt: "What is the status of completed and pending official filings?" },
    ],
  },
};

const PAGE_ROUTES = {
  ar: { bank: "/bank", accounting: "/accounting", statements: "/statements", approvals: "/approvals", filings: "/filings" },
  en: { bank: "/en/bank", accounting: "/en/accounting", statements: "/en/statements", approvals: "/en/approvals", filings: "/en/filings" },
};

const UI = {
  ar: {
    reportTitle:     "تقرير المنشأة اليومي",
    reportSubtitle:  "تحليل تلقائي للبيانات المجمّعة من جميع البنوك مع توصيات للتحسين",
    refresh:         "تحديث",
    assistant:       "المساعد المالي",
    loading:         "جاري تحليل البيانات المالية...",
    error:           "تعذّر تحميل التقرير.",
    retry:           "أعد المحاولة",
    actionsTitle:    "إجراءات المساعد",
    prioritiesTitle: "الأولويات",
    nextStepsTitle:  "الخطوات التالية",
    chatTitle:       "المساعد المالي الذكي",
    chatEmpty:       "اكتب سؤالاً أو اختر إجراءً من الصفحة الرئيسية",
    analyzing:       "جاري التحليل المالي...",
    inputPlaceholder:"اسأل عن الأرصدة، التصنيف الائتماني، مقارنة القطاع...",
  },
  en: {
    reportTitle:     "Daily Financial Report",
    reportSubtitle:  "Automated financial analysis with instant recommendations",
    refresh:         "Refresh",
    assistant:       "AI Assistant",
    loading:         "Analyzing financial data...",
    error:           "Failed to load report.",
    retry:           "Retry",
    actionsTitle:    "Assistant Actions",
    prioritiesTitle: "Priorities",
    nextStepsTitle:  "Next Steps",
    chatTitle:       "AI Financial Assistant",
    chatEmpty:       "Ask a question or pick an action from the dashboard",
    analyzing:       "Analyzing finances...",
    inputPlaceholder:"Ask about financial status, transactions, statements...",
  },
};

// ─── Report Cache ─────────────────────────────────────────────────────────────

// Single shared cache key — report data is language-agnostic, only display strings differ
const CACHE_KEY = "finstream-daily-report-v2";

function getCachedReport(): FinanceReport | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { date, report } = JSON.parse(raw) as { date: string; report: FinanceReport };
    return date === new Date().toISOString().slice(0, 10) ? report : null;
  } catch { return null; }
}

function setCachedReport(report: FinanceReport) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ date: new Date().toISOString().slice(0, 10), report })); } catch {}
}

function clearCachedReport() {
  // Clear both old and new cache keys
  try { localStorage.removeItem(CACHE_KEY); localStorage.removeItem("finstream-daily-report"); } catch {}
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
}

function MarkdownText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {text.split("\n").map((line, i) => {
        const t = line.trim();
        if (t === "" || t === "---") return <div key={i} className="h-1.5" />;
        if (t.startsWith("### ") || t.startsWith("## ")) return <p key={i} className="font-semibold mt-1">{renderInline(t.replace(/^#{2,3} /, ""))}</p>;
        if (t.startsWith("# ")) return <p key={i} className="font-bold mt-1">{renderInline(t.slice(2))}</p>;
        if (t.startsWith("* ") || t.startsWith("- ")) return (
          <div key={i} className="flex items-start gap-1.5 my-0.5">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
            <span>{renderInline(t.slice(2))}</span>
          </div>
        );
        return <p key={i} className="my-0.5">{renderInline(line)}</p>;
      })}
    </div>
  );
}

// ─── Action Item ──────────────────────────────────────────────────────────────

function ActionItem({ item, icon: Icon, color, routes }: {
  item: ReportItem | string;
  icon: React.ElementType;
  color: string;
  routes: Record<string, string>;
}) {
  const page = typeof item === "string" ? null : item.page;
  const href = page ? (routes[page] ?? null) : null;
  const text = typeof item === "string" ? item : item.text;

  const inner = (
    <div className={`group flex items-center gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition-all ${href ? "cursor-pointer hover:border-[#1F9A94] hover:bg-[var(--surface)]" : ""}`}>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]" style={{ backgroundColor: `${color}18` }}>
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </div>
      <p className="flex-1 text-sm text-[var(--foreground)] leading-relaxed">{text}</p>
      {href && <ArrowLeft className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform group-hover:translate-x-[-3px]" />}
    </div>
  );

  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

// ─── Report View ──────────────────────────────────────────────────────────────

function ReportView({ report, lang }: { report: FinanceReport; lang: "ar" | "en" }) {
  const attn = ATTENTION[lang][report.attention_level];
  const ui = UI[lang];
  const routes = PAGE_ROUTES[lang];

  const date = new Date(report.generated_at).toLocaleString(
    lang === "en" ? "en-GB" : "ar-SA-u-nu-latn-ca-gregory",
    { weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-base leading-relaxed text-[var(--foreground)]">{report.summary}</p>
          <p className="mt-1.5 text-sm text-[var(--muted-foreground)]" dir="ltr">{date}</p>
        </div>
        <span className="shrink-0 rounded-full px-3 py-1 text-sm font-semibold" style={{ color: attn.color, backgroundColor: attn.bg }}>
          {attn.label}
        </span>
      </div>

      {report.highlights.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {report.highlights.map((h, i) => (
            <div key={i} className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
              <p className="text-2xl font-bold tabular-nums" dir="ltr" style={{ color: h.alert ? "var(--destructive)" : "var(--foreground)" }}>{h.value}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)] leading-snug">{h.label}</p>
            </div>
          ))}
        </div>
      )}

      {report.actions_taken.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-1">{ui.actionsTitle}</p>
          <div className="space-y-1.5">
            {report.actions_taken.map((action, i) => (
              <div key={i} className="flex items-start gap-3 rounded-[10px] border border-[var(--border)] bg-[color-mix(in_srgb,#1F9A94_6%,var(--card))] px-4 py-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#1F9A94]" />
                <p className="text-sm text-[var(--foreground)] leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.priorities.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-1">{ui.prioritiesTitle}</p>
          <div className="space-y-2.5 px-1">
            {report.priorities.map((p, i) => <ActionItem key={i} item={p} icon={AlertTriangle} color="#e07b39" routes={routes} />)}
          </div>
        </div>
      )}

      {report.next_steps.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-1">{ui.nextStepsTitle}</p>
          <div className="space-y-2.5 px-1">
            {report.next_steps.map((s, i) => <ActionItem key={i} item={s} icon={ArrowLeft} color="#1F9A94" routes={routes} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Chat Modal ───────────────────────────────────────────────────────────────

function ChatModal({ open, onOpenChange, initialPrompt, onPromptConsumed, lang }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialPrompt: string;
  onPromptConsumed: () => void;
  lang: "ar" | "en";
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sentInitial = useRef(false);
  const ui = UI[lang];
  const toolNames = TOOL_NAMES[lang];
  const dir = lang === "en" ? "ltr" : "rtl";

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, currentTool]);

  useEffect(() => {
    if (open && initialPrompt && !sentInitial.current) {
      sentInitial.current = true;
      void sendMessage(initialPrompt);
      onPromptConsumed();
    }
    if (!open) sentInitial.current = false;
  }, [open, initialPrompt]); // eslint-disable-line

  useEffect(() => {
    if (open && !isLoading) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, isLoading]);

  async function sendMessage(prompt: string) {
    if (!prompt.trim() || isLoading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setIsLoading(true);
    setCurrentTool(null);

    try {
      const history = messages.map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] }));
      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, history }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const toolsUsed: string[] = [];
      let finalText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event: ToolEvent = JSON.parse(line.slice(6));
            if (event.type === "tool_start" && event.toolName) {
              const label = (toolNames as any)[event.toolName] || event.toolName;
              setCurrentTool(label);
              toolsUsed.push(label);
            } else if (event.type === "tool_done") {
              setCurrentTool(null);
            } else if (event.type === "text" && event.text) {
              finalText = event.text;
            }
          } catch {}
        }
      }

      if (finalText) setMessages((prev) => [...prev, { role: "agent", text: finalText, toolCalls: toolsUsed }]);
    } catch {
      setMessages((prev) => [...prev, { role: "agent", text: lang === "en" ? "Connection error. Please try again." : "حدث خطأ في الاتصال. حاول مرة أخرى." }]);
    } finally {
      setIsLoading(false);
      setCurrentTool(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-2xl max-h-[80vh]" dir={dir}>
        <DialogHeader className="shrink-0 border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#1F9A941a]">
              <Bot className="h-4 w-4 text-[#1F9A94]" />
            </div>
            <DialogTitle className="text-sm font-bold text-[var(--foreground)]">{ui.chatTitle}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin min-h-0">
          {messages.length === 0 && !isLoading && (
            <p className="text-center text-sm text-[var(--muted-foreground)] py-8">{ui.chatEmpty}</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[86%] rounded-[12px] px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
                  : "bg-[#1F9A94] text-white"
              }`}>
                <MarkdownText text={msg.text} className="text-sm leading-relaxed" />
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 border-t border-white/20 pt-2">
                    {msg.toolCalls.map((t, j) => (
                      <span key={j} className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white/75">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-end">
              <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1F9A94]" />
                  {currentTool ? `${currentTool}...` : ui.analyzing}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 flex items-end gap-2 border-t border-[var(--border)] px-4 py-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(input); } }}
            placeholder={ui.inputPlaceholder}
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[#1F9A94] focus:outline-none disabled:opacity-50"
            style={{ maxHeight: "100px" }}
          />
          <Button size="sm" onClick={() => void sendMessage(input)} disabled={isLoading || !input.trim()}
            className="h-9 w-9 shrink-0 rounded-[10px] p-0 bg-[#1F9A94] hover:bg-[#1a857f]">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function AgentPanel({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const lang: "ar" | "en" = pathname.startsWith("/en") ? "en" : "ar";
  const ui = UI[lang];
  const dir = lang === "en" ? "ltr" : "rtl";

  const [report, setReport] = useState<FinanceReport | null>(() => {
    if (typeof window === "undefined") return null;
    return getCachedReport();
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return getCachedReport() === null;
  });
  const [error, setError] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState("");

  const roleActions = (QUICK_ACTIONS[lang] as any)[userRole] || (QUICK_ACTIONS[lang] as any)["accountant"];

  const loadReport = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCachedReport();
      if (cached) { setReport(cached); setLoading(false); return; }
    } else {
      clearCachedReport();
    }
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/ai/agent");
      const json = await res.json();
      if (json.success && json.report) { setReport(json.report); setCachedReport(json.report); }
      else setError(true);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadReport(); }, [loadReport]);

  function openChat(prompt = "") { setPendingPrompt(prompt); setChatOpen(true); }

  return (
    <>
      <div className="rounded-[16px] border border-[var(--border)] bg-[var(--card)] overflow-hidden" dir={dir}>
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#1F9A941a]">
            <Bot className="h-4 w-4 text-[#1F9A94]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[var(--foreground)]">{ui.reportTitle}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">{ui.reportSubtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => void loadReport(true)} disabled={loading}
              className="flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:border-[#1F9A94] hover:text-[#1F9A94] disabled:opacity-40">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {ui.refresh}
            </button>
            <button onClick={() => openChat()}
              className="flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] transition-colors hover:border-[#1F9A94] hover:text-[#1F9A94]">
              <MessageSquare className="h-3 w-3" />
              {ui.assistant}
            </button>
          </div>
        </div>

        <div className="px-5 py-4">
          {loading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-4">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1F9A94]" />
                {ui.loading}
              </div>
              <div className="h-3 animate-pulse rounded-full bg-[var(--muted)] w-full" />
              <div className="h-3 animate-pulse rounded-full bg-[var(--muted)] w-4/5" />
              <div className="h-3 animate-pulse rounded-full bg-[var(--muted)] w-3/5 mb-4" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-[10px] bg-[var(--muted)]" />)}
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
              <p className="text-sm text-[var(--muted-foreground)]">
                {ui.error}{" "}
                <button onClick={() => void loadReport()} className="text-[#1F9A94] hover:underline">{ui.retry}</button>
              </p>
            </div>
          ) : report ? (
            <ReportView report={report} lang={lang} />
          ) : null}
        </div>

        <div className="border-t border-[var(--border)] px-5 py-3">
          <div className="flex flex-wrap gap-2">
            {roleActions.map((action: any) => {
              const Icon = action.icon;
              return (
                <button key={action.label} onClick={() => openChat(action.prompt)}
                  className="flex items-center gap-1.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--foreground)] transition-all hover:border-[#1F9A94] hover:text-[#1F9A94]">
                  <Icon className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ChatModal
        open={chatOpen}
        onOpenChange={setChatOpen}
        initialPrompt={pendingPrompt}
        onPromptConsumed={() => setPendingPrompt("")}
        lang={lang}
      />
    </>
  );
}
