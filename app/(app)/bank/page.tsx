"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Landmark, RefreshCw, Plus, CheckCircle2, Link2Off,
  Wallet, TrendingUp, TrendingDown, AlertCircle,
  ExternalLink, MoreHorizontal, Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";

const banks = [
  {
    id: "1",
    name: "بنك الراجحي",
    code: "RJHI",
    balance: 1_840_000,
    currency: "SAR",
    iban: "SA44 2000 0001 2345 6789 1234",
    status: "connected" as const,
    lastSync: "2026-06-28 10:32",
    monthlyIn: 650_000,
    monthlyOut: 312_000,
    color: "#006838",
    type: "bank",
  },
  {
    id: "2",
    name: "البنك الأهلي السعودي",
    code: "ANB",
    balance: 620_500,
    currency: "SAR",
    iban: "SA03 8000 0000 6080 1016 7519",
    status: "connected" as const,
    lastSync: "2026-06-28 06:15",
    monthlyIn: 197_500,
    monthlyOut: 111_200,
    color: "#00574B",
    type: "bank",
  },
  {
    id: "3",
    name: "STC Pay",
    code: "STCPAY",
    balance: 98_200,
    currency: "SAR",
    iban: null,
    status: "connected" as const,
    lastSync: "2026-06-28 11:05",
    monthlyIn: 43_000,
    monthlyOut: 21_800,
    color: "#7B2D8B",
    type: "gateway",
  },
  {
    id: "4",
    name: "بنك الرياض",
    code: "RIBL",
    balance: 0,
    currency: "SAR",
    iban: "SA04 2000 0001 9999 8888 7777",
    status: "disconnected" as const,
    lastSync: null,
    monthlyIn: 0,
    monthlyOut: 0,
    color: "#C8102E",
    type: "bank",
  },
];

const availableToConnect = [
  { name: "Tamara", nameAr: "تمارة", color: "#2B3A8C", type: "gateway" },
  { name: "Tabby", nameAr: "تابي", color: "#3DBE9E", type: "gateway" },
  { name: "مصرف الإنماء", color: "#005CA9", type: "bank" },
  { name: "بنك البلاد", color: "#4A1942", type: "bank" },
];

const recentTransactions = [
  { id: "t1", bank: "بنك الراجحي", desc: "تحويل وارد — شركة الأفق للتجارة", amount: 250_000, type: "credit" as const, date: "2026-06-27" },
  { id: "t2", bank: "البنك الأهلي", desc: "مصروف استضافة سحابية", amount: -3_200, type: "debit" as const, date: "2026-06-27" },
  { id: "t3", bank: "STC Pay", desc: "إيراد مبيعات إلكترونية", amount: 18_400, type: "credit" as const, date: "2026-06-26" },
  { id: "t4", bank: "بنك الراجحي", desc: "رواتب موظفين — يونيو", amount: -92_000, type: "debit" as const, date: "2026-06-25" },
  { id: "t5", bank: "البنك الأهلي", desc: "إيراد خدمات استشارية", amount: 65_000, type: "credit" as const, date: "2026-06-24" },
];

const connected = banks.filter(b => b.status === "connected");
const totalBalance = connected.reduce((s, b) => s + b.balance, 0);
const totalIn = connected.reduce((s, b) => s + b.monthlyIn, 0);
const totalOut = connected.reduce((s, b) => s + b.monthlyOut, 0);

