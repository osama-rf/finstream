"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, FileText, Eye } from "lucide-react";
import { toast } from "sonner";

const approvals = [
  {
    id: "1",
    title: "قائمة الدخل Q1 2026",
    description: "مراجعة واعتماد قائمة الدخل للربع الأول من 2026",
    type: "statement",
    status: "pending",
    requestedBy: "أحمد محمد",
    requestedAt: "2026-06-01",
    priority: "عالية",
  },
  {
    id: "2",
    title: "الميزانية العمومية Q1 2026",
    description: "مراجعة واعتماد الميزانية العمومية للربع الأول",
    type: "statement",
    status: "in_review",
    requestedBy: "سارة الأحمد",
    requestedAt: "2026-06-01",
    priority: "عالية",
  },
  {
    id: "3",
    title: "إيداع Q4 2025 لوزارة التجارة",
    description: "الموافقة على إيداع القوائم المالية السنوية 2025",
    type: "filing",
    status: "approved",
    requestedBy: "خالد العمر",
    requestedAt: "2026-03-15",
    priority: "عادية",
    reviewedBy: "م. عبدالله السعد",
  },
  {
    id: "4",
    title: "مبالغ تحويل مجهولة المصدر",
    description: "الموافقة على تصنيف 3 معاملات بنكية مجهولة المصدر",
    type: "transaction",
    status: "pending",
    requestedBy: "فاطمة علي",
    requestedAt: "2026-06-03",
    priority: "متوسطة",
  },
];

const statusMap: Record<string, { label: string; variant: any }> = {
  pending: { label: "معلق", variant: "warning" },
  in_review: { label: "قيد المراجعة", variant: "default" },
  approved: { label: "معتمد", variant: "success" },
  rejected: { label: "مرفوض", variant: "destructive" },
};

const typeLabels: Record<string, string> = {
  statement: "قائمة مالية",
  filing: "إيداع رسمي",
  transaction: "معاملة بنكية",
};

export default function ApprovalsPage() {
  const [items, setItems] = useState(approvals);

  function handleApprove(id: string) {
    setItems((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved" } : a));
    toast.success("تمت الموافقة بنجاح");
  }

  function handleReject(id: string) {
    setItems((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected" } : a));
    toast.error("تم الرفض");
  }

  const pending = items.filter((a) => a.status === "pending" || a.status === "in_review");
  const completed = items.filter((a) => a.status === "approved" || a.status === "rejected");

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">الموافقات</h1>
        <p className="text-sm text-[var(--muted-foreground)] font-arabic">مراجعة واعتماد القوائم المالية والإيداعات</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "بانتظار الموافقة", count: pending.length, color: "var(--warning)", icon: Clock },
          { label: "معتمدة", count: items.filter((a) => a.status === "approved").length, color: "var(--success)", icon: CheckCircle },
          { label: "مرفوضة", count: items.filter((a) => a.status === "rejected").length, color: "var(--destructive)", icon: XCircle },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5" style={{ color: stat.color }} />
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[var(--muted-foreground)] font-arabic mb-3 px-1">بانتظار الموافقة</h2>
          <div className="space-y-3">
            {pending.map((item) => {
              const status = statusMap[item.status];
              return (
                <Card key={item.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                          <FileText className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-bold text-[var(--foreground)] font-arabic">{item.title}</p>
                            <Badge variant={status.variant} className="font-arabic text-[11px]">{status.label}</Badge>
                            <Badge variant="outline" className="font-arabic text-[11px]">{typeLabels[item.type]}</Badge>
                          </div>
                          <p className="text-sm text-[var(--muted-foreground)] font-arabic">{item.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                              طلبه: {item.requestedBy}
                            </p>
                            <span className="text-[var(--border)]">·</span>
                            <p className="text-xs text-[var(--muted-foreground)] font-arabic">{item.requestedAt}</p>
                            <span className="text-[var(--border)]">·</span>
                            <Badge variant={item.priority === "عالية" ? "destructive" : item.priority === "متوسطة" ? "warning" : "secondary"} className="font-arabic text-[11px]">
                              {item.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" className="font-arabic gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          معاينة
                        </Button>
                        <Button variant="destructive" size="sm" className="font-arabic" onClick={() => handleReject(item.id)}>
                          <XCircle className="h-3.5 w-3.5" />
                          رفض
                        </Button>
                        <Button size="sm" className="font-arabic bg-[var(--success)] hover:opacity-90" onClick={() => handleApprove(item.id)}>
                          <CheckCircle className="h-3.5 w-3.5" />
                          اعتماد
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[var(--muted-foreground)] font-arabic mb-3 px-1">المكتملة</h2>
          <div className="space-y-3">
            {completed.map((item) => {
              const status = statusMap[item.status];
              return (
                <Card key={item.id} className="opacity-75">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[var(--muted)]">
                          <FileText className="h-4 w-4 text-[var(--muted-foreground)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--foreground)] font-arabic text-sm">{item.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                            {item.requestedAt} · {item.requestedBy}
                          </p>
                        </div>
                      </div>
                      <Badge variant={status.variant} className="font-arabic shrink-0">{status.label}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
