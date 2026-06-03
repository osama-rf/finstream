"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Sparkles, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";

const statements = [
  { id:"1", type:"Income Statement",    period:"Q1 2026 — Jan to Mar", status:"approved",       createdAt:"2026-04-10", approvedBy:"Khalid Al-Omar" },
  { id:"2", type:"Balance Sheet",       period:"Q1 2026 — Jan to Mar", status:"approved",       createdAt:"2026-04-10", approvedBy:"Khalid Al-Omar" },
  { id:"3", type:"Cash Flow Statement", period:"Q1 2026 — Jan to Mar", status:"pending_review", createdAt:"2026-04-12", approvedBy:null },
  { id:"4", type:"Income Statement",    period:"Q2 2026 — Apr to Jun", status:"draft",          createdAt:"2026-06-01", approvedBy:null },
];

const statusMap: Record<string, { label:string; variant:any }> = {
  draft:          { label:"Draft",          variant:"secondary" },
  pending_review: { label:"Under Review",   variant:"warning" },
  approved:       { label:"Approved",       variant:"success" },
  filed:          { label:"Filed",          variant:"default" },
};

const revenues = [{ label:"Service Revenue",    amount:1450000 },{ label:"Project Revenue",  amount:680000 },{ label:"Consulting Revenue",amount:320000 }];
const expenses = [{ label:"Salaries",           amount:276000  },{ label:"Cost of Services", amount:420000 },{ label:"Admin & General",   amount:180000 },{ label:"Tech Expenses",    amount:64000 }];
const totalRevenue  = revenues.reduce((s,r) => s+r.amount, 0);
const totalExpenses = expenses.reduce((s,e) => s+e.amount, 0);
const netProfit     = totalRevenue - totalExpenses;

export default function StatementsEnPage() {
  const [activeTab, setActiveTab] = useState<"list"|"income">("list");
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2400));
    setGenerating(false);
    toast.success("AI generated Q2 2026 income statement");
  }

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Financial Statements</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Generate and review periodic financial statements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
            <Sparkles className="h-4 w-4" />
            {generating ? "AI working..." : "AI Generate"}
          </Button>
          <Button size="sm"><Plus className="h-4 w-4" />New Statement</Button>
        </div>
      </div>

      <div className="flex gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--muted)] p-1 w-fit">
        {[{key:"list",label:"Statements"},{key:"income",label:"Income Statement"}].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`rounded-[10px] px-4 py-2 text-sm font-medium transition-all ${activeTab===tab.key ? "bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow-soft)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "list" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {statements.map((stmt) => {
            const s = statusMap[stmt.status];
            return (
              <Card key={stmt.id} className="cursor-pointer hover:border-[var(--primary)] transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                        <FileText className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--foreground)] text-sm">{stmt.type}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{stmt.period}</p>
                      </div>
                    </div>
                    <Badge variant={s.variant} className="shrink-0">{s.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--muted-foreground)]">Created: {stmt.createdAt}</p>
                    {stmt.approvedBy && <p className="text-xs text-[var(--success)]">Approved by: {stmt.approvedBy}</p>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">Preview</Button>
                    {stmt.status === "approved" && <Button size="sm" className="flex-1 text-xs">Submit Filing</Button>}
                    {stmt.status === "draft"    && <Button variant="secondary" size="sm" className="flex-1 text-xs">Send for Review</Button>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card><CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">Income Statement</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Q1 2026 — January to March</p>
            </div>
            <Badge variant="success">Approved</Badge>
          </div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-4 w-4 text-[var(--success)]" /><h3 className="text-sm font-bold text-[var(--success)]">Revenues</h3></div>
            <div className="space-y-2">
              {revenues.map((r) => (
                <div key={r.label} className="flex items-center justify-between rounded-[10px] bg-[var(--surface)] px-4 py-3">
                  <span className="text-sm text-[var(--foreground)]">{r.label}</span>
                  <span className="text-sm font-bold text-[var(--success)] tabular-nums">{formatCurrency(r.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-[10px] border border-[var(--success)]/20 bg-[color:color-mix(in_srgb,var(--success)_6%,transparent)] px-4 py-3">
                <span className="text-sm font-bold text-[var(--foreground)]">Total Revenue</span>
                <span className="text-sm font-bold text-[var(--success)] tabular-nums">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3"><TrendingDown className="h-4 w-4 text-[var(--destructive)]" /><h3 className="text-sm font-bold text-[var(--destructive)]">Expenses</h3></div>
            <div className="space-y-2">
              {expenses.map((e) => (
                <div key={e.label} className="flex items-center justify-between rounded-[10px] bg-[var(--surface)] px-4 py-3">
                  <span className="text-sm text-[var(--foreground)]">{e.label}</span>
                  <span className="text-sm font-bold text-[var(--destructive)] tabular-nums">{formatCurrency(e.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-[10px] border border-[var(--destructive)]/20 bg-[color:color-mix(in_srgb,var(--destructive)_6%,transparent)] px-4 py-3">
                <span className="text-sm font-bold text-[var(--foreground)]">Total Expenses</span>
                <span className="text-sm font-bold text-[var(--destructive)] tabular-nums">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </div>
          <div className="rounded-[14px] border-2 border-[var(--primary)]/30 bg-[color:color-mix(in_srgb,var(--primary)_6%,transparent)] px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-[var(--primary)]" />
                <span className="text-base font-bold text-[var(--foreground)]">Net Profit</span>
              </div>
              <span className="text-xl font-black text-[var(--primary)] tabular-nums">{formatCurrency(netProfit)}</span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Profit margin: <span className="tabular-nums">{Math.round((netProfit/totalRevenue)*100)}%</span>
            </p>
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}