export default function BankPage() {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  async function handleSync(id: string) {
    setSyncing(id);
    await new Promise(r => setTimeout(r, 1800));
    setSyncing(null);
    toast.success("تمت مزامنة البيانات بنجاح");
  }

  async function handleConnect(name: string) {
    setConnecting(name);
    await new Promise(r => setTimeout(r, 2000));
    setConnecting(null);
    toast.success(`تم بدء عملية ربط ${name} — أكمل الإذن في نافذة البنك`);
  }

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">المصرفية المفتوحة</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">
            اجمع بيانات منشأتك من بنوكها وبوابات الدفع في مكان واحد
          </p>
        </div>
        <Button size="sm" className="font-arabic gap-2 w-fit" onClick={() => toast.info("سيتم إضافة بنوك جديدة قريباً")}>
          <Plus className="h-4 w-4" />
          ربط مصدر جديد
        </Button>
      </div>

      {/* Aggregated summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)]">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary)] sm:h-9 sm:w-9 sm:rounded-[12px]">
                <Wallet className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] font-arabic sm:text-xs">إجمالي الأرصدة</p>
            </div>
            <p className="text-sm font-bold text-[var(--primary)] tabular-nums break-all sm:text-2xl" dir="ltr">
              {formatCurrency(totalBalance)}
            </p>
            <p className="text-[10px] text-[var(--muted-foreground)] font-arabic mt-1 sm:text-xs">من {connected.length} مصادر</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)] sm:h-9 sm:w-9 sm:rounded-[12px]">
                <TrendingUp className="h-3.5 w-3.5 text-[var(--success)] sm:h-4 sm:w-4" />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] font-arabic sm:text-xs">الواردات (30 يوم)</p>
            </div>
            <p className="text-sm font-bold text-[var(--success)] tabular-nums break-all sm:text-2xl" dir="ltr">{formatCurrency(totalIn)}</p>
            <p className="text-[10px] text-[var(--muted-foreground)] font-arabic mt-1 sm:text-xs">عبر كل المصادر</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[color:color-mix(in_srgb,var(--destructive)_12%,transparent)] sm:h-9 sm:w-9 sm:rounded-[12px]">
                <TrendingDown className="h-3.5 w-3.5 text-[var(--destructive)] sm:h-4 sm:w-4" />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] font-arabic sm:text-xs">المدفوعات (30 يوم)</p>
            </div>
            <p className="text-sm font-bold text-[var(--destructive)] tabular-nums break-all sm:text-2xl" dir="ltr">{formatCurrency(totalOut)}</p>
            <p className="text-[10px] text-[var(--muted-foreground)] font-arabic mt-1 sm:text-xs">عبر كل المصادر</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        {/* Connected sources */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
                المصادر المربوطة
              </h2>
              <div className="space-y-3">
                {banks.map((bank) => (
                  <div
                    key={bank.id}
                    className={`rounded-[14px] border p-4 transition-colors ${
                      bank.status === "connected"
                        ? "border-[var(--border)] bg-[var(--surface)]"
                        : "border-dashed border-[var(--border)] bg-[var(--muted)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-white font-bold text-sm"
                          style={{ background: bank.color }}
                        >
                          {bank.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-[var(--foreground)] font-arabic text-sm">{bank.name}</p>
                            <Badge
                              variant={bank.type === "gateway" ? "secondary" : "outline"}
                              className="font-arabic text-[11px]"
                            >
                              {bank.type === "gateway" ? "بوابة دفع" : "بنك"}
                            </Badge>
                          </div>
                          {bank.iban && (
                            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 font-arabic" dir="ltr">{bank.iban}</p>
                          )}
                        </div>
                      </div>

                      {bank.status === "connected" ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleSync(bank.id)}
                            disabled={syncing === bank.id}
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${syncing === bank.id ? "animate-spin" : ""}`} />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="font-arabic text-xs shrink-0"
                          onClick={() => handleConnect(bank.name)}
                          disabled={connecting === bank.name}
                        >
                          {connecting === bank.name ? (
                            <span className="flex items-center gap-1.5">
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              جاري الربط...
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <Link2Off className="h-3.5 w-3.5" />
                              ربط الآن
                            </span>
                          )}
                        </Button>
                      )}
                    </div>

                    {bank.status === "connected" && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div className="rounded-[10px] bg-[var(--card)] border border-[var(--border)] px-3 py-2">
                          <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">الرصيد</p>
                          <p className="text-sm font-bold text-[var(--foreground)] tabular-nums" dir="ltr">
                            {formatCurrency(bank.balance)}
                          </p>
                        </div>
                        <div className="rounded-[10px] bg-[var(--card)] border border-[var(--border)] px-3 py-2">
                          <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">وارد/شهر</p>
                          <p className="text-sm font-bold text-[var(--success)] tabular-nums" dir="ltr">
                            +{formatCurrency(bank.monthlyIn)}
                          </p>
                        </div>
                        <div className="rounded-[10px] bg-[var(--card)] border border-[var(--border)] px-3 py-2">
                          <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">صادر/شهر</p>
                          <p className="text-sm font-bold text-[var(--destructive)] tabular-nums" dir="ltr">
                            -{formatCurrency(bank.monthlyOut)}
                          </p>
                        </div>
                      </div>
                    )}

                    {bank.status === "connected" && bank.lastSync && (
                      <p className="mt-2 text-[11px] text-[var(--muted-foreground)] font-arabic flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        آخر مزامنة: {bank.lastSync}
                      </p>
                    )}

                    {bank.status === "disconnected" && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--destructive)] font-arabic">
                        <AlertCircle className="h-3.5 w-3.5" />
                        يحتاج ربطاً — البيانات غير محدّثة
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent transactions */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-[var(--foreground)] font-arabic flex items-center gap-2">
                  <div className="h-5 w-1 rounded-full bg-[var(--border)]" />
                  آخر المعاملات المجمّعة
                </h2>
              </div>
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 sm:px-4 sm:py-3">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black sm:h-8 sm:w-8"
                      style={{
                        background: tx.type === "credit"
                          ? "color-mix(in srgb, var(--success) 14%, transparent)"
                          : "color-mix(in srgb, var(--destructive) 12%, transparent)",
                        color: tx.type === "credit" ? "var(--success)" : "var(--destructive)",
                      }}
                    >
                      {tx.type === "credit" ? "+" : "-"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium text-[var(--foreground)] font-arabic sm:text-sm">{tx.desc}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)] font-arabic sm:text-xs">{tx.bank} · {tx.date}</p>
                    </div>
                    <span
                      className="text-xs font-bold tabular-nums shrink-0 sm:text-sm"
                      style={{ color: tx.type === "credit" ? "var(--success)" : "var(--destructive)" }}
                      dir="ltr"
                    >
                      {tx.type === "credit" ? "+" : ""}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: add more sources */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-bold text-[var(--foreground)] font-arabic mb-1 flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-[var(--border)]" />
                إضافة مصادر جديدة
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-4">
                كلما زادت المصادر المربوطة، كلما كان التقرير الائتماني أشمل وأدق
              </p>
              <div className="space-y-2">
                {availableToConnect.map((src) => (
                  <div
                    key={src.name}
                    className="flex items-center justify-between rounded-[12px] border border-dashed border-[var(--border)] bg-[var(--muted)] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white font-bold text-xs"
                        style={{ background: src.color }}
                      >
                        {(src.nameAr ?? src.name)[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)] font-arabic">{src.nameAr ?? src.name}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">
                          {src.type === "gateway" ? "بوابة دفع" : "بنك"}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-arabic text-xs h-7 px-3 gap-1"
                      onClick={() => handleConnect(src.nameAr ?? src.name)}
                      disabled={connecting === (src.nameAr ?? src.name)}
                    >
                      {connecting === (src.nameAr ?? src.name) ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <ExternalLink className="h-3 w-3" />
                      )}
                      ربط
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)]">
            <CardContent className="p-5">
              <CheckCircle2 className="h-8 w-8 text-[var(--primary)] mb-3" />
              <p className="text-sm font-bold text-[var(--foreground)] font-arabic mb-1">
                بياناتك محمية بالكامل
              </p>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic leading-relaxed">
                نستخدم بروتوكول Open Banking المعتمد من ساما. لا نخزّن كلمات مرورك — فقط صلاحية قراءة البيانات بموافقتك.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
