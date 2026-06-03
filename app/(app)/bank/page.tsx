"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Landmark, RefreshCw, Search, Filter, Sparkles, CheckCheck } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { toast } from "sonner";

const transactions = [
  { id: "1", date: "2026-06-03", desc: "تحويل وارد - شركة الأفق للتجارة", amount: 250000, type: "credit" as const, balance: 1840000, category: "إيرادات", status: "classified" },
  { id: "2", date: "2026-06-02", desc: "سداد فاتورة استضافة سحابية", amount: -3200, type: "debit" as const, balance: 1590000, category: "مصروفات تقنية", status: "classified" },
  { id: "3", date: "2026-06-01", desc: "رواتب موظفين - يونيو", amount: -92000, type: "debit" as const, balance: 1593200, category: "رواتب", status: "classified" },
  { id: "4", date: "2026-05-31", desc: "تحويل صادر مجهول المصدر", amount: -45000, type: "debit" as const, balance: 1685200, category: null, status: "pending" },
  { id: "5", date: "2026-05-30", desc: "إيراد خدمات استشارية", amount: 65000, type: "credit" as const, balance: 1730200, category: null, status: "pending" },
  { id: "6", date: "2026-05-29", desc: "إيجار مستودع الرياض", amount: -28000, type: "debit" as const, balance: 1665200, category: null, status: "pending" },
  { id: "7", date: "2026-05-28", desc: "عمولة بنكية شهرية", amount: -450, type: "debit" as const, balance: 1693200, category: "مصروفات بنكية", status: "classified" },
  { id: "8", date: "2026-05-27", desc: "دفعة مقدمة مشروع جدة", amount: 120000, type: "credit" as const, balance: 1693650, category: "إيرادات مقدمة", status: "classified" },
];

const categories = ["إيرادات", "مصروفات تشغيلية", "رواتب", "مصروفات تقنية", "مصروفات بنكية", "إيرادات مقدمة", "أصول ثابتة", "مدفوعات متفرقة"];

export default function BankPage() {
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [classifying, setClassifying] = useState(false);

  const pending = transactions.filter((t) => t.status === "pending");
  const filtered = transactions.filter((t) =>
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSync() {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setSyncing(false);
    toast.success("تمت مزامنة 8 معاملات جديدة");
  }

  async function handleAIClassify() {
    setClassifying(true);
    await new Promise((r) => setTimeout(r, 2200));
    setClassifying(false);
    toast.success("صنّف الذكاء الاصطناعي 6 معاملات بنجاح");
  }

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">البيانات البنكية</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">مزامنة وتصنيف معاملات الحساب البنكي</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "جاري المزامنة..." : "مزامنة"}
          </Button>
          <Button size="sm" onClick={handleAIClassify} disabled={classifying}>
            <Sparkles className="h-4 w-4" />
            {classifying ? "يعمل الذكاء الاصطناعي..." : "تصنيف تلقائي بالـ AI"}
          </Button>
        </div>
      </div>

      {/* Account summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                <Landmark className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic">الرصيد الحالي</p>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums" dir="ltr">
              {formatCurrency(1840000)}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-1">IBAN: SA44 2000 0001 2345 6789 1234</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)]">
                <CheckCheck className="h-4 w-4 text-[var(--success)]" />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic">معاملات مصنفة</p>
            </div>
            <p className="text-2xl font-bold text-[var(--success)] tabular-nums">
              {transactions.filter((t) => t.status === "classified").length}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-1">من أصل {transactions.length} معاملة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--warning)_12%,transparent)]">
                <Filter className="h-4 w-4 text-[var(--warning)]" />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic">بانتظار التصنيف</p>
            </div>
            <p className="text-2xl font-bold text-[var(--warning)] tabular-nums">{pending.length}</p>
            <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-1">تحتاج مراجعة يدوية أو AI</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions table */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <Input
                placeholder="ابحث في المعاملات..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pe-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="pb-3 text-start text-xs font-semibold text-[var(--muted-foreground)] font-arabic">التاريخ</th>
                  <th className="pb-3 text-start text-xs font-semibold text-[var(--muted-foreground)] font-arabic">الوصف</th>
                  <th className="pb-3 text-start text-xs font-semibold text-[var(--muted-foreground)] font-arabic">التصنيف</th>
                  <th className="pb-3 text-end text-xs font-semibold text-[var(--muted-foreground)] font-arabic">المبلغ</th>
                  <th className="pb-3 text-end text-xs font-semibold text-[var(--muted-foreground)] font-arabic">الرصيد</th>
                  <th className="pb-3 text-center text-xs font-semibold text-[var(--muted-foreground)] font-arabic">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[var(--muted)] transition-colors">
                    <td className="py-3.5 text-xs text-[var(--muted-foreground)] font-arabic">{formatDate(tx.date)}</td>
                    <td className="py-3.5 max-w-[220px]">
                      <p className="truncate text-sm text-[var(--foreground)] font-arabic">{tx.desc}</p>
                    </td>
                    <td className="py-3.5">
                      {tx.category ? (
                        <Badge variant="secondary" className="font-arabic text-[11px]">{tx.category}</Badge>
                      ) : (
                        <select className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] px-2 py-1 text-xs text-[var(--muted-foreground)] font-arabic focus:outline-none focus:ring-1 focus:ring-[var(--ring)]">
                          <option value="">اختر تصنيف</option>
                          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="py-3.5 text-end">
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{ color: tx.amount > 0 ? "var(--success)" : "var(--destructive)" }}
                        dir="ltr"
                      >
                        {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 text-end text-sm text-[var(--foreground)] tabular-nums font-arabic" dir="ltr">
                      {formatCurrency(tx.balance)}
                    </td>
                    <td className="py-3.5 text-center">
                      <Badge variant={tx.status === "classified" ? "success" : "warning"} className="font-arabic">
                        {tx.status === "classified" ? "مصنف" : "معلق"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
