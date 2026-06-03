"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, CheckCheck, Clock, AlertCircle, Building2, FileText, Shield } from "lucide-react";
import { toast } from "sonner";

const initialFilings = [
  { id:"1", title:"Annual Financial Statements 2025",     type:"ministry_of_commerce", status:"acknowledged", ref:"MC-2026-00187",    filedAt:"2026-04-15", acknowledgedAt:"2026-04-17", period:"Full Year 2025" },
  { id:"2", title:"Zakat & Tax Return Q1 2026",           type:"zakat_tax",            status:"submitted",    ref:"GAZT-Q1-2026-4421", filedAt:"2026-04-28", acknowledgedAt:null,         period:"Q1 2026" },
  { id:"3", title:"Financial Statements Q1 2026",         type:"ministry_of_commerce", status:"pending",      ref:null,               filedAt:null,         acknowledgedAt:null,         period:"Q1 2026" },
];

const statusMap: Record<string,{label:string;variant:any}> = {
  pending:      {label:"Awaiting Filing",    variant:"warning"},
  submitted:    {label:"Submitted",          variant:"default"},
  acknowledged: {label:"Acknowledged",       variant:"success"},
  rejected:     {label:"Rejected",           variant:"destructive"},
};

const typeMap: Record<string,{label:string;icon:any}> = {
  ministry_of_commerce: {label:"Ministry of Commerce", icon:Building2},
  zakat_tax:            {label:"ZATCA",                 icon:Shield},
  other:                {label:"Other",                 icon:FileText},
};

export default function FilingsEnPage() {
  const [items, setItems] = useState(initialFilings);
  const [filing, setFiling] = useState<string|null>(null);

  async function handleFile(id: string) {
    setFiling(id);
    await new Promise((r) => setTimeout(r, 2500));
    setFiling(null);
    setItems((prev) => prev.map((f) => f.id===id ? {...f, status:"submitted", filedAt:"2026-06-03", ref:"MC-2026-00"+Math.floor(Math.random()*900+100)} : f));
    toast.success("Filed successfully — awaiting official acknowledgement");
  }

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Official Filings</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Submit approved financial statements to government authorities</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {label:"Acknowledged",     count:items.filter(f=>f.status==="acknowledged").length, color:"var(--success)",     icon:CheckCheck},
          {label:"Submitted",        count:items.filter(f=>f.status==="submitted").length,    color:"var(--primary)",     icon:Clock},
          {label:"Awaiting Filing",  count:items.filter(f=>f.status==="pending").length,      color:"var(--warning)",     icon:AlertCircle},
        ].map((s) => { const Icon = s.icon; return (
          <Card key={s.label}><CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2"><Icon className="h-4 w-4" style={{color:s.color}} /><p className="text-xs text-[var(--muted-foreground)]">{s.label}</p></div>
            <p className="text-2xl font-bold tabular-nums" style={{color:s.color}}>{s.count}</p>
          </CardContent></Card>
        );})}
      </div>

      <Card><CardContent className="p-5">
        <h2 className="text-sm font-bold text-[var(--foreground)] mb-4">Filing Process</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            {num:"1",label:"Generate Statements",done:true},
            {num:"2",label:"Accountant Review",  done:true},
            {num:"3",label:"Management Approval",done:true},
            {num:"4",label:"Filing Authorization",done:false},
            {num:"5",label:"Ministry of Commerce",done:false},
          ].map((step,i,arr) => (
            <div key={step.num} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black"
                  style={{ background:step.done?"var(--primary)":"var(--muted)", color:step.done?"white":"var(--muted-foreground)" }}>
                  {step.done ? <CheckCheck className="h-4 w-4" /> : step.num}
                </div>
                <span className="text-[11px] text-[var(--muted-foreground)] whitespace-nowrap">{step.label}</span>
              </div>
              {i < arr.length-1 && <div className="mx-2 h-0.5 w-8 shrink-0 rounded-full" style={{background:step.done?"var(--primary)":"var(--border)"}} />}
            </div>
          ))}
        </div>
      </CardContent></Card>

      <div className="space-y-4">
        {items.map((item) => {
          const s = statusMap[item.status];
          const ft = typeMap[item.type];
          const Icon = ft.icon;
          const isFiling = filing === item.id;
          return (
            <Card key={item.id}><CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)]">
                    <Icon className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-[var(--foreground)]">{item.title}</p>
                      <Badge variant={s.variant} className="text-[11px]">{s.label}</Badge>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-2">{ft.label} · {item.period}</p>
                    {item.ref && (
                      <div className="flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 w-fit">
                        <span className="text-xs text-[var(--muted-foreground)]">Reference:</span>
                        <span className="text-xs font-bold text-[var(--foreground)]">{item.ref}</span>
                      </div>
                    )}
                    {item.filedAt && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-2">
                        Filed: {item.filedAt}{item.acknowledgedAt ? ` · Acknowledged: ${item.acknowledgedAt}` : ""}
                      </p>
                    )}
                  </div>
                </div>
                {item.status === "pending" && (
                  <Button size="sm" className="shrink-0" disabled={isFiling} onClick={() => handleFile(item.id)}>
                    {isFiling ? (
                      <span className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Filing...
                      </span>
                    ) : <><Upload className="h-4 w-4" />File Now</>}
                  </Button>
                )}
                {item.status === "acknowledged" && (
                  <Button variant="outline" size="sm" className="shrink-0">
                    <CheckCheck className="h-4 w-4 text-[var(--success)]" />Download Receipt
                  </Button>
                )}
              </div>
            </CardContent></Card>
          );
        })}
      </div>
    </div>
  );
}
