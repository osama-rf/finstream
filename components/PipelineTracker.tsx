"use client";

import { useEffect, useState } from "react";
import { Landmark, Bot, FileText, CheckCircle, Upload, Check } from "lucide-react";
import Link from "next/link";

type StageStatus = "complete" | "in_progress" | "pending";

interface StageData {
  status: StageStatus;
  count: number;
  total: number;
}

interface PipelineStatus {
  stage1: StageData;
  stage2: StageData;
  stage3: StageData;
  stage4: StageData;
  stage5: StageData;
}

const STAGES = [
  { key: "stage1", labelAr: "الربط البنكي",           icon: Landmark,    href: "/bank" },
  { key: "stage2", labelAr: "وكيل الذكاء الاصطناعي", icon: Bot,         href: "/bank" },
  { key: "stage3", labelAr: "القوائم المالية",        icon: FileText,    href: "/statements" },
  { key: "stage4", labelAr: "المراجعة والاعتماد",    icon: CheckCircle, href: "/approvals" },
  { key: "stage5", labelAr: "الإيداع الرسمي",        icon: Upload,      href: "/filings" },
] as const;

const STATUS_LABELS: Record<StageStatus, string> = {
  complete:    "مكتمل",
  in_progress: "جاري",
  pending:     "معلق",
};

const STATUS_BADGE: Record<StageStatus, string> = {
  complete:    "bg-[color:color-mix(in_srgb,var(--success)_16%,transparent)] text-[var(--success)]",
  in_progress: "bg-[color:color-mix(in_srgb,var(--warning)_18%,transparent)] text-[var(--warning)]",
  pending:     "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

function getSublabel(key: string, data: StageData): string {
  if (key === "stage1") return data.count > 0 ? `${data.count} معاملة` : "لم يُربط بعد";
  if (key === "stage2") return data.total > 0 ? `${data.count} / ${data.total} معاملة` : "بانتظار المزامنة";
  if (key === "stage3") return data.total > 0 ? `${data.total} قائمة` : "لم تُنشأ بعد";
  if (key === "stage4") return data.total > 0 ? `${data.count} / ${data.total} اعتماد` : "بانتظار القوائم";
  if (key === "stage5") return data.count > 0 ? `${data.count} مودعة` : "بانتظار الاعتماد";
  return "";
}

export function PipelineTracker() {
  const [pipelineData, setPipelineData] = useState<PipelineStatus | null>(null);

  useEffect(() => {
    fetch("/api/openbanking/pipeline-status")
      .then((r) => r.json())
      .then((json) => { if (json.success) setPipelineData(json.data); })
      .catch(() => {});
  }, []);

  const defaultStage: StageData = { status: "pending", count: 0, total: 0 };

  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--card)] px-6 py-5 backdrop-blur-xl shadow-[var(--shadow-soft)]" dir="rtl">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
        <p className="text-sm font-bold text-[var(--foreground)] font-arabic">مسار المعالجة</p>
        <span className="text-xs text-[var(--muted-foreground)] font-arabic">من الربط البنكي إلى الإيداع الرسمي</span>
      </div>

      <div className="flex items-start gap-0 overflow-x-auto pb-1">
        {STAGES.map((stage, idx) => {
          const data = pipelineData ? (pipelineData as any)[stage.key] as StageData : defaultStage;
          const Icon = stage.icon;
          const isLast = idx === STAGES.length - 1;

          const circleStyle =
            data.status === "complete"
              ? "bg-[var(--primary)] text-white border-[var(--primary)]"
              : data.status === "in_progress"
              ? "bg-[color:color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)] border-[var(--warning)] ring-2 ring-[var(--warning)] ring-offset-2 ring-offset-[var(--card)]"
              : "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]";

          const connectorStyle =
            data.status === "complete"
              ? "bg-[var(--primary)]"
              : data.status === "in_progress"
              ? "bg-gradient-to-l from-[var(--border)] to-[var(--primary)]"
              : "bg-[var(--border)]";

          return (
            <div key={stage.key} className="flex items-start shrink-0">
              <Link href={stage.href} className="flex flex-col items-center gap-2 min-w-[90px] group">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${circleStyle}`}
                >
                  {data.status === "complete" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="text-center px-1">
                  <p className="text-xs font-bold text-[var(--foreground)] font-arabic leading-snug group-hover:text-[var(--primary)] transition-colors">
                    {stage.labelAr}
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)] font-arabic mt-0.5">
                    {pipelineData ? getSublabel(stage.key, data) : "..."}
                  </p>
                  <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium font-arabic ${STATUS_BADGE[data.status]}`}>
                    {STATUS_LABELS[data.status]}
                  </span>
                </div>
              </Link>

              {!isLast && (
                <div className="flex items-center mt-5 mx-1 shrink-0">
                  <div className={`h-0.5 w-8 rounded-full transition-all ${connectorStyle}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
