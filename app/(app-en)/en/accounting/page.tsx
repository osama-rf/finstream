"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Sparkles } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { toast } from "sonner";

const entries = [
  { id:"1", date:"2026-06-03", desc:"Service revenue — Al-Naakheel",        debit:"Cash & Bank",       credit:"Service Revenue",    amount:250000, ref:"TXN-001" },
  { id:"2", date:"2026-06-02", desc:"Cloud hosting expense",                 debit:"Tech Expenses",     credit:"Cash & Bank",        amount:3200,   ref:"TXN-002" },
  { id:"3", date:"2026-06-01", desc:"Staff salaries — June 2026",           debit:"Salaries Expense",  credit:"Cash & Bank",        amount:92000,  ref:"TXN-003" },
  { id:"4", date:"2026-05-30", desc:"Consulting revenue — Al-Fajr",          debit:"Cash & Bank",       credit:"Consulting Revenue", amount:65000,  ref:"TXN-005" },
  { id:"5", date:"2026-05-28", desc:"Monthly bank commission",               debit:"Bank Fees",         credit:"Cash & Bank",        amount:450,    ref:"TXN-007" },
  { id:"6", date:"2026-05-27", desc:"Advance payment — Jeddah project",      debit:"Cash & Bank",       credit:"Deferred Revenue",   amount:120000, ref:"TXN-008" },
];

const total = entries.reduce((s, e) => s + e.amount, 0);

export default function AccountingEnPage() {
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState(false);
  const filtered = entries.filter((e) => e.desc.toLowerCase().includes(search.toLowerCase()) || e.debit.toLowerCase().includes(search.toLowerCase()));

  async function handleAutoPost() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
    toast.success("AI posted 3 new bank transactions automatically");
  }

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Journal</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Double-entry journal entries posted from bank transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAutoPost} disabled={generating}>
            <Sparkles className="h-4 w-4" />
            {generating ? "AI posting..." : "AI Auto-post"}
          </Button>
          <Button size="sm"><Plus className="h-4 w-4" />New Entry</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label:"Total Debit",   value:total,             color:"var(--foreground)" },
          { label:"Total Credit",  value:total,             color:"var(--foreground)" },
          { label:"Entries",       value:entries.length,    color:"var(--primary)", isCurrency:false },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-5">
            <p className="text-xs text-[var(--muted-foreground)] mb-1">{s.label}</p>
            <p className="text-xl font-bold tabular-nums" style={{ color: s.color }}>
              {s.isCurrency === false ? s.value : formatCurrency(s.value as number)}
            </p>
            {s.label === "Entries" && <Badge variant="success" className="mt-1 text-[11px]">Balanced</Badge>}
          </CardContent></Card>
        ))}
      </div>

      <Card><CardContent className="p-5">
        <div className="mb-4 relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)} className="ps-10" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["Date","Description","Dr. Account","Cr. Account","Amount","Ref"].map((h) => (
                  <th key={h} className={`pb-3 text-xs font-semibold text-[var(--muted-foreground)] ${h==="Amount" ? "text-end" : h==="Ref" ? "text-center" : "text-start"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-[var(--muted)] transition-colors">
                  <td className="py-3.5 text-xs text-[var(--muted-foreground)]">{formatDate(e.date)}</td>
                  <td className="py-3.5 text-sm text-[var(--foreground)]">{e.desc}</td>
                  <td className="py-3.5"><Badge variant="default" className="text-[11px]">{e.debit}</Badge></td>
                  <td className="py-3.5"><Badge variant="secondary" className="text-[11px]">{e.credit}</Badge></td>
                  <td className="py-3.5 text-end text-sm font-bold text-[var(--foreground)] tabular-nums">{formatCurrency(e.amount)}</td>
                  <td className="py-3.5 text-center text-xs text-[var(--muted-foreground)]">{e.ref}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--border)]">
                <td colSpan={4} className="py-3 text-sm font-bold text-[var(--foreground)]">Total</td>
                <td className="py-3 text-end text-sm font-bold text-[var(--primary)] tabular-nums">{formatCurrency(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent></Card>
    </div>
  );
}
