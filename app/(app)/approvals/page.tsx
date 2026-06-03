"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, FileText, Eye, Users, Check, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import Link from "next/link";

const statusMap: Record<string, { label: string; variant: any }> = {
  pending:   { label: "معلق",          variant: "warning" },
  in_review: { label: "قيد المراجعة", variant: "default" },
  approved:  { label: "معتمد",         variant: "success" },
  rejected:  { label: "مرفوض",         variant: "destructive" },
};

const STAGE_LABELS: Record<string, { role: string; title: string }> = {
  "1": { role: "المحاسب", title: "المرحلة 1 — مراجعة المحاسب" },
  "2": { role: "المدقق", title: "المرحلة 2 — اعتماد المدقق" },
  "3": { role: "المدير", title: "المرحلة 3 — موافقة المدير" },
};

export default function ApprovalsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => { loadApprovals(); }, []);

  async function loadApprovals() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data: profile } = await supabase.from("users").select("company_id").eq("id", user.id).single() as { data: any };
    if (!profile?.company_id) { setLoading(false); return; }
    const { data } = await supabase
      .from("approvals")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("priority", { ascending: true });
    setItems(data || []);
    setLoading(false);
  }

  async function handleApprove(id: string) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("تم الاعتماد بنجاح");
        setItems((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved" } : a));
      } else toast.error(json.error);
    } catch { toast.error("حدث خطأ"); }
    finally { setProcessingId(null); }
  }

  async function handleReject(id: string) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", notes: rejectNotes }),
      });
      const json = await res.json();
      if (json.success) {
        toast.error("تم الرفض");
        setItems((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected", notes: rejectNotes } : a));
        setRejectingId(null);
        setRejectNotes("");
      } else toast.error(json.error);
    } catch { toast.error("حدث خطأ"); }
    finally { setProcessingId(null); }
  }

  // Group by entity_id to show 3-stage chains
  const groupedByEntity: Record<string, any[]> = {};
  items.forEach((item) => {
    if (!groupedByEntity[item.entity_id]) groupedByEntity[item.entity_id] = [];
    groupedByEntity[item.entity_id].push(item);
  });

  const allApproved = items.length > 0 && items.every((a) => a.status === "approved");
  const pendingCount = items.filter((a) => a.status === "pending" || a.status === "in_review").length;
  const approvedCount = items.filter((a) => a.status === "approved").length;

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">الموافقات</h1>
        <p className="text-sm text-[var(--muted-foreground)] font-arabic">سلسلة الاعتماد الثلاثية للقوائم المالية والإيداعات</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "بانتظار الموافقة", count: pendingCount, color: "var(--warning)", icon: CheckCircle },
          { label: "معتمدة", count: approvedCount, color: "var(--success)", icon: Check },
          { label: "مرفوضة", count: items.filter((a) => a.status === "rejected").length, color: "var(--destructive)", icon: XCircle },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}><CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4" style={{ color: s.color }} />
                <p className="text-xs text-[var(--muted-foreground)] font-arabic">{s.label}</p>
              </div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.count}</p>
            </CardContent></Card>
          );
        })}
      </div>

      {/* All approved banner */}
      {allApproved && (
        <div className="rounded-[16px] border border-[color:color-mix(in_srgb,var(--success)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--success)_5%,transparent)] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-[var(--success)] shrink-0" />
              <div>
                <p className="text-sm font-bold text-[var(--foreground)] font-arabic">تم الاعتماد الكامل — جميع المراحل الثلاثة معتمدة</p>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic">القوائم المالية جاهزة للإيداع الرسمي لدى وزارة التجارة</p>
              </div>
            </div>
            <Link href="/filings">
              <Button size="sm" className="font-arabic shrink-0">الانتقال للإيداع</Button>
            </Link>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-[20px] bg-[var(--muted)]" />)}
        </div>
      ) : items.length === 0 ? (
        <Card><CardContent className="p-10 text-center">
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">لا توجد طلبات موافقة بعد</p>
          <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-1">أنشئ القوائم المالية أولاً ثم أرسلها للمراجعة</p>
          <Link href="/statements" className="mt-4 inline-block">
            <Button size="sm" variant="outline" className="font-arabic">الذهاب للقوائم المالية</Button>
          </Link>
        </CardContent></Card>
      ) : (
        /* Show grouped by entity */
        Object.entries(groupedByEntity).map(([entityId, stageItems]) => {
          const sortedStages = [...stageItems].sort((a, b) => Number(a.priority) - Number(b.priority));
          const entityTitle = sortedStages[0]?.title?.replace(/مرحلة \d — /, "").replace(/: .*$/, "") || "قائمة مالية";

          return (
            <Card key={entityId}>
              <CardContent className="p-5">
                {/* Entity header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                    <FileText className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--foreground)] font-arabic">{entityTitle}</p>
                    <p className="text-xs text-[var(--muted-foreground)] font-arabic">سلسلة الاعتماد الثلاثية</p>
                  </div>
                </div>

                {/* 3-stage visual chain */}
                <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
                  {sortedStages.map((stage, idx) => {
                    const stageInfo = STAGE_LABELS[stage.priority] || { role: "مستخدم", title: stage.title };
                    const isApproved = stage.status === "approved";
                    const isPending = stage.status === "pending";
                    const isLast = idx === sortedStages.length - 1;

                    return (
                      <div key={stage.id} className="flex items-center shrink-0">
                        <div className="flex flex-col items-center gap-1 min-w-[80px]">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                              isApproved
                                ? "bg-[var(--success)] border-[var(--success)] text-white"
                                : isPending
                                ? "bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)]"
                                : "bg-[color:color-mix(in_srgb,var(--warning)_14%,transparent)] border-[var(--warning)] text-[var(--warning)]"
                            }`}
                          >
                            {isApproved ? <Check className="h-4 w-4" /> : <Users className="h-3.5 w-3.5" />}
                          </div>
                          <p className="text-[11px] font-medium text-[var(--foreground)] font-arabic">{stageInfo.role}</p>
                          <Badge
                            variant={statusMap[stage.status]?.variant || "secondary"}
                            className="font-arabic text-[10px]"
                          >
                            {statusMap[stage.status]?.label || stage.status}
                          </Badge>
                        </div>
                        {!isLast && (
                          <div className={`mx-1 h-0.5 w-8 rounded-full shrink-0 ${isApproved ? "bg-[var(--success)]" : "bg-[var(--border)]"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Individual stage actions */}
                <div className="space-y-3">
                  {sortedStages.filter((s) => s.status === "pending" || s.status === "in_review").map((stage) => {
                    const stageInfo = STAGE_LABELS[stage.priority] || { role: "مستخدم", title: stage.title };
                    const isRejecting = rejectingId === stage.id;

                    return (
                      <div key={stage.id} className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div>
                            <p className="text-sm font-bold text-[var(--foreground)] font-arabic">{stageInfo.title}</p>
                            <p className="text-xs text-[var(--muted-foreground)] font-arabic">{stage.description}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-arabic gap-1.5"
                              onClick={() => setRejectingId(isRejecting ? null : stage.id)}
                            >
                              <XCircle className="h-3.5 w-3.5 text-[var(--destructive)]" />
                              رفض
                            </Button>
                            <Button
                              size="sm"
                              className="font-arabic bg-[var(--success)] hover:opacity-90 gap-1.5"
                              disabled={processingId === stage.id}
                              onClick={() => handleApprove(stage.id)}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              {processingId === stage.id ? "جاري..." : "اعتماد"}
                            </Button>
                          </div>
                        </div>

                        {isRejecting && (
                          <div className="mt-3 space-y-2">
                            <Textarea
                              placeholder="سبب الرفض (مطلوب)..."
                              value={rejectNotes}
                              onChange={(e) => setRejectNotes(e.target.value)}
                              className="text-sm font-arabic"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="font-arabic" onClick={() => { setRejectingId(null); setRejectNotes(""); }}>
                                إلغاء
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="font-arabic"
                                disabled={!rejectNotes.trim() || processingId === stage.id}
                                onClick={() => handleReject(stage.id)}
                              >
                                تأكيد الرفض
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
