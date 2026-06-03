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
  { id:"1", date:"2026-06-03", desc:"Incoming — Al-Naakheel Trading Co.",       amount: 250000,  type:"credit" as const, balance:1840000, category:"Service Revenue",      status:"classified" },
  { id:"2", date:"2026-06-02", desc:"Cloud hosting — AWS",                       amount: -3200,   type:"debit"  as const, balance:1590000, category:"Tech Expenses",        status:"classified" },
  { id:"3", date:"2026-06-01", desc:"Staff salaries — June 2026",               amount: -92000,  type:"debit"  as const, balance:1593200, category:"Salaries",             status:"classified" },
  { id:"4", date:"2026-05-31", desc:"Outgoing transfer — unknown source",        amount: -45000,  type:"debit"  as const, balance:1685200, category:null,                   status:"pending" },
  { id:"5", date:"2026-05-30", desc:"Consulting revenue — Al-Fajr Co.",          amount: 65000,   type:"credit" as const, balance:1730200, category:null,                   status:"pending" },
  { id:"6", date:"2026-05-29", desc:"Warehouse rent — Riyadh, May 2026",         amount: -28000,  type:"debit"  as const, balance:1665200, category:null,                   status:"pending" },
  { id:"7", date:"2026-05-28", desc:"Monthly bank commission",                   amount: -450,    type:"debit"  as const, balance:1693200, category:"Bank Fees",            status:"classified" },
  { id:"8", date:"2026-05-27", desc:"Advance payment — Jeddah project",          amount: 120000,  type:"credit" as const, balance:1693650, category:"Deferred Revenue",     status:"classified" },
];

const categories = ["Service Revenue","Project Revenue","Consulting Revenue","Salaries","Admin Expenses","Tech Expenses","Bank Fees","Deferred Revenue","Fixed Assets"];

export default function BankEnPage() {
  const [search, setSearch] = useState("");
  const [syncing, setSyncing]     = useState(false);
  const [classifying, setClassifying] = useState(false);

  const filtered = transactions.filter((t) => t.desc.toLowerCase().includes(search.toLowerCase()));

  async function handleSync() {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setSyncing(false);
    toast.success("Synced 8 new transactions");
  }

  async function handleAIClassify() {
    setClassifying(true);
    await new Promise((r) => setTimeout(r, 2200));
    setClassifying(false);
    toast.success("AI classified 6 transactions successfully");
  }

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Bank Data</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Sync and classify bank account transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync"}
          </Button>
          <Button size="sm" onClick={handleAIClassify} disabled={classifying}>
            <Sparkles className="h-4 w-4" />
            {classifying ? "AI working..." : "AI Auto-classify"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
              <Landmark className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">Current Balance</p>
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums">{formatCurrency(1840000)}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">IBAN: SA44 2000 0001 2345 6789 1234</p>
        </CardContent></Card>

        <Card><CardContent className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)]">
              <CheckCheck className="h-4 w-4 text-[var(--success)]" />
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">Classified</p>
          </div>
          <p className="text-2xl font-bold text-[var(--success)] tabular-nums">{transactions.filter(t=>t.status==="classified").length}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">of {transactions.length} transactions</p>
        </CardContent></Card>

        <Card><CardContent className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--warning)_12%,transparent)]">
              <Filter className="h-4 w-4 text-[var(--warning)]" />
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">Pending Classification</p>
          </div>
          <p className="text-2xl font-bold text-[var(--warning)] tabular-nums">{transactions.filter(t=>t.status==="pending").length}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Needs manual or AI review</p>
        </CardContent></Card>
      </div>

      <Card><CardContent className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="ps-10" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["Date","Description","Category","Amount","Balance","Status"].map((h) => (
                  <th key={h} className={`pb-3 text-xs font-semibold text-[var(--muted-foreground)] ${h==="Amount"||h==="Balance" ? "text-end" : h==="Status" ? "text-center" : "text-start"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-[var(--muted)] transition-colors">
                  <td className="py-3.5 text-xs text-[var(--muted-foreground)]">{formatDate(tx.date)}</td>
                  <td className="py-3.5 max-w-[220px]"><p className="truncate text-sm text-[var(--foreground)]">{tx.desc}</p></td>
                  <td className="py-3.5">
                    {tx.category
                      ? <Badge variant="secondary" className="text-[11px]">{tx.category}</Badge>
                      : <select className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] px-2 py-1 text-xs text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]">
                          <option value="">Select category</option>
                          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    }
                  </td>
                  <td className="py-3.5 text-end">
                    <span className="text-sm font-bold tabular-nums" style={{ color: tx.amount > 0 ? "var(--success)" : "var(--destructive)" }}>
                      {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="py-3.5 text-end text-sm text-[var(--foreground)] tabular-nums">{formatCurrency(tx.balance)}</td>
                  <td className="py-3.5 text-center">
                    <Badge variant={tx.status === "classified" ? "success" : "warning"}>
                      {tx.status === "classified" ? "Classified" : "Pending"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>
    </div>
  );
}
