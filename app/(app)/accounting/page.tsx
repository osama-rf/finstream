"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { toast } from "sonner";

export default function AccountingPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase.from("users").select("company_id").eq("id", user.id).single() as { data: any };
      if (!profile?.company_id) { setLoading(false); return; }
      const { data } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("entry_date", { ascending: false });
      setEntries(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = entries.filter((e) =>
    e.description?.toLowerCase().includes(search.toLowerCase()) ||
    e.debit_account?.toLowerCase().includes(search.toLowerCase())
  );

  const totalDebit = entries.reduce((s, e) => s + Number(e.amount), 0);
  const totalCredit = entries.reduce((s, e) => s + Number(e.amount), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  const aiCount = entries.filter((e) => e.auto_generated).length;

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">دفتر الأستاذ العام</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">القيود المحاسبية المزدوجة المُنشأة تلقائياً بوكيل الذكاء الاصطناعي</p>
        </div>
        <Button size="sm" className="font-arabic gap-2">
          <Plus className="h-4 w-4" />
          قيد جديد
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5">
          <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-1">إجمالي المدين</p>
          <p className="text-xl font-bold text-[var(--foreground)] tabular-nums" dir="ltr">
            {loading ? "—" : formatCurrency(totalDebit)}
          </p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-1">إجمالي الدائن</p>
          <p className="text-xl font-bold text-[var(--foreground)] tabular-nums" dir="ltr">
            {loading ? "—" : formatCurrency(totalCredit)}
          </p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-1">عدد القيود</p>
          <p className="text-xl font-bold text-[var(--primary)] tabular-nums">{loading ? "—" : entries.length}</p>
          {!loading && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isBalanced ? "success" : "destructive"} className="font-arabic text-[11px]">
                {isBalanced ? "ميزان متطابق" : "ميزان غير متطابق"}
              </Badge>
              {aiCount > 0 && (
                <Badge variant="default" className="font-arabic text-[10px]">{aiCount} بالذكاء الاصطناعي</Badge>
              )}
            </div>
          )}
        </CardContent></Card>
      </div>

      {/* Table */}
      <Card><CardContent className="p-5">
        <div className="mb-4 relative">
          <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input placeholder="ابحث في القيود..." value={search} onChange={(e) => setSearch(e.target.value)} className="pe-10" />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-[10px] bg-[var(--muted)]" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <p className="text-sm text-[var(--muted-foreground)] font-arabic">لا توجد قيود بعد</p>
            <p className="text-xs text-[var(--muted-foreground)] font-arabic">ابدأ بتصنيف المعاملات البنكية لإنشاء القيود تلقائياً</p>
            <Link href="/bank">
              <Button size="sm" variant="outline" className="font-arabic">الذهاب للبيانات البنكية</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["التاريخ", "البيان", "حـ/ مدين", "حـ/ دائن", "المبلغ", "المصدر"].map((h) => (
                    <th key={h} className={`pb-3 text-xs font-semibold text-[var(--muted-foreground)] font-arabic ${h === "المبلغ" ? "text-end" : h === "المصدر" ? "text-center" : "text-start"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((e: any) => (
                  <tr key={e.id} className="hover:bg-[var(--muted)] transition-colors">
                    <td className="py-3 text-xs text-[var(--muted-foreground)] font-arabic whitespace-nowrap">{formatDate(e.entry_date)}</td>
                    <td className="py-3 max-w-[200px]">
                      <p className="truncate text-sm text-[var(--foreground)] font-arabic">{e.description}</p>
                    </td>
                    <td className="py-3"><Badge variant="default" className="font-arabic text-[11px]">{e.debit_account}</Badge></td>
                    <td className="py-3"><Badge variant="secondary" className="font-arabic text-[11px]">{e.credit_account}</Badge></td>
                    <td className="py-3 text-end text-sm font-bold text-[var(--foreground)] tabular-nums" dir="ltr">
                      {formatCurrency(e.amount)}
                    </td>
                    <td className="py-3 text-center">
                      {e.auto_generated
                        ? <Badge variant="default" className="font-arabic text-[10px]">وكيل الذكاء الاصطناعي</Badge>
                        : <Badge variant="secondary" className="font-arabic text-[10px]">يدوي</Badge>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--border)]">
                  <td colSpan={4} className="py-3 text-sm font-bold text-[var(--foreground)] font-arabic">المجموع</td>
                  <td className="py-3 text-end text-sm font-bold text-[var(--primary)] tabular-nums" dir="ltr">{formatCurrency(totalDebit)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent></Card>

      {/* CTA to statements */}
      {!loading && entries.length > 0 && isBalanced && (
        <div className="rounded-[16px] border border-[color:color-mix(in_srgb,var(--success)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--success)_5%,transparent)] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--foreground)] font-arabic">الميزان متطابق — الوكيل الذكي جاهز لإنشاء القوائم المالية</p>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic">تم ترحيل جميع المعاملات المصنفة بنجاح</p>
            </div>
            <Link href="/statements">
              <Button size="sm" className="font-arabic shrink-0">إنشاء القوائم المالية</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
