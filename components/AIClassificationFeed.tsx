"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, CheckCheck, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import Link from "next/link";

type ClassifyEvent =
  | { type: "start"; total: number; message: string }
  | { type: "thinking"; transactionId: string; description: string }
  | { type: "classified"; transactionId: string; description: string; category: string; confidence: number; debitAccount: string; creditAccount: string; amount: number; txType: "credit" | "debit"; journalEntryId: string | null; reasoning: string }
  | { type: "error"; transactionId: string; message: string }
  | { type: "complete"; classified: number; journalEntries: number; message: string };

interface ClassificationResult {
  classified: number;
  journalEntries: number;
}

interface Props {
  onComplete: (result: ClassificationResult) => void;
  onClose: () => void;
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const variant = confidence >= 90 ? "success" : confidence >= 70 ? "warning" : "outline";
  return (
    <Badge variant={variant} className="font-arabic text-[10px] tabular-nums shrink-0" dir="ltr">
      {confidence}%
    </Badge>
  );
}

export function AIClassificationFeed({ onComplete, onClose }: Props) {
  const [total, setTotal] = useState(0);
  const [classified, setClassified] = useState(0);
  const [cards, setCards] = useState<ClassifyEvent[]>([]);
  const [thinking, setThinking] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    async function run() {
      const res = await fetch("/api/openbanking/classify", { method: "POST" });
      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as ClassifyEvent;

            if (event.type === "start") {
              setTotal(event.total);
            } else if (event.type === "thinking") {
              setThinking(event.description);
            } else if (event.type === "classified") {
              setThinking(null);
              setClassified((c) => c + 1);
              setCards((prev) => [event, ...prev]);
            } else if (event.type === "complete") {
              setThinking(null);
              setIsDone(true);
              const r = { classified: event.classified, journalEntries: event.journalEntries };
              setResult(r);
              onComplete(r);
            }
          } catch {}
        }
      }
    }

    run().catch(() => setIsDone(true));
  }, []); // eslint-disable-line

  const progress = total > 0 ? Math.round((classified / total) * 100) : 0;

  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-[var(--shadow-soft)]" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
            <Bot className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--foreground)] font-arabic">
              {isDone ? "اكتمل وكيل الذكاء الاصطناعي" : "وكيل الذكاء الاصطناعي يعمل..."}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] font-arabic">
              {isDone ? `صُنّفت ${result?.classified} معاملة` : `يحلل ويصنف المعاملات البنكية`}
            </p>
          </div>
        </div>
        {isDone && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Progress */}
      {!isDone && (
        <div className="border-b border-[var(--border)] px-5 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[var(--muted-foreground)] font-arabic">
              {classified} / {total} معاملة
            </p>
            <p className="text-xs font-bold text-[var(--primary)] tabular-nums" dir="ltr">{progress}%</p>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Feed */}
      <div ref={feedRef} className="max-h-[420px] overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin">

        {/* Complete card */}
        {isDone && result && (
          <div className="rounded-[12px] border border-[color:color-mix(in_srgb,var(--success)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--success)_6%,transparent)] px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <CheckCheck className="h-5 w-5 text-[var(--success)] shrink-0" />
              <div>
                <p className="text-sm font-bold text-[var(--foreground)] font-arabic">اكتمل التصنيف بنجاح</p>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                  صُنّفت {result.classified} معاملة — أُنشئت {result.journalEntries} قيد محاسبي
                </p>
              </div>
            </div>
            <Link href="/statements">
              <Button size="sm" className="w-full font-arabic gap-2">
                الانتقال لإنشاء القوائم المالية
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* Thinking card */}
        {thinking && (
          <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-0.5">يحلل...</p>
                <p className="text-sm text-[var(--foreground)] font-arabic truncate">{thinking}</p>
              </div>
            </div>
          </div>
        )}

        {/* Classified cards */}
        {(cards as any[]).map((event: any, i: number) => (
          <div
            key={`${event.transactionId}-${i}`}
            className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 animate-[slideIn_0.2s_ease]"
            style={{ animationFillMode: "both" }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm text-[var(--foreground)] font-arabic flex-1 min-w-0 truncate">
                {event.description}
              </p>
              <ConfidenceBadge confidence={event.confidence} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: event.txType === "credit" ? "var(--success)" : "var(--destructive)" }}
              />
              <span className="text-xs font-bold font-arabic" style={{ color: event.category ? "var(--primary)" : "var(--muted-foreground)" }}>
                {event.category}
              </span>
              <span className="text-xs text-[var(--muted-foreground)] font-arabic mx-1">|</span>
              <span className="text-xs text-[var(--foreground)] font-bold tabular-nums" style={{ color: event.txType === "credit" ? "var(--success)" : "var(--destructive)" }} dir="ltr">
                {event.txType === "credit" ? "+" : "-"}{formatCurrency(event.amount)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[var(--muted-foreground)] font-arabic">
              <span>حـ/ مدين: {event.debitAccount}</span>
              <span className="text-[var(--border)]">|</span>
              <span>حـ/ دائن: {event.creditAccount}</span>
            </div>
            {event.journalEntryId && (
              <div className="mt-2">
                <Badge variant="success" className="font-arabic text-[10px]">قيد محاسبي أُنشئ</Badge>
              </div>
            )}
          </div>
        ))}

        {/* Empty state while loading first */}
        {!thinking && cards.length === 0 && !isDone && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] font-arabic">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
              الوكيل يستعد للتصنيف...
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
