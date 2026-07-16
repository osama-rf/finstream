"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet, TrendingUp, TrendingDown, ShieldCheck, RefreshCw, Plus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Toggle } from "@/components/ui/toggle";
import { Slider } from "@/components/ui/slider";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import {
  SUSTAINABILITY_SCORE, FINANCIAL_GOALS, ALERT_THRESHOLDS, MANUAL_ENTRIES,
  SCENARIO_BASELINE, computeScenario, BANKING_SUMMARY,
} from "@/lib/mock";
import type { ManualEntry } from "@/lib/mock";

const kpis = [
  { label: "إجمالي الأرصدة المجمّعة", value: BANKING_SUMMARY.totalBalance, change: "+8.3%", up: true, icon: Wallet, color: "var(--primary)" },
  { label: "صافي الإيرادات (30 يوم)", value: 847_500, change: "+12.4%", up: true, icon: TrendingUp, color: "var(--success)" },
  { label: "إجمالي المصروفات (30 يوم)", value: 423_200, change: "+3.1%", up: false, icon: TrendingDown, color: "var(--destructive)" },
  { label: "التصنيف الائتماني", value: "A-", change: "جيد جداً", up: null as boolean | null, icon: ShieldCheck, color: "var(--primary)" },
];

function AddManualEntryModal({ onClose, onAdd }: { onClose: () => void; onAdd: (e: ManualEntry) => void }) {
  const [desc, setDesc] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");

  function handleSave() {
    if (!desc || !amount) {
      toast.error("يرجى تعبئة جميع الحقول");
      return;
    }
    onAdd({
      id: String(Date.now()),
      desc,
      type,
      amount: Number(amount),
      date: new Date().toISOString().slice(0, 10),
    });
    toast.success("تمت إضافة القيد اليدوي");
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-arabic">إضافة قيد يدوي</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="font-arabic">الوصف</Label>
            <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="عهدة نقدية — معرض تجاري" className="font-arabic" />
          </div>
          <div className="space-y-2">
            <Label className="font-arabic">النوع</Label>
            <div className="flex gap-2">
              <button onClick={() => setType("income")}
                className={`flex-1 rounded-[10px] border px-4 py-2 text-sm font-arabic ${type === "income" ? "border-[var(--success)] bg-[color:color-mix(in_srgb,var(--success)_8%,transparent)] text-[var(--success)] font-bold" : "border-[var(--border)] text-[var(--foreground)]"}`}>
                إيراد
              </button>
              <button onClick={() => setType("expense")}
                className={`flex-1 rounded-[10px] border px-4 py-2 text-sm font-arabic ${type === "expense" ? "border-[var(--destructive)] bg-[color:color-mix(in_srgb,var(--destructive)_8%,transparent)] text-[var(--destructive)] font-bold" : "border-[var(--border)] text-[var(--foreground)]"}`}>
                مصروف
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-arabic">المبلغ (ر.س)</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} dir="ltr" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="font-arabic" onClick={onClose}>إلغاء</Button>
          <Button className="font-arabic" onClick={handleSave}>حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function IndicatorsPage() {
  const [entries, setEntries] = useState<ManualEntry[]>(MANUAL_ENTRIES);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [thresholds, setThresholds] = useState(ALERT_THRESHOLDS);
  const [scenario, setScenario] = useState(SCENARIO_BASELINE);
  const [refreshing, setRefreshing] = useState(false);

  const scenarioResult = useMemo(() => computeScenario(scenario), [scenario]);

  async function handleRefresh() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    setRefreshing(false);
    toast.success("تم تحديث المؤشرات");
  }

  function toggleThreshold(key: string) {
    setThresholds(prev => prev.map(t => t.key === key ? { ...t, enabled: !t.enabled } : t));
  }

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">

      {showAddEntry && (
        <AddManualEntryModal onClose={() => setShowAddEntry(false)} onAdd={e => setEntries(prev => [e, ...prev])} />
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">المؤشرات المالية ومدخلات التحكم</h1>
        <Button variant="outline" size="sm" className="font-arabic gap-2 w-fit" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "جاري التحديث..." : "تحديث الآن"}
        </Button>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-3 sm:p-5">
                <div className="mb-2 flex items-center justify-between sm:mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[10px] sm:h-9 sm:w-9 sm:rounded-[12px]"
                    style={{ background: `color-mix(in srgb, ${kpi.color} 12%, transparent)` }}>
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: kpi.color }} />
                  </div>
                  {kpi.up !== null && (
                    <span className="text-[10px] font-bold sm:text-xs" style={{ color: kpi.up ? "var(--success)" : "var(--destructive)" }}>
                      {kpi.change}
                    </span>
                  )}
                  {kpi.up === null && <Badge variant="default" className="font-arabic text-[10px]">{kpi.change}</Badge>}
                </div>
                <p className="text-sm font-bold tabular-nums leading-tight break-all sm:text-xl" style={{ color: kpi.color }} dir="ltr">
                  {typeof kpi.value === "number" ? formatCurrency(kpi.value) : kpi.value}
                </p>
                <p className="mt-1 text-[10px] text-[var(--muted-foreground)] font-arabic leading-snug sm:text-xs">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sustainability score + Goals + Alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4">مؤشر الاستدامة المالية</h2>
            <div className="flex items-center gap-5">
              <ScoreRing value={SUSTAINABILITY_SCORE.value} max={SUSTAINABILITY_SCORE.max} size={110} colorOverride="var(--primary)" />
              <div className="flex-1 space-y-2.5">
                {SUSTAINABILITY_SCORE.subMetrics.map(m => (
                  <div key={m.key} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted-foreground)] font-arabic">{m.label}</span>
                    <span className="font-bold text-[var(--foreground)]">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4">أهداف مالية</h2>
            <div className="space-y-4">
              {FINANCIAL_GOALS.map(g => (
                <ProgressBar
                  key={g.key}
                  label={g.label}
                  valueLabel={`${g.current} / ${g.target} ${g.unit}`}
                  pct={g.progressPct}
                  color={g.status === "good" ? "var(--success)" : "var(--warning)"}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4">حدود التنبيه</h2>
            <div className="space-y-1">
              {thresholds.map(t => (
                <div key={t.key} className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="text-sm text-[var(--foreground)] font-arabic">{t.label}</p>
                    <p className="text-xs text-[var(--muted-foreground)] font-arabic">{t.sub}</p>
                  </div>
                  <Toggle checked={t.enabled} onCheckedChange={() => toggleThreshold(t.key)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario simulator */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-3">محاكي السيناريوهات</h2>
        <Card>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-[var(--foreground)] font-arabic">نمو الإيرادات الشهري</span>
                  <b className="tabular-nums" dir="ltr">{scenario.revenueGrowthPct > 0 ? "+" : ""}{scenario.revenueGrowthPct}%</b>
                </div>
                <Slider min={-10} max={20} value={scenario.revenueGrowthPct}
                  onChange={v => setScenario(prev => ({ ...prev, revenueGrowthPct: v }))} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-[var(--foreground)] font-arabic">خفض المصروفات التشغيلية</span>
                  <b className="tabular-nums" dir="ltr">{scenario.expenseReductionPct}%</b>
                </div>
                <Slider min={-20} max={10} value={scenario.expenseReductionPct}
                  onChange={v => setScenario(prev => ({ ...prev, expenseReductionPct: v }))} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-[var(--foreground)] font-arabic">تمويل إضافي مقترح</span>
                  <b className="tabular-nums" dir="ltr">{formatCurrency(scenario.additionalFinancing)}</b>
                </div>
                <Slider min={0} max={500_000} step={10_000} value={scenario.additionalFinancing}
                  onChange={v => setScenario(prev => ({ ...prev, additionalFinancing: v }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-6 sm:grid-cols-3">
              <Card className="bg-[var(--surface)]">
                <CardContent className="p-4">
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">مدار نقدي متوقّع</p>
                  <p className="text-lg font-bold text-[var(--foreground)] tabular-nums" dir="ltr">{scenarioResult.projectedRunwayMonths} شهر</p>
                </CardContent>
              </Card>
              <Card className="bg-[var(--surface)]">
                <CardContent className="p-4">
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">تصنيف ائتماني متوقّع</p>
                  <p className="text-lg font-bold text-[var(--foreground)]" dir="ltr">{scenarioResult.projectedCreditRating}</p>
                </CardContent>
              </Card>
              <Card className="bg-[var(--surface)]">
                <CardContent className="p-4">
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">مؤشر استدامة متوقّع</p>
                  <p className="text-lg font-bold text-[var(--foreground)] tabular-nums" dir="ltr">{scenarioResult.projectedSustainabilityScore} / 100</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual entries */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-3">مدخلات يدوية</h2>
        <Card>
          <CardContent className="p-5">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>الوصف</TableHeaderCell>
                  <TableHeaderCell>النوع</TableHeaderCell>
                  <TableHeaderCell>المبلغ</TableHeaderCell>
                  <TableHeaderCell>التاريخ</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{e.desc}</TableCell>
                    <TableCell><Badge variant={e.type === "income" ? "success" : "secondary"} className="font-arabic">{e.type === "income" ? "إيراد" : "مصروف"}</Badge></TableCell>
                    <TableCell><span dir="ltr">{formatCurrency(e.amount)}</span></TableCell>
                    <TableCell>{e.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" size="sm" className="mt-4 font-arabic gap-2" onClick={() => setShowAddEntry(true)}>
              <Plus className="h-4 w-4" />
              إضافة قيد يدوي
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
