"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileText, Plus, Sparkles, TrendingUp, TrendingDown,
  ArrowLeftRight, Share2, Download, Eye, CheckCircle2,
  Building2, Clock, Send, X,
  AlertTriangle, Lock, BarChart2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";
import { PillTabs } from "@/components/shared/PillTabs";
import { AgentPanel } from "@/components/AgentPanel";
import { useUser } from "@/lib/contexts/UserContext";
import { QUARTERS, PRO_FORMA, ZATCA_READINESS, AUDIT_CENTER_KPIS } from "@/lib/mock";

// ─── Data ─────────────────────────────────────────────────────────────────────

type StatementStatus = "draft" | "pending_review" | "approved" | "filed";

interface Statement {
  id: string;
  type: string;
  typeKey: string;
  period: string;
  status: StatementStatus;
  createdAt: string;
  approvedBy: string | null;
  aiGenerated: boolean;
  sharedWith: string[];
}

const initialStatements: Statement[] = [
  { id: "1", type: "قائمة الدخل",            typeKey: "income",    period: "Q1 2026 — يناير إلى مارس",   status: "approved",      createdAt: "2026-04-10", approvedBy: "خالد العمر", aiGenerated: true,  sharedWith: ["البنك الأهلي"] },
  { id: "2", type: "الميزانية العمومية",      typeKey: "balance",   period: "Q1 2026 — يناير إلى مارس",   status: "approved",      createdAt: "2026-04-10", approvedBy: "خالد العمر", aiGenerated: true,  sharedWith: [] },
  { id: "3", type: "قائمة التدفقات النقدية", typeKey: "cashflow",  period: "Q1 2026 — يناير إلى مارس",   status: "pending_review", createdAt: "2026-04-12", approvedBy: null,         aiGenerated: true,  sharedWith: [] },
  { id: "4", type: "قائمة الدخل",            typeKey: "income",    period: "Q2 2026 — أبريل إلى يونيو",  status: "draft",         createdAt: "2026-06-01", approvedBy: null,         aiGenerated: false, sharedWith: [] },
];

const statusMap: Record<StatementStatus, { label: string; variant: "secondary" | "warning" | "success" | "default" }> = {
  draft:          { label: "مسودة",              variant: "secondary" },
  pending_review: { label: "بانتظار المراجعة",   variant: "warning"   },
  approved:       { label: "معتمدة",             variant: "success"   },
  filed:          { label: "مودعة",              variant: "default"   },
};

const banks = ["البنك الأهلي السعودي", "بنك الراجحي", "مصرف الإنماء", "بنك الرياض"];

// ─── Statement content (per type) ────────────────────────────────────────────

const incomeData = {
  revenues: [
    { label: "إيرادات الخدمات",     amount: 2_250_000 },
    { label: "إيرادات الاستشارات",  amount:   597_500 },
  ],
  expenses: [
    { label: "تكلفة الخدمات",                amount: 980_000 },
    { label: "مصروفات إدارية وعمومية",        amount: 450_000 },
    { label: "رواتب وأجور",                  amount: 420_000 },
    { label: "مصروفات تسويقية",              amount:  73_200 },
  ],
};

const balanceData = {
  assets: [
    { label: "النقدية والبنوك",       amount: 2_558_700 },
    { label: "الذمم المدينة",         amount:   487_300 },
    { label: "الأصول الثابتة (صافي)", amount:   312_000 },
    { label: "أصول أخرى",             amount:    95_000 },
  ],
  liabilities: [
    { label: "الذمم الدائنة",              amount: 218_400 },
    { label: "قروض قصيرة الأجل",          amount: 350_000 },
    { label: "التزامات أخرى",             amount:  84_600 },
  ],
};

