"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, FileText, Eye } from "lucide-react";
import { toast } from "sonner";

const initialApprovals = [
  { id:"1", title:"Income Statement Q1 2026",          description:"Review and approve Q1 2026 income statement", type:"statement", status:"pending",   requestedBy:"Ahmed Mohammed", requestedAt:"2026-06-01", priority:"High" },
  { id:"2", title:"Balance Sheet Q1 2026",             description:"Review and approve Q1 2026 balance sheet",    type:"statement", status:"in_review", requestedBy:"Sara Al-Ahmad",  requestedAt:"2026-06-01", priority:"High" },
  { id:"3", title:"Q4 2025 Ministry Filing",           description:"Approve annual financial statements filing",  type:"filing",    status:"approved",  requestedBy:"Khalid Al-Omar", requestedAt:"2026-03-15", priority:"Normal", reviewedBy:"Abdullah Al-Saad" },
  { id:"4", title:"Unknown-source Bank Transfers",     description:"Approve classification of 3 unclassified transactions", type:"transaction", status:"pending", requestedBy:"Fatima Ali", requestedAt:"2026-06-03", priority:"Medium" },
];

const statusMap: Record<string,{label:string;variant:any}> = {
  pending:   {label:"Pending",     variant:"warning"},
  in_review: {label:"In Review",   variant:"default"},
  approved:  {label:"Approved",    variant:"success"},
  rejected:  {label:"Rejected",    variant:"destructive"},
};

export default function ApprovalsEnPage() {
  const [items, setItems] = useState(initialApprovals);

  function approve(id: string) { setItems((p) => p.map((a) => a.id===id ? {...a,status:"approved"} : a)); toast.success("Approved"); }
  function reject(id: string)  { setItems((p) => p.map((a) => a.id===id ? {...a,status:"rejected"} : a)); toast.error("Rejected"); }

  const pending   = items.filter((a) => a.status==="pending" || a.status==="in_review");
  const completed = items.filter((a) => a.status==="approved" || a.status==="rejected");

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Approvals</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Review and approve financial statements and filings</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {label:"Awaiting Approval", count:pending.length,  color:"var(--warning)",     icon:Clock},
          {label:"Approved",          count:items.filter(a=>a.status==="approved").length, color:"var(--success)", icon:CheckCircle},
          {label:"Rejected",          count:items.filter(a=>a.status==="rejected").length, color:"var(--destructive)", icon:XCircle},
        ].map((s) => { const Icon = s.icon; return (
          <Card key={s.label}><CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2"><Icon className="h-5 w-5" style={{color:s.color}} /><p className="text-xs text-[var(--muted-foreground)]">{s.label}</p></div>
            <p className="text-2xl font-bold tabular-nums" style={{color:s.color}}>{s.count}</p>
          </CardContent></Card>
        );})}
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[var(--muted-foreground)] mb-3 px-1">Awaiting Approval</h2>
          <div className="space-y-3">
            {pending.map((item) => {
              const s = statusMap[item.status];
              return (
                <Card key={item.id}><CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                        <FileText className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-[var(--foreground)] text-sm">{item.title}</p>
                          <Badge variant={s.variant} className="text-[11px]">{s.label}</Badge>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">{item.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <p className="text-xs text-[var(--muted-foreground)]">Requested by: {item.requestedBy}</p>
                          <span className="text-[var(--border)]">·</span>
                          <p className="text-xs text-[var(--muted-foreground)]">{item.requestedAt}</p>
                          <span className="text-[var(--border)]">·</span>
                          <Badge variant={item.priority==="High"?"destructive":item.priority==="Medium"?"warning":"secondary"} className="text-[11px]">{item.priority}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="gap-1.5"><Eye className="h-3.5 w-3.5" />Preview</Button>
                      <Button variant="destructive" size="sm" onClick={() => reject(item.id)}><XCircle className="h-3.5 w-3.5" />Reject</Button>
                      <Button size="sm" className="bg-[var(--success)] hover:opacity-90" onClick={() => approve(item.id)}><CheckCircle className="h-3.5 w-3.5" />Approve</Button>
                    </div>
                  </div>
                </CardContent></Card>
              );
            })}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[var(--muted-foreground)] mb-3 px-1">Completed</h2>
          <div className="space-y-3">
            {completed.map((item) => {
              const s = statusMap[item.status];
              return (
                <Card key={item.id} className="opacity-75"><CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[var(--muted)]">
                        <FileText className="h-4 w-4 text-[var(--muted-foreground)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--foreground)] text-sm">{item.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{item.requestedAt} · {item.requestedBy}</p>
                      </div>
                    </div>
                    <Badge variant={s.variant} className="shrink-0">{s.label}</Badge>
                  </div>
                </CardContent></Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
