"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, CheckCheck, Clock, AlertCircle, Building2, FileText, Shield } from "lucide-react";
import { toast } from "sonner";

const filings = [
  {
    id: "1",
    title: "القوائم المالية السنوية 2025",
    filingType: "ministry_of_commerce",
    status: "acknowledged",
    refNumber: "MC-2026-00234",
    filedAt: "2026-03-20",
    acknowledgedAt: "2026-03-22",
    statementPeriod: "2025 كامل السنة",
  },
  {
    id: "2",
    title: "الإقرار الضريبي Q4 2025",
    filingType: "zakat_tax",
    status: "submitted",
    refNumber: "GAZT-Q4-2025-7812",
    filedAt: "2026-01-28",
    acknowledgedAt: null,
    statementPeriod: "Q4 2025",
  },
  {
    id: "3",
    title: "القوائم المالية Q1 2026",
    filingType: "ministry_of_commerce",
    status: "pending",
    refNumber: null,
    filedAt: null,
    acknowledgedAt: null,
    statementPeriod: "Q1 2026",
  },
];

const statusMap: Record<string, { label: string; variant: any }> = {
  pending: { label: "بانتظار الإيداع", variant: "warning" },
  submitted: { label: "مُودع", variant: "default" },
  acknowledged: { label: "مُعترف به", variant: "success" },
  rejected: { label: "مرفوض", variant: "destructive" },
};

const filingTypeMap: Record<string, { label: string; icon: any }> = {
  ministry_of_commerce: { label: "وزارة التجارة", icon: Building2 },
  zakat_tax: { label: "هيئة الزكاة والضريبة", icon: Shield },
  other: { label: "جهة أخرى", icon: FileText },
};

export default function FilingsPage() {
  const [items, setItems] = useState(filings);
  const [filing, setFiling] = useState<string | null>(null);

  async function handleFile(id: string) {
    setFiling(id);
    await new Promise((r) => setTimeout(r, 2500));
    setFiling(null);
    setItems((prev) => prev.map((f) => f.id === id
      ? { ...f, status: "submitted", filedAt: "2026-06-03", refNumber: "MC-2026-00" + Math.floor(Math.random() * 900 + 100) }
      : f
    ));
    toast.success("تم الإيداع بنجاح — في انتظار الاعتراف الرسمي");
  }

  const stats = [
    { label: "مودع ومعترف به", count: items.filter((f) => f.status === "acknowledged").length, color: "var(--success)", icon: CheckCheck },
    { label: "مودع بانتظار الاعتراف", count: items.filter((f) => f.status === "submitted").length, color: "var(--primary)", icon: Clock },
    { label: "بانتظار الإيداع", count: items.filter((f) => f.status === "pending").length, color: "var(--warning)", icon: AlertCircle },
  ];

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">الإيداع الرسمي</h1>
        <p className="text-sm text-[var(--muted-foreground)] font-arabic">إيداع القوائم المالية المعتمدة لدى الجهات الحكومية</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4" style={{ color: stat.color }} />
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Process steps */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-bold text-[var(--foreground)] font-arabic mb-4">مسار الإيداع الرسمي</h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { num: "1", label: "إنشاء القوائم", done: true },
              { num: "2", label: "مراجعة المحاسب", done: true },
              { num: "3", label: "اعتماد الإدارة", done: true },
              { num: "4", label: "تعميد الإيداع", done: false },
              { num: "5", label: "وزارة التجارة", done: false },
            ].map((step, i, arr) => (
              <div key={step.num} className="flex items-center shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black"
                    style={{
                      background: step.done ? "var(--primary)" : "var(--muted)",
                      color: step.done ? "white" : "var(--muted-foreground)",
                    }}
                  >
                    {step.done ? <CheckCheck className="h-4 w-4" /> : step.num}
                  </div>
                  <span className="text-[11px] text-[var(--muted-foreground)] font-arabic whitespace-nowrap">{step.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="mx-2 h-0.5 w-8 shrink-0 rounded-full" style={{ background: step.done ? "var(--primary)" : "var(--border)" }} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filings list */}
      <div className="space-y-4">
        {items.map((item) => {
          const status = statusMap[item.status];
          const filingType = filingTypeMap[item.filingType];
          const Icon = filingType.icon;
          const isFiling = filing === item.id;

          return (
            <Card key={item.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)]">
                      <Icon className="h-5 w-5 text-[var(--primary)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-[var(--foreground)] font-arabic">{item.title}</p>
                        <Badge variant={status.variant} className="font-arabic text-[11px]">{status.label}</Badge>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-2">{filingType.label} · {item.statementPeriod}</p>
                      {item.refNumber && (
                        <div className="flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 w-fit">
                          <span className="text-xs text-[var(--muted-foreground)] font-arabic">رقم المرجع:</span>
                          <span className="text-xs font-bold text-[var(--foreground)]" dir="ltr">{item.refNumber}</span>
                        </div>
                      )}
                      {item.filedAt && (
                        <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-2">
                          تاريخ الإيداع: {item.filedAt}
                          {item.acknowledgedAt && ` · الاعتراف: ${item.acknowledgedAt}`}
                        </p>
                      )}
                    </div>
                  </div>
                  {item.status === "pending" && (
                    <Button size="sm" className="shrink-0 font-arabic" disabled={isFiling} onClick={() => handleFile(item.id)}>
                      {isFiling ? (
                        <span className="flex items-center gap-2">
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          جاري الإيداع...
                        </span>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          إيداع الآن
                        </>
                      )}
                    </Button>
                  )}
                  {item.status === "acknowledged" && (
                    <Button variant="outline" size="sm" className="shrink-0 font-arabic">
                      <CheckCheck className="h-4 w-4 text-[var(--success)]" />
                      تحميل الإيصال
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