const cashflowData = {
  operating: [
    { label: "صافي الربح",                     amount:  924_300, positive: true  },
    { label: "إهلاك وإطفاء",                   amount:   48_000, positive: true  },
    { label: "تغير الذمم المدينة",             amount:  -62_400, positive: false },
    { label: "تغير الذمم الدائنة",             amount:   31_200, positive: true  },
  ],
  investing: [
    { label: "شراء أصول ثابتة",               amount: -120_000, positive: false },
    { label: "عائد استثمارات قصيرة الأجل",    amount:   18_500, positive: true  },
  ],
  financing: [
    { label: "سداد قرض بنكي",                 amount: -200_000, positive: false },
    { label: "توزيعات أرباح",                 amount: -150_000, positive: false },
  ],
};

// ─── Preview Modal ────────────────────────────────────────────────────────────

function StatementPreview({ stmt, onClose }: { stmt: Statement; onClose: () => void }) {
  const totalRevenue   = incomeData.revenues.reduce((s, r) => s + r.amount, 0);
  const totalExpenses  = incomeData.expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit      = totalRevenue - totalExpenses;
  const totalAssets    = balanceData.assets.reduce((s, a) => s + a.amount, 0);
  const totalLiab      = balanceData.liabilities.reduce((s, l) => s + l.amount, 0);
  const equity         = totalAssets - totalLiab;
  const opCF           = cashflowData.operating.reduce((s, i) => s + i.amount, 0);
  const invCF          = cashflowData.investing.reduce((s, i) => s + i.amount, 0);
  const finCF          = cashflowData.financing.reduce((s, i) => s + i.amount, 0);
  const netCF          = opCF + invCF + finCF;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90dvh] w-[95vw] max-w-2xl overflow-y-auto p-0" dir="rtl">
        <DialogHeader className="sticky top-0 z-10 flex flex-row items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-5 py-4">
          <div>
            <DialogTitle className="text-base font-bold font-arabic">{stmt.type}</DialogTitle>
            <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-0.5">{stmt.period}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="font-arabic gap-1.5"
              onClick={() => { toast.success("جاري التنزيل..."); onClose(); }}>
              <Download className="h-3.5 w-3.5" />
              PDF
            </Button>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--muted)]">
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-6">
          {/* Header info */}
          <div className="flex flex-wrap items-center gap-2">
            {stmt.aiGenerated && (
              <Badge variant="secondary" className="font-arabic gap-1">
                <Sparkles className="h-3 w-3" /> أُنشئت بالذكاء الاصطناعي
              </Badge>
            )}
            <Badge variant={statusMap[stmt.status].variant} className="font-arabic">
              {statusMap[stmt.status].label}
            </Badge>
            {stmt.approvedBy && (
              <span className="text-xs text-[var(--success)] font-arabic flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> اعتمدها: {stmt.approvedBy}
              </span>
            )}
          </div>

          {/* Income statement */}
          {stmt.typeKey === "income" && (
            <>
              <Section title="الإيرادات" icon={<TrendingUp className="h-4 w-4 text-[var(--success)]" />} color="success">
                {incomeData.revenues.map(r => <Row key={r.label} label={r.label} amount={r.amount} color="success" />)}
                <TotalRow label="إجمالي الإيرادات" amount={totalRevenue} color="success" />
              </Section>
              <Section title="المصروفات" icon={<TrendingDown className="h-4 w-4 text-[var(--destructive)]" />} color="destructive">
                {incomeData.expenses.map(e => <Row key={e.label} label={e.label} amount={e.amount} color="destructive" />)}
                <TotalRow label="إجمالي المصروفات" amount={totalExpenses} color="destructive" />
              </Section>
              <div className="rounded-[14px] border-2 border-[var(--primary)]/30 bg-[color:color-mix(in_srgb,var(--primary)_6%,transparent)] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-[var(--primary)]" />
                  <span className="font-bold text-[var(--foreground)] font-arabic">صافي الربح</span>
                </div>
                <div className="text-end">
                  <p className="text-xl font-black text-[var(--primary)] tabular-nums" dir="ltr">{formatCurrency(netProfit)}</p>
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">هامش الربح: <span className="font-bold text-[var(--primary)]">{Math.round((netProfit / totalRevenue) * 100)}%</span></p>
                </div>
              </div>
            </>
          )}

          {/* Balance sheet */}
          {stmt.typeKey === "balance" && (
            <>
              <Section title="الأصول" icon={<TrendingUp className="h-4 w-4 text-[var(--success)]" />} color="success">
                {balanceData.assets.map(a => <Row key={a.label} label={a.label} amount={a.amount} color="success" />)}
                <TotalRow label="إجمالي الأصول" amount={totalAssets} color="success" />
              </Section>
              <Section title="الالتزامات وحقوق الملكية" icon={<ArrowLeftRight className="h-4 w-4 text-[var(--primary)]" />} color="primary">
                {balanceData.liabilities.map(l => <Row key={l.label} label={l.label} amount={l.amount} color="destructive" />)}
                <TotalRow label="إجمالي الالتزامات" amount={totalLiab} color="destructive" />
                <div className="mt-2">
                  <TotalRow label="حقوق الملكية" amount={equity} color="primary" />
                </div>
              </Section>
            </>
          )}

          {/* Cash flow */}
          {stmt.typeKey === "cashflow" && (
            <>
              <Section title="التدفقات التشغيلية" icon={<TrendingUp className="h-4 w-4 text-[var(--success)]" />} color="success">
                {cashflowData.operating.map(i => <Row key={i.label} label={i.label} amount={i.amount} color={i.positive ? "success" : "destructive"} />)}
                <TotalRow label="صافي التدفق التشغيلي" amount={opCF} color="success" />
              </Section>
              <Section title="التدفقات الاستثمارية" icon={<ArrowLeftRight className="h-4 w-4 text-[var(--warning)]" />} color="warning">
                {cashflowData.investing.map(i => <Row key={i.label} label={i.label} amount={i.amount} color={i.positive ? "success" : "destructive"} />)}
                <TotalRow label="صافي التدفق الاستثماري" amount={invCF} color="warning" />
              </Section>
              <Section title="التدفقات التمويلية" icon={<Building2 className="h-4 w-4 text-[var(--primary)]" />} color="primary">
                {cashflowData.financing.map(i => <Row key={i.label} label={i.label} amount={i.amount} color={i.positive ? "success" : "destructive"} />)}
                <TotalRow label="صافي التدفق التمويلي" amount={finCF} color="primary" />
              </Section>
              <div className="rounded-[14px] border-2 border-[var(--primary)]/30 bg-[color:color-mix(in_srgb,var(--primary)_6%,transparent)] px-5 py-4 flex items-center justify-between">
                <span className="font-bold text-[var(--foreground)] font-arabic">صافي التدفق النقدي الكلي</span>
                <span className="text-xl font-black tabular-nums" style={{ color: netCF >= 0 ? "var(--success)" : "var(--destructive)" }} dir="ltr">{formatCurrency(netCF)}</span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, icon, color, children }: { title: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-bold font-arabic" style={{ color: `var(--${color})` }}>{title}</h3>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, amount, color }: { label: string; amount: number; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] bg-[var(--surface)] px-4 py-2.5">
      <span className="text-sm text-[var(--foreground)] font-arabic">{label}</span>
      <span className="text-sm font-bold tabular-nums" style={{ color: `var(--${color})` }} dir="ltr">
        {amount < 0 ? `-${formatCurrency(Math.abs(amount))}` : formatCurrency(amount)}
      </span>
    </div>
  );
}

