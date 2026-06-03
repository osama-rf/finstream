"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Search, Sparkles } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { toast } from "sonner";

const journalEntries = [
  { id: "1", date: "2026-06-03", desc: "إيراد خدمات - شركة الأفق", debit: "النقدية والبنوك", credit: "إيرادات الخدمات", amount: 250000, ref: "TXN-001" },
  { id: "2", date: "2026-06-02", desc: "مصروف استضافة سحابية", debit: "مصروفات تقنية", credit: "النقدية والبنوك", amount: 3200, ref: "TXN-002" },
  { id: "3", date: "2026-06-01", desc: "رواتب موظفين يونيو", debit: "مصروفات الرواتب", credit: "النقدية والبنوك", amount: 92000, ref: "TXN-003" },
  { id: "4", date: "2026-05-30", desc: "إيراد استشارات إدارية", debit: "النقدية والبنوك", credit: "إيرادات الاستشارات", amount: 65000, ref: "TXN-005" },
  { id: "5", date: "2026-05-28", desc: "عمولة بنكية شهرية", debit: "مصروفات بنكية", credit: "النقدية والبنوك", amount: 450, ref: "TXN-007" },
  { id: "6", date: "2026-05-27", desc: "دفعة مقدمة مشروع جدة", debit: "النقدية والبنوك", credit: "الإيرادات المقدمة", amount: 120000, ref: "TXN-008" },
];

const totals = {
  totalDebit: journalEntries.reduce((s, e) => s + e.amount, 0),
  totalCredit: journalEntries.reduce((s, e) => s + e.amount, 0),
};

export default function AccountingPage() {
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState(false);

  const filtered = journalEntries.filter((e) =>
    e.desc.includes(search) || e.debit.includes(search) || e.credit.includes(search)
  );

  async function handleAutoPost() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
    toast.success("تم ترحيل 3 معاملات بنكية جديدة تلقائياً");
  }

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">دفتر اليومية</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">قيود المحاسبة المزدوجة المرحلة من البنك</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAutoPost} disabled={generating}>
            <Sparkles className="h-4 w-4" />
            {generating ? "جاري الترحيل..." : "ترحيل تلقائي بالـ AI"}
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            قيد جديد
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-1">إجمالي المدين</p>
            <p className="text-xl font-bold text-[var(--foreground)] tabular-nums" dir="ltr">{formatCurrency(totals.totalDebit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-1">إجمالي الدائن</p>
            <p className="text-xl font-bold text-[var(--foreground)] tabular-nums" dir="ltr">{formatCurrency(totals.totalCredit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-1">عدد القيود</p>
            <p className="text-xl font-bold text-[var(--primary)] tabular-nums">{journalEntries.length}</p>
            <Badge variant="success" className="mt-1 font-arabic text-[11px]">ميزان متطابق</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Journal table */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <Input placeholder="ابحث في القيود..." value={search} onChange={(e) => setSearch(e.target.value)} className="pe-10" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="pb-3 text-start text-xs font-semibold text-[var(--muted-foreground)] font-arabic">التاريخ</th>
                  <th className="pb-3 text-start text-xs font-semibold text-[var(--muted-foreground)] font-arabic">البيان</th>
                  <th className="pb-3 text-start text-xs font-semibold text-[var(--muted-foreground)] font-arabic">حـ/ مدين</th>
                  <th className="pb-3 text-start text-xs font-semibold text-[var(--muted-foreground)] font-arabic">حـ/ دائن</th>
                  <th className="pb-3 text-end text-xs font-semibold text-[var(--muted-foreground)] font-arabic">المبلغ</th>
                  <th className="pb-3 text-center text-xs font-semibold text-[var(--muted-foreground)] font-arabic">المرجع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[var(--muted)] transition-colors">
                    <td className="py-3.5 text-xs text-[var(--muted-foreground)] font-arabic">{formatDate(entry.date)}</td>
                    <td className="py-3.5">
                      <p className="text-sm text-[var(--foreground)] font-arabic">{entry.desc}</p>
                    </td>
                    <td className="py-3.5">
                      <Badge variant="default" className="font-arabic text-[11px]">{entry.debit}</Badge>
                    </td>
                    <td className="py-3.5">
                      <Badge variant="secondary" className="font-arabic text-[11px]">{entry.credit}</Badge>
                    </td>
                    <td className="py-3.5 text-end text-sm font-bold text-[var(--foreground)] tabular-nums" dir="ltr">
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="text-xs text-[var(--muted-foreground)] font-arabic" dir="ltr">{entry.ref}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--border)]">
                  <td colSpan={4} className="py-3 text-sm font-bold text-[var(--foreground)] font-arabic">المجموع</td>
                  <td className="py-3 text-end text-sm font-bold text-[var(--primary)] tabular-nums" dir="ltr">
                    {formatCurrency(totals.totalDebit)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
