"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Landmark, RefreshCw, Plus, CheckCircle2, Link2Off,
  Wallet, TrendingUp, TrendingDown, AlertCircle,
  ExternalLink, MoreHorizontal, Clock, ShieldCheck,
  KeyRound, ListChecks, X, Gauge, Droplets, Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";
import { BANKS, AVAILABLE_TO_CONNECT, RECENT_TRANSACTIONS, CATEGORIZED_TRANSACTIONS, BANKING_SUMMARY } from "@/lib/mock";
import type { BankSource } from "@/lib/mock";
import { ListItemRow } from "@/components/shared/ListItemRow";

// ─── Initial data (sourced from lib/mock, the shared single source of truth) ──

const initialBanks: BankSource[] = BANKS;
const availableToConnect = AVAILABLE_TO_CONNECT;
const recentTransactions = RECENT_TRANSACTIONS;
const categorizedTransactions = CATEGORIZED_TRANSACTIONS;

// ─── Connect Modal (3 steps) ──────────────────────────────────────────────────

type ConnectStep = "permissions" | "auth" | "success";

function ConnectModal({
  bankName,
  bankColor,
  onClose,
  onConnected,
}: {
  bankName: string;
  bankColor: string;
  onClose: () => void;
  onConnected: () => void;
}) {
  const [step, setStep] = useState<ConnectStep>("permissions");
  const [loading, setLoading] = useState(false);

  const permissions = [
    "عرض أرصدة الحسابات",
    "عرض تاريخ المعاملات (آخر 12 شهر)",
    "تلقي إشعارات الحركات الفورية",
  ];

  async function handleAuth() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setStep("success");
  }

  async function handleDone() {
    onConnected();
    onClose();
    toast.success(`تم ربط ${bankName} بنجاح — ستظهر البيانات خلال دقائق`);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md p-0" dir="rtl">
        <DialogHeader className="border-b border-[var(--border)] px-5 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white font-bold text-sm"
              style={{ background: bankColor }}>
              {bankName[0]}
            </div>
            <DialogTitle className="font-arabic text-base">ربط {bankName}</DialogTitle>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--muted)]">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 px-5 pt-4">
          {(["permissions", "auth", "success"] as ConnectStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${step === s
                  ? "bg-[var(--primary)] text-white"
                  : (["permissions", "auth", "success"].indexOf(step) > i)
                    ? "bg-[var(--success)] text-white"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                }`}>
                {(["permissions", "auth", "success"].indexOf(step) > i)
                  ? <CheckCircle2 className="h-3.5 w-3.5" />
                  : i + 1}
              </div>
              {i < 2 && <div className={`h-0.5 w-8 rounded-full transition-all ${(["permissions", "auth", "success"].indexOf(step) > i) ? "bg-[var(--success)]" : "bg-[var(--border)]"
                }`} />}
            </div>
          ))}
        </div>

        <div className="p-5">
          {/* Step 1: Permissions */}
          {step === "permissions" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-[var(--foreground)] font-arabic mb-1">الصلاحيات المطلوبة</h3>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                  منصة ركائز ستطلب الصلاحيات التالية من {bankName} بموافقتك:
                </p>
              </div>
              <div className="space-y-2">
                {permissions.map(p => (
                  <div key={p} className="flex items-center gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0" />
                    <span className="text-sm text-[var(--foreground)] font-arabic">{p}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-[10px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_5%,transparent)] px-4 py-3 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--muted-foreground)] font-arabic leading-relaxed">
                  نستخدم بروتوكول Open Banking المعتمد من ساما. لا نطلع على كلمات مرورك ولا نملك صلاحية إجراء معاملات.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 font-arabic" onClick={onClose}>إلغاء</Button>
                <Button className="flex-1 font-arabic gap-2" onClick={() => setStep("auth")}>
                  <ListChecks className="h-4 w-4" />
                  موافق، تابع
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Auth */}
          {step === "auth" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-[var(--foreground)] font-arabic mb-1">تأكيد الهوية</h3>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                  سيتم توجيهك إلى بوابة {bankName} الآمنة للمصادقة
                </p>
              </div>
              <div className="rounded-[14px] border-2 border-dashed border-[var(--border)] bg-[var(--muted)] p-6 flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[16px] text-white font-bold text-xl"
                  style={{ background: bankColor }}>
                  {bankName[0]}
                </div>
                <div>
                  <p className="font-bold text-[var(--foreground)] font-arabic">{bankName}</p>
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-1">
                    صفحة موافقة Open Banking الآمنة
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />
                  <span className="text-xs text-[var(--success)] font-arabic">اتصال مشفّر TLS 1.3</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 font-arabic" onClick={() => setStep("permissions")}>رجوع</Button>
                <Button className="flex-1 font-arabic gap-2" onClick={handleAuth} disabled={loading}>
                  {loading ? (
                    <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />جاري التحقق...</>
                  ) : (
                    <><KeyRound className="h-4 w-4" />فتح بوابة البنك</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="space-y-4 text-center">
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)]">
                  <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--foreground)] font-arabic text-lg">تم الربط بنجاح!</h3>
                  <p className="text-sm text-[var(--muted-foreground)] font-arabic mt-1">
                    {bankName} مربوط الآن بمنصة ركائز
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-right">
                {["جاري جلب أرصدة الحسابات...", "جاري تحليل المعاملات الأخيرة...", "جاري تحديث التقرير الائتماني..."].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-[10px] bg-[var(--surface)] border border-[var(--border)] px-4 py-2.5">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent shrink-0" />
                    <span className="text-xs text-[var(--muted-foreground)] font-arabic">{item}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full font-arabic gap-2" onClick={handleDone}>
                <CheckCircle2 className="h-4 w-4" />
                رائع، عرض البيانات
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BankPage() {
  const [banks, setBanks] = useState<BankSource[]>(initialBanks);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [connectTarget, setConnectTarget] = useState<{ name: string; color: string } | null>(null);

  const connected = banks.filter(b => b.status === "connected");
  const totalBalance = connected.reduce((s, b) => s + b.balance, 0);
  const totalIn = connected.reduce((s, b) => s + b.monthlyIn, 0);
  const totalOut = connected.reduce((s, b) => s + b.monthlyOut, 0);

  async function handleSync(id: string) {
    setSyncing(id);
    await new Promise(r => setTimeout(r, 1800));
    setSyncing(null);
    toast.success("تمت مزامنة البيانات بنجاح");
  }

  function handleConnected(bankName: string) {
    setBanks(prev => prev.map(b =>
      b.name === bankName
        ? { ...b, status: "connected", lastSync: new Date().toISOString().slice(0, 16).replace("T", " "), balance: 320_000, monthlyIn: 120_000, monthlyOut: 58_000 }
        : b
    ));
  }

  function openConnect(name: string, color: string) {
    setConnectTarget({ name, color });
  }

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">

      {/* Connect modal */}
      {connectTarget && (
        <ConnectModal
          bankName={connectTarget.name}
          bankColor={connectTarget.color}
          onClose={() => setConnectTarget(null)}
          onConnected={() => handleConnected(connectTarget.name)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">المصرفية المفتوحة</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic">
            اجمع بيانات منشأتك من بنوكها وبوابات الدفع في مكان واحد
          </p>
        </div>
        <Button size="sm" className="font-arabic gap-2 w-fit"
          onClick={() => openConnect("مصرف الإنماء", "#005CA9")}>
          <Plus className="h-4 w-4" />
          ربط مصدر جديد
        </Button>
      </div>

      {/* Aggregated summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: "إجمالي الأرصدة المجمّعة", value: totalBalance, color: "var(--primary)", icon: Wallet, sub: `من ${connected.length} مصادر`, isCurrency: true },
          { label: "الواردات (30 يوم)", value: totalIn, color: "var(--success)", icon: TrendingUp, sub: "عبر كل المصادر", isCurrency: true },
          { label: "المدفوعات (30 يوم)", value: totalOut, color: "var(--destructive)", icon: TrendingDown, sub: "عبر كل المصادر", isCurrency: true },
          { label: "متوسط صافي الرصيد اليومي (30 يوم)", value: BANKING_SUMMARY.avgDailyNetBalance, color: "var(--primary)", icon: Gauge, sub: "جديد", isCurrency: true, isNew: true },
          { label: "نسبة السيولة", value: BANKING_SUMMARY.liquidityRatio, color: "var(--success)", icon: Droplets, sub: "جديد", isCurrency: false, isNew: true },
        ].map(({ label, value, color, icon: Icon, sub, isCurrency, isNew }) => (
          <Card key={label} className={label === "إجمالي الأرصدة المجمّعة" ? "border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_4%,transparent)]" : ""}>
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] sm:h-9 sm:w-9 sm:rounded-[12px]"
                  style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color }} />
                </div>
                <p className="text-[10px] text-[var(--muted-foreground)] font-arabic sm:text-xs leading-snug">{label}</p>
              </div>
              <p className="text-sm font-bold tabular-nums break-all sm:text-2xl" style={{ color }} dir="ltr">
                {isCurrency ? formatCurrency(value) : `${value}x`}
              </p>
              {isNew ? (
                <Badge variant="secondary" className="mt-1 font-arabic text-[10px]">{sub}</Badge>
              ) : (
                <p className="text-[10px] text-[var(--muted-foreground)] font-arabic mt-1 sm:text-xs">{sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {/* Connected sources */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
                المصادر المربوطة
              </h2>
              <div className="space-y-3">
                {banks.map((bank) => (
                  <div key={bank.id}
                    className={`rounded-[14px] border p-4 transition-colors ${bank.status === "connected"
                        ? "border-[var(--border)] bg-[var(--surface)]"
                        : "border-dashed border-[var(--border)] bg-[var(--muted)]"
                      }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-white font-bold text-sm"
                          style={{ background: bank.color }}>
                          {bank.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-[var(--foreground)] font-arabic text-sm">{bank.name}</p>
                            <Badge variant={bank.type === "gateway" ? "secondary" : "outline"} className="font-arabic text-[11px]">
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
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                            onClick={() => handleSync(bank.id)} disabled={syncing === bank.id}>
                            <RefreshCw className={`h-3.5 w-3.5 ${syncing === bank.id ? "animate-spin" : ""}`} />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                            onClick={() => toast.info("إدارة الاتصال — المزيد من الخيارات قريباً")}>
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="font-arabic text-xs shrink-0 gap-1.5"
                          onClick={() => openConnect(bank.name, bank.color)}>
                          <Link2Off className="h-3.5 w-3.5" />
                          ربط الآن
                        </Button>
                      )}
                    </div>

                    {bank.status === "connected" && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div className="rounded-[10px] bg-[var(--card)] border border-[var(--border)] px-3 py-2">
                          <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">الرصيد</p>
                          <p className="text-sm font-bold text-[var(--foreground)] tabular-nums" dir="ltr">{formatCurrency(bank.balance)}</p>
                        </div>
                        <div className="rounded-[10px] bg-[var(--card)] border border-[var(--border)] px-3 py-2">
                          <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">وارد/شهر</p>
                          <p className="text-sm font-bold text-[var(--success)] tabular-nums" dir="ltr">+{formatCurrency(bank.monthlyIn)}</p>
                        </div>
                        <div className="rounded-[10px] bg-[var(--card)] border border-[var(--border)] px-3 py-2">
                          <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">صادر/شهر</p>
                          <p className="text-sm font-bold text-[var(--destructive)] tabular-nums" dir="ltr">-{formatCurrency(bank.monthlyOut)}</p>
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
              <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-4 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[var(--border)]" />
                آخر المعاملات المجمّعة
              </h2>
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <ListItemRow
                    key={tx.id}
                    icon={tx.type === "credit" ? "+" : "-"}
                    iconBg={tx.type === "credit" ? "color-mix(in srgb, var(--success) 14%, transparent)" : "color-mix(in srgb, var(--destructive) 12%, transparent)"}
                    title={tx.desc}
                    sub={`${tx.bank} · ${tx.date}`}
                    right={
                      <span className="text-xs font-bold tabular-nums sm:text-sm"
                        style={{ color: tx.type === "credit" ? "var(--success)" : "var(--destructive)" }} dir="ltr">
                        {tx.type === "credit" ? "+" : ""}{formatCurrency(Math.abs(tx.amount))}
                      </span>
                    }
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI-categorized transactions */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                تصنيف تلقائي للمعاملات
                <Badge variant="default" className="font-arabic text-[10px]">جديد</Badge>
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] font-arabic mb-4">آخر المعاملات المجمّعة، مصنّفة تلقائياً بالذكاء الاصطناعي</p>
              <div className="space-y-2">
                {categorizedTransactions.map((tx) => (
                  <ListItemRow
                    key={tx.id}
                    icon={tx.type === "credit" ? "+" : "-"}
                    iconBg={tx.type === "credit" ? "color-mix(in srgb, var(--success) 14%, transparent)" : "color-mix(in srgb, var(--destructive) 12%, transparent)"}
                    title={tx.desc}
                    sub={`${tx.category} · ${tx.bank}`}
                    right={
                      <span className="text-xs font-bold tabular-nums sm:text-sm"
                        style={{ color: tx.type === "credit" ? "var(--success)" : "var(--destructive)" }} dir="ltr">
                        {tx.type === "credit" ? "+" : ""}{formatCurrency(Math.abs(tx.amount))}
                      </span>
                    }
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right panel */}
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
                  <div key={src.name}
                    className="flex items-center justify-between rounded-[12px] border border-dashed border-[var(--border)] bg-[var(--muted)] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white font-bold text-xs"
                        style={{ background: src.color }}>
                        {src.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)] font-arabic">{src.name}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">{src.type === "gateway" ? "بوابة دفع" : "بنك"}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="font-arabic text-xs h-7 px-3 gap-1"
                      onClick={() => openConnect(src.name, src.color)}>
                      <ExternalLink className="h-3 w-3" />
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