function TotalRow({ label, amount, color }: { label: string; amount: number; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border px-4 py-3 mt-1"
      style={{ borderColor: `color-mix(in srgb, var(--${color}) 25%, transparent)`, background: `color-mix(in srgb, var(--${color}) 6%, transparent)` }}>
      <span className="text-sm font-bold text-[var(--foreground)] font-arabic">{label}</span>
      <span className="text-sm font-bold tabular-nums" style={{ color: `var(--${color})` }} dir="ltr">
        {amount < 0 ? `-${formatCurrency(Math.abs(amount))}` : formatCurrency(amount)}
      </span>
    </div>
  );
}

// ─── New Statement Modal ──────────────────────────────────────────────────────

function NewStatementModal({ onClose, onAdd }: { onClose: () => void; onAdd: (s: Statement) => void }) {
  const [type, setType] = useState("قائمة الدخل");
  const [period, setPeriod] = useState("Q2 2026");
  const [generating, setGenerating] = useState(false);

  const types = ["قائمة الدخل", "الميزانية العمومية", "قائمة التدفقات النقدية"];
  const periods = ["Q2 2026", "Q3 2025", "Q4 2025", "2025 كامل"];
  const typeKeyMap: Record<string, string> = {
    "قائمة الدخل": "income",
    "الميزانية العمومية": "balance",
    "قائمة التدفقات النقدية": "cashflow",
  };

  async function handleGenerate() {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2200));
    setGenerating(false);
    const newStmt: Statement = {
      id: String(Date.now()),
      type,
      typeKey: typeKeyMap[type],
      period: `${period} — أُنشئت بالذكاء الاصطناعي`,
      status: "draft",
      createdAt: new Date().toISOString().slice(0, 10),
      approvedBy: null,
      aiGenerated: true,
      sharedWith: [],
    };
    onAdd(newStmt);
    toast.success(`تم إنشاء ${type} لـ ${period} بالذكاء الاصطناعي`);
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md p-0" dir="rtl">
        <DialogHeader className="border-b border-[var(--border)] px-5 py-4">
          <DialogTitle className="font-arabic">إنشاء قائمة مالية جديدة</DialogTitle>
        </DialogHeader>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--muted-foreground)] font-arabic mb-2 block">نوع القائمة</label>
            <div className="space-y-2">
              {types.map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`w-full text-right rounded-[10px] border px-4 py-3 text-sm font-arabic transition-all ${
                    type === t
                      ? "border-[var(--primary)] bg-[color:color-mix(in_srgb,var(--primary)_8%,transparent)] text-[var(--primary)] font-bold"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--primary)]"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--muted-foreground)] font-arabic mb-2 block">الفترة</label>
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm font-arabic text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]">
              {periods.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="rounded-[10px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_5%,transparent)] px-4 py-3 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--muted-foreground)] font-arabic leading-relaxed">
              سيقوم الذكاء الاصطناعي بتحليل بيانات 3 بنوك مربوطة وإنشاء القائمة تلقائياً
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 font-arabic" onClick={onClose}>إلغاء</Button>
            <Button className="flex-1 font-arabic gap-2" onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  الذكاء الاصطناعي يعمل...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  إنشاء بالـ AI
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────

function ShareModal({ stmt, onClose }: { stmt: Statement; onClose: () => void }) {
  const [selectedBank, setSelectedBank] = useState(banks[0]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setTimeout(() => { onClose(); toast.success(`تم إرسال ${stmt.type} إلى ${selectedBank}`); }, 800);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-sm p-0" dir="rtl">
        <DialogHeader className="border-b border-[var(--border)] px-5 py-4">
          <DialogTitle className="font-arabic">مشاركة مع بنك</DialogTitle>
        </DialogHeader>
        <div className="p-5 space-y-4">
          <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <p className="text-xs text-[var(--muted-foreground)] font-arabic">القائمة المالية</p>
            <p className="text-sm font-bold text-[var(--foreground)] font-arabic">{stmt.type}</p>
            <p className="text-xs text-[var(--muted-foreground)] font-arabic">{stmt.period}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--muted-foreground)] font-arabic mb-2 block">اختر البنك</label>
            <div className="space-y-2">
              {banks.map(b => (
                <button key={b} onClick={() => setSelectedBank(b)}
                  className={`w-full text-right rounded-[10px] border px-4 py-2.5 text-sm font-arabic transition-all ${
                    selectedBank === b
                      ? "border-[var(--primary)] bg-[color:color-mix(in_srgb,var(--primary)_8%,transparent)] text-[var(--primary)] font-bold"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
                  }`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full font-arabic gap-2" onClick={handleSend} disabled={sending || sent}>
            {sent ? (
              <><CheckCircle2 className="h-4 w-4" /> تم الإرسال</>
            ) : sending ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> جاري الإرسال...</>
            ) : (
              <><Send className="h-4 w-4" /> إرسال القائمة</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatementsPage() {
  const { user } = useUser();
  const [stmts, setStmts] = useState<Statement[]>(initialStatements);
  const [generating, setGenerating] = useState(false);
  const [previewStmt, setPreviewStmt] = useState<Statement | null>(null);
  const [shareStmt, setShareStmt] = useState<Statement | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [quarter, setQuarter] = useState<string>(QUARTERS[0]);
  const [forecasting, setForecasting] = useState(false);
  const [forecastGenerated, setForecastGenerated] = useState(false);

  async function handleGenerateForecast() {
    setForecasting(true);
    await new Promise(r => setTimeout(r, 1800));
    setForecasting(false);
    setForecastGenerated(true);
    toast.success("تم توليد توقّع التدفقات النقدية لثلاثة أشهر قادمة");
  }

  async function handleQuickGenerate() {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2400));
    setGenerating(false);
    const newStmt: Statement = {
      id: String(Date.now()),
      type: "قائمة الدخل",
      typeKey: "income",
      period: "Q2 2026 — أبريل إلى يونيو",
      status: "draft",
      createdAt: new Date().toISOString().slice(0, 10),
      approvedBy: null,
      aiGenerated: true,
      sharedWith: [],
    };
    setStmts(prev => [newStmt, ...prev]);
    toast.success("أنشأ الذكاء الاصطناعي قائمة الدخل Q2 2026 من بيانات البنوك المربوطة");
  }

  function submitForReview(id: string) {
    setStmts(prev => prev.map(s => s.id === id ? { ...s, status: "pending_review" } : s));
    toast.success("تم إرسال القائمة للمراجعة");
  }

  function approveStatement(id: string) {
    setStmts(prev => prev.map(s => s.id === id ? { ...s, status: "approved", approvedBy: "أسامة الرفاعي" } : s));
    toast.success("تمت الموافقة على القائمة المالية");
  }

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">

      {/* Modals */}
      {previewStmt && <StatementPreview stmt={previewStmt} onClose={() => setPreviewStmt(null)} />}
      {shareStmt   && <ShareModal stmt={shareStmt} onClose={() => setShareStmt(null)} />}
      {showNew     && <NewStatementModal onClose={() => setShowNew(false)} onAdd={s => setStmts(prev => [s, ...prev])} />}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">القوائم المالية</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="font-arabic gap-2" onClick={handleQuickGenerate} disabled={generating}>
            <Sparkles className="h-4 w-4" />
            {generating ? "الذكاء الاصطناعي يعمل..." : "إنشاء بالـ AI"}
          </Button>
          <Button size="sm" className="font-arabic gap-2" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" />
            قائمة جديدة
          </Button>
        </div>
      </div>

      {/* Quarter selector */}
      <PillTabs
        options={QUARTERS.map(q => ({ key: q, label: q }))}
        value={quarter}
        onChange={setQuarter}
      />

      {/* Statements grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stmts.map(stmt => {
          const status = statusMap[stmt.status];
          return (
            <Card key={stmt.id} className="hover:border-[var(--primary)]/50 transition-colors">
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
                            <Sparkles className="h-2.5 w-2.5" />AI
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] font-arabic">{stmt.period}</p>
                    </div>
                  </div>
                  <Badge variant={status.variant} className="font-arabic shrink-0 text-[11px]">{status.label}</Badge>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">أُنشئت: {stmt.createdAt}</p>
                  {stmt.approvedBy && (
                    <p className="text-xs text-[var(--success)] font-arabic flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />اعتمدها: {stmt.approvedBy}
                    </p>
                  )}
                </div>

                {stmt.sharedWith.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Building2 className="h-3.5 w-3.5 text-[var(--success)]" />
                    <span className="text-xs text-[var(--success)] font-arabic">مشاركة مع: {stmt.sharedWith.join("، ")}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 font-arabic text-xs gap-1"
                    onClick={() => setPreviewStmt(stmt)}>
                    <Eye className="h-3 w-3" />معاينة
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                    onClick={() => toast.success("جاري التنزيل...")}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  {stmt.status === "draft" && (
                    <Button variant="secondary" size="sm" className="flex-1 font-arabic text-xs gap-1"
                      onClick={() => submitForReview(stmt.id)}>
                      <Clock className="h-3 w-3" />إرسال للمراجعة
                    </Button>
                  )}
                  {stmt.status === "pending_review" && (
                    <Button size="sm" className="flex-1 font-arabic text-xs gap-1 bg-[var(--success)] hover:opacity-90"
                      onClick={() => approveStatement(stmt.id)}>
                      <CheckCircle2 className="h-3 w-3" />اعتماد
                    </Button>
                  )}
                  {stmt.status === "approved" && (
                    <Button size="sm" className="flex-1 font-arabic text-xs gap-1"
                      onClick={() => setShareStmt(stmt)}>
                      <Send className="h-3 w-3" />مشاركة مع بنك
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Pro-forma forecast card */}
        <Card className="border-dashed">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                  <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="font-bold text-[var(--foreground)] font-arabic text-sm">قائمة تدفقات تنبؤية</p>
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">توقّع ثلاثة أشهر قادمة</p>
                </div>
              </div>
              <Badge variant="secondary" className="font-arabic shrink-0 text-[11px]">تجريبية</Badge>
            </div>
            {forecastGenerated && (
              <div className="space-y-1.5 mb-3">
                {PRO_FORMA.map(m => (
                  <div key={m.label} className="flex items-center justify-between rounded-[10px] bg-[var(--surface)] px-3 py-2">
                    <span className="text-xs text-[var(--foreground)] font-arabic">{m.label}</span>
                    <span className="text-sm font-bold text-[var(--success)] tabular-nums" dir="ltr">+{formatCurrency(m.projected)}</span>
                  </div>
                ))}
              </div>
            )}
            <Button size="sm" className="w-full font-arabic gap-2" onClick={handleGenerateForecast} disabled={forecasting}>
              {forecasting ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />جاري التوليد...</>
              ) : (
                <><Sparkles className="h-4 w-4" />{forecastGenerated ? "إعادة توليد التوقع" : "توليد التوقع"}</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ZATCA readiness */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-3">جاهزية الفوترة الإلكترونية (ZATCA)</h2>
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--foreground)] font-arabic">الفواتير المرتبطة بمنصة فاتورة</span>
              <span className="text-sm font-bold text-[var(--success)] tabular-nums">{ZATCA_READINESS.linkedInvoicesPct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--foreground)] font-arabic">فواتير تحتاج مراجعة</span>
              <span className="text-sm font-bold text-[var(--warning)] font-arabic">{ZATCA_READINESS.invoicesNeedingReviewCount} فواتير</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--foreground)] font-arabic">آخر مزامنة</span>
              <span className="text-sm font-bold text-[var(--foreground)] font-arabic">{ZATCA_READINESS.lastSyncedAt}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Internal audit center */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-3">مركز التحقق الداخلي</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {AUDIT_CENTER_KPIS.map(kpi => {
            const Icon = kpi.icon === "check" ? CheckCircle2 : kpi.icon === "warning" ? AlertTriangle : kpi.icon === "lock" ? Lock : BarChart2;
            const badgeVariant = kpi.icon === "check" ? "success" : kpi.icon === "warning" ? "warning" : kpi.icon === "lock" ? "default" : "secondary";
            return (
              <Card key={kpi.key}>
                <CardContent className="p-3 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-4 w-4 text-[var(--primary)]" />
                    <Badge variant={badgeVariant} className="font-arabic text-[10px]">{kpi.badge}</Badge>
                  </div>
                  <p className="text-lg font-bold text-[var(--foreground)] font-arabic tabular-nums sm:text-xl">{kpi.value}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] font-arabic mt-1 sm:text-xs leading-snug">{kpi.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* AI financial assistant */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-3">المساعد المالي الذكي</h2>
        <AgentPanel userRole={user?.role ?? "company_admin"} />
      </div>
    </div>
  );
}
