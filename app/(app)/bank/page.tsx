"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AIClassificationFeed } from "@/components/AIClassificationFeed";
import {
  Landmark, RefreshCw, Search, Bot, CheckCheck, AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { toast } from "sonner";

type PageState = "no_connection" | "connected_idle" | "classifying" | "classification_done";

const BANK_BADGES = ["بنك الراجحي", "البنك الأهلي السعودي", "بنك الرياض", "بنك ساب", "البنك العربي الوطني", "بنك الإنماء"];

const CATEGORIES = ["إيرادات الخدمات", "إيرادات المشاريع", "رواتب وأجور", "مصروفات تشغيلية", "مصروفات تقنية", "مصروفات إدارية", "مصروفات إيجار", "مصروفات بنكية", "أصول ثابتة"];

function BankPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isConnected = searchParams.get("connected") === "true";

  const [pageState, setPageState] = useState<PageState>(isConnected ? "connected_idle" : "no_connection");
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "classified" | "unclassified">("all");

  // Load transactions if connected
  useEffect(() => {
    if (isConnected || pageState === "connected_idle") {
      fetchTransactions();
    }
  }, []); // eslint-disable-line

  async function fetchTransactions() {
    const res = await fetch("/api/openbanking/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consentId: "MOCK-CONSENT-001" }) });
    const json = await res.json();
    if (json.success) {
      setTransactions(json.data.transactions || []);
      setBalance(json.data.balance || 0);
      setLastSync(new Date().toISOString());
    }
  }

  async function handleConnect() {
    setConnecting(true);
    try {
      const res = await fetch("/api/openbanking/connect", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        router.push(json.data.bankRedirectUrl || "/bank/connecting");
      } else {
        toast.error(json.error || "فشل الاتصال");
        setConnecting(false);
      }
    } catch {
      toast.error("حدث خطأ أثناء الاتصال");
      setConnecting(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/openbanking/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consentId: "MOCK-CONSENT-001" }) });
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data.transactions || []);
        setBalance(json.data.balance || 0);
        setLastSync(new Date().toISOString());
        toast.success(`تمت المزامنة — ${json.data.synced} معاملة جديدة`);
      }
    } catch {
      toast.error("فشلت المزامنة");
    } finally {
      setSyncing(false);
    }
  }

  function handleClassifyComplete(result: { classified: number; journalEntries: number }) {
    setPageState("classification_done");
    fetchTransactions();
    toast.success(`صُنّفت ${result.classified} معاملة — أُنشئت ${result.journalEntries} قيد محاسبي`);
  }

  const unclassified = transactions.filter((t) => !t.is_reconciled);

  const filtered = transactions.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "classified" && t.is_reconciled) || (filter === "unclassified" && !t.is_reconciled);
    return matchSearch && matchFilter;
  });

  // ── No connection state ────────────────────────────────────────────────────
  if (pageState === "no_connection") {
    return (
      <div className="space-y-6 page-transition-shell" dir="rtl">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">البيانات البنكية</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">اربط حسابك البنكي عبر Open Banking لبدء التصنيف التلقائي</p>
        </div>

        <Card>
          <CardContent className="p-10">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)] border border-[color:color-mix(in_srgb,var(--primary)_20%,transparent)]">
                <Landmark className="h-10 w-10 text-[var(--primary)]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[var(--foreground)] font-arabic">ربط حسابك البنكي</h2>
                <p className="text-sm text-[var(--muted-foreground)] font-arabic max-w-sm">
                  اربط حسابك البنكي بأمان عبر واجهة Open Banking المعتمدة — يجلب وكيل الذكاء الاصطناعي معاملاتك ويصنفها تلقائياً
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {BANK_BADGES.map((bank) => (
                  <Badge key={bank} variant="outline" className="font-arabic">{bank}</Badge>
                ))}
              </div>

              <Button size="lg" className="font-arabic gap-2 min-w-[200px]" onClick={handleConnect} disabled={connecting}>
                <Landmark className="h-4 w-4" />
                {connecting ? "جاري الاتصال..." : "ربط الحساب البنكي"}
              </Button>

              <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                اتصال آمن مشفر — Open Banking API معتمد من ساما
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Connected state ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">البيانات البنكية</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">مزامنة وتصنيف معاملات الحساب البنكي</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="font-arabic gap-2">
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "جاري المزامنة..." : "مزامنة"}
        </Button>
      </div>

      {/* Account card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                <Landmark className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-bold text-[var(--foreground)] font-arabic">بنك الراجحي</p>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic" dir="ltr">IBAN: SA44 2000 0001 2345 6789 1234</p>
                {lastSync && (
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                    آخر مزامنة: {formatDate(lastSync)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-end">
                <p className="text-xs text-[var(--muted-foreground)] font-arabic">الرصيد الحالي</p>
                <p className="text-xl font-black text-[var(--primary)] tabular-nums" dir="ltr">
                  {formatCurrency(balance || 1840000)}
                </p>
              </div>
              <Badge variant="success" className="font-arabic">نشط</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Agent trigger banner */}
      {pageState === "connected_idle" && unclassified.length > 0 && (
        <div className="rounded-[16px] border border-[color:color-mix(in_srgb,var(--warning)_25%,transparent)] bg-[color:color-mix(in_srgb,var(--warning)_6%,transparent)] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[color:color-mix(in_srgb,var(--warning)_14%,transparent)]">
                <AlertCircle className="h-4 w-4 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--foreground)] font-arabic">
                  {unclassified.length} معاملة بنكية بانتظار التصنيف
                </p>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                  وكيل الذكاء الاصطناعي جاهز لتصنيفها وإنشاء القيود المحاسبية تلقائياً
                </p>
              </div>
            </div>
            <Button size="sm" className="shrink-0 font-arabic gap-2" onClick={() => setPageState("classifying")}>
              <Bot className="h-4 w-4" />
              تشغيل وكيل الذكاء الاصطناعي
            </Button>
          </div>
        </div>
      )}

      {/* AI Classification Feed */}
      {(pageState === "classifying" || pageState === "classification_done") && (
        <AIClassificationFeed
          onComplete={handleClassifyComplete}
          onClose={() => setPageState("connected_idle")}
        />
      )}

      {/* All classified banner */}
      {pageState === "connected_idle" && unclassified.length === 0 && transactions.length > 0 && (
        <div className="rounded-[16px] border border-[color:color-mix(in_srgb,var(--success)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--success)_5%,transparent)] px-5 py-4">
          <div className="flex items-center gap-3">
            <CheckCheck className="h-5 w-5 text-[var(--success)] shrink-0" />
            <p className="text-sm font-bold text-[var(--foreground)] font-arabic">
              جميع المعاملات مصنفة — وكيل الذكاء الاصطناعي أتم عمله بنجاح
            </p>
          </div>
        </div>
      )}

      {/* Transactions table */}
      {transactions.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-1 rounded-[10px] border border-[var(--border)] bg-[var(--muted)] p-1 w-fit">
                {(["all", "classified", "unclassified"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-[8px] px-3 py-1.5 text-xs font-medium font-arabic transition-all ${
                      filter === f
                        ? "bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow-soft)]"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {f === "all" ? "الكل" : f === "classified" ? "مصنف" : "غير مصنف"}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <Input
                  placeholder="ابحث في المعاملات..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pe-10 h-9 text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {["التاريخ", "الوصف", "التصنيف", "المبلغ", "الحالة"].map((h) => (
                      <th key={h} className={`pb-3 text-xs font-semibold text-[var(--muted-foreground)] font-arabic ${h === "المبلغ" ? "text-end" : h === "الحالة" ? "text-center" : "text-start"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-[var(--muted)] transition-colors">
                      <td className="py-3 text-xs text-[var(--muted-foreground)] font-arabic whitespace-nowrap">
                        {formatDate(tx.transaction_date)}
                      </td>
                      <td className="py-3 max-w-[200px]">
                        <p className="truncate text-sm text-[var(--foreground)] font-arabic">{tx.description}</p>
                      </td>
                      <td className="py-3">
                        {tx.category ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="success" className="font-arabic text-[11px]">{tx.category}</Badge>
                          </div>
                        ) : (
                          <select className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] px-2 py-1 text-xs text-[var(--muted-foreground)] font-arabic focus:outline-none focus:ring-1 focus:ring-[var(--ring)]">
                            <option value="">اختر تصنيف</option>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="py-3 text-end">
                        <span
                          className="text-sm font-bold tabular-nums"
                          style={{ color: tx.type === "credit" ? "var(--success)" : "var(--destructive)" }}
                          dir="ltr"
                        >
                          {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant={tx.is_reconciled ? "success" : "warning"} className="font-arabic">
                            {tx.is_reconciled ? "مصنف" : "معلق"}
                          </Badge>
                          {tx.classified_by_ai && (
                            <span className="text-[10px] text-[var(--muted-foreground)] font-arabic">بالذكاء الاصطناعي</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function BankPage() {
  return (
    <Suspense>
      <BankPageContent />
    </Suspense>
  );
}
