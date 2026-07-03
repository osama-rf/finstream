"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2, CheckCircle2, Clock, Share2, CreditCard,
  ArrowUpRight, Eye, ShieldCheck, Landmark,
} from "lucide-react";
import { toast } from "sonner";

const banks = [
  {
    id: "1",
    name: "مصرف الراجحي",
    logo: "ر",
    color: "#006838",
    type: "تمويل SME",
    sharedAt: "2026-07-01",
    status: "viewed",
    response: "قيد الدراسة",
    limit: "500,000 – 2,000,000 ريال",
  },
  {
    id: "2",
    name: "البنك الأهلي",
    logo: "أ",
    color: "#00574B",
    type: "تمويل تشغيلي",
    sharedAt: null,
    status: "pending",
    response: null,
    limit: "250,000 – 1,500,000 ريال",
  },
  {
    id: "3",
    name: "بنك الإنماء",
    logo: "إ",
    color: "#0A3161",
    type: "تسهيل ائتماني",
    sharedAt: null,
    status: "pending",
    response: null,
    limit: "300,000 – 1,000,000 ريال",
  },
  {
    id: "4",
    name: "بنك الرياض",
    logo: "ري",
    color: "#C8102E",
    type: "تمويل SME",
    sharedAt: "2026-06-20",
    status: "approved",
    response: "تمت الموافقة المبدئية",
    limit: "400,000 – 1,800,000 ريال",
  },
];

const statusMap: Record<string, { label: string; variant: any; icon: any }> = {
  pending:  { label: "لم تُشارك بعد", variant: "secondary", icon: Clock },
  viewed:   { label: "تمت المشاهدة", variant: "warning",   icon: Eye },
  approved: { label: "موافقة مبدئية", variant: "success",  icon: CheckCircle2 },
};

export default function ShareReportPage() {
  const [items, setItems] = useState(banks);

  function handleShare(id: string) {
    setItems((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: "viewed", sharedAt: new Date().toISOString().slice(0, 10), response: "قيد الدراسة" }
          : b
      )
    );
    const bank = items.find((b) => b.id === id);
    toast.success(`تم مشاركة التقرير الائتماني مع ${bank?.name}`);
  }

  const sharedCount = items.filter((b) => b.status !== "pending").length;
  const approvedCount = items.filter((b) => b.status === "approved").length;
  const pendingCount = items.filter((b) => b.status === "pending").length;

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">مشاركة التقرير الائتماني</h1>
        <p className="text-sm text-[var(--muted-foreground)] font-arabic">
          شارك تقريرك الائتماني A- مع البنوك للحصول على عروض تمويل مناسبة
        </p>
      </div>

      {/* Credit badge */}
      <div className="rounded-[16px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_6%,transparent)] px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[var(--primary)] text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--foreground)] font-arabic">
                تصنيفك الائتماني: <span className="text-[var(--primary)]">A-</span> · جاهز للمشاركة
              </p>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                3 بنوك مربوطة · تحديث: اليوم · شُورك مع {sharedCount} {sharedCount === 1 ? "بنك" : "بنوك"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs text-[var(--muted-foreground)] font-arabic">
            <CreditCard className="h-4 w-4 text-[var(--primary)]" />
            <span className="font-bold text-[var(--primary)]">{approvedCount}</span> موافقة مبدئية
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "لم تُشارك", count: pendingCount, color: "var(--muted-foreground)", icon: Clock },
          { label: "قيد الدراسة", count: items.filter((b) => b.status === "viewed").length, color: "var(--warning)", icon: Eye },
          { label: "موافقة مبدئية", count: approvedCount, color: "var(--success)", icon: CheckCircle2 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
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

      {/* Banks list */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[var(--muted-foreground)] font-arabic px-1">البنوك المتاحة للمشاركة</h2>
        {items.map((bank) => {
          const status = statusMap[bank.status];
          const StatusIcon = status.icon;
          return (
            <Card key={bank.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold"
                      style={{ background: bank.color }}
                    >
                      {bank.logo}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-[var(--foreground)] font-arabic">{bank.name}</p>
                        <Badge variant={status.variant} className="font-arabic text-[11px] flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                        {bank.type} · نطاق التمويل: {bank.limit}
                      </p>
                      {bank.sharedAt && (
                        <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-0.5">
                          شُورك في: {bank.sharedAt}
                          {bank.response && <> · <span className="text-[var(--warning)]">{bank.response}</span></>}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {bank.status === "pending" ? (
                      <Button
                        size="sm"
                        className="font-arabic gap-1.5"
                        onClick={() => handleShare(bank.id)}
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        مشاركة التقرير
                      </Button>
                    ) : bank.status === "approved" ? (
                      <Button size="sm" variant="outline" className="font-arabic gap-1.5 border-[var(--success)] text-[var(--success)]">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        تواصل مع البنك
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="font-arabic gap-1.5" disabled>
                        <Clock className="h-3.5 w-3.5" />
                        انتظار الرد
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info banner */}
      <Card className="border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)]">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Landmark className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[var(--foreground)] font-arabic mb-1">كيف يعمل نظام مشاركة التقرير؟</p>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic leading-relaxed">
                عند المشاركة، يتلقى البنك تقريراً موحداً يتضمن ملخصك المالي من جميع البنوك المربوطة، مؤشرات السيولة والنمو، ومقارنة بمتوسط القطاع — كل هذا دون الحاجة لتقديم كشوف حسابات متعددة يدوياً.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
