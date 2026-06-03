"use client";

import { formatCurrency, formatDate } from "@/lib/utils/format";

interface ApprovalStage {
  name: string;
  role: string;
  approvedAt: string;
}

interface FilingDocumentProps {
  referenceNumber: string;
  companyName: string;
  companyNameEn?: string;
  commercialRegistration: string;
  taxNumber?: string;
  bankIban?: string;
  statementType: string;
  periodStart: string;
  periodEnd: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  approvalChain: ApprovalStage[];
  filedAt?: string;
}

export function FilingDocument({
  referenceNumber,
  companyName,
  companyNameEn,
  commercialRegistration,
  taxNumber,
  bankIban,
  statementType,
  periodStart,
  periodEnd,
  totalRevenue,
  totalExpenses,
  netProfit,
  approvalChain,
  filedAt,
}: FilingDocumentProps) {
  const today = filedAt || new Date().toISOString();
  const verificationCode = `FS-${commercialRegistration.slice(-4)}-${new Date().getFullYear()}-${referenceNumber.slice(-4)}`;

  return (
    <div className="rounded-[18px] border-2 border-[var(--border)] bg-white overflow-hidden" dir="rtl">
      {/* Header band */}
      <div className="bg-[color:color-mix(in_srgb,var(--primary)_6%,transparent)] border-b-2 border-[var(--border)] px-8 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-black text-[var(--foreground)] font-arabic">{companyName}</p>
            {companyNameEn && (
              <p className="text-sm text-[var(--muted-foreground)]" dir="ltr">{companyNameEn}</p>
            )}
            <p className="text-xs text-[var(--muted-foreground)] font-arabic mt-1">
              س.ت: {commercialRegistration}
            </p>
          </div>
          <div className="text-end">
            <p className="text-sm font-bold text-[var(--foreground)] font-arabic">وزارة التجارة والاستثمار</p>
            <p className="text-xs text-[var(--muted-foreground)] font-arabic">المملكة العربية السعودية</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Document title */}
        <div className="text-center">
          <h1 className="text-xl font-black text-[var(--foreground)] font-arabic">وثيقة تعميد الإيداع الرسمي</h1>
          <div className="mt-2 mx-auto h-0.5 w-24 rounded-full bg-[var(--primary)]" />
        </div>

        {/* Reference + date */}
        <div className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--muted)] px-5 py-3">
          <div>
            <p className="text-xs text-[var(--muted-foreground)] font-arabic">رقم المرجع</p>
            <p className="text-sm font-bold text-[var(--foreground)]" dir="ltr">{referenceNumber}</p>
          </div>
          <div className="text-end">
            <p className="text-xs text-[var(--muted-foreground)] font-arabic">تاريخ الإيداع</p>
            <p className="text-sm font-bold text-[var(--foreground)] font-arabic">{formatDate(today)}</p>
          </div>
        </div>

        {/* Company details */}
        <div>
          <p className="text-xs font-bold text-[var(--muted-foreground)] font-arabic uppercase tracking-wider mb-3 px-1">
            بيانات الشركة
          </p>
          <div className="space-y-2">
            {[
              { label: "الاسم التجاري", value: companyName },
              { label: "السجل التجاري", value: commercialRegistration, ltr: true },
              ...(taxNumber ? [{ label: "الرقم الضريبي", value: taxNumber, ltr: true }] : []),
              ...(bankIban ? [{ label: "رقم الآيبان", value: bankIban, ltr: true }] : []),
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-[10px] bg-[var(--muted)] px-4 py-2.5">
                <span className="text-sm text-[var(--muted-foreground)] font-arabic">{row.label}</span>
                <span className={`text-sm font-bold text-[var(--foreground)] ${row.ltr ? "" : "font-arabic"}`} dir={(row as any).ltr ? "ltr" : undefined}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Statement details */}
        <div>
          <p className="text-xs font-bold text-[var(--muted-foreground)] font-arabic uppercase tracking-wider mb-3 px-1">
            تفاصيل القائمة المالية
          </p>
          <div className="space-y-2">
            {[
              { label: "نوع القائمة", value: statementType },
              { label: "بداية الفترة", value: formatDate(periodStart) },
              { label: "نهاية الفترة", value: formatDate(periodEnd) },
              { label: "إجمالي الإيرادات", value: formatCurrency(totalRevenue), color: "var(--success)" },
              { label: "إجمالي المصروفات", value: formatCurrency(totalExpenses), color: "var(--destructive)" },
              { label: "صافي الربح", value: formatCurrency(netProfit), color: netProfit >= 0 ? "var(--primary)" : "var(--destructive)", bold: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-[10px] bg-[var(--muted)] px-4 py-2.5">
                <span className="text-sm text-[var(--muted-foreground)] font-arabic">{row.label}</span>
                <span
                  className={`text-sm tabular-nums font-arabic ${(row as any).bold ? "font-black" : "font-bold"}`}
                  style={{ color: (row as any).color || "var(--foreground)" }}
                  dir="ltr"
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Approval chain */}
        <div>
          <p className="text-xs font-bold text-[var(--muted-foreground)] font-arabic uppercase tracking-wider mb-3 px-1">
            سلسلة الاعتماد
          </p>
          <div className="space-y-3">
            {approvalChain.map((stage, idx) => (
              <div key={idx} className="rounded-[12px] border border-[var(--border)] px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-black text-white">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-[var(--foreground)] font-arabic">{stage.name}</span>
                    <span className="text-xs text-[var(--muted-foreground)] font-arabic">— {stage.role}</span>
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)] font-arabic">{formatDate(stage.approvedAt)}</span>
                </div>
                <div className="h-px border-b border-dashed border-[var(--border)] mt-3" />
                <p className="text-[11px] text-[var(--muted-foreground)] font-arabic mt-1 text-end">التوقيع</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: QR + seal + code */}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-[8px] border-2 border-[var(--border)] bg-[var(--muted)]">
            <p className="text-[9px] text-center text-[var(--muted-foreground)] font-arabic leading-tight px-1">
              رمز<br />التحقق<br />QR
            </p>
          </div>
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--primary)] mx-auto mb-1">
              <p className="text-[8px] text-center text-[var(--primary)] font-bold font-arabic leading-tight px-1">
                وزارة<br />التجارة
              </p>
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)] font-arabic">الختم الرسمي</p>
          </div>
          <div className="text-end">
            <p className="text-[11px] text-[var(--muted-foreground)] font-arabic">رمز التحقق</p>
            <p className="text-xs font-bold text-[var(--foreground)]" dir="ltr">{verificationCode}</p>
            <p className="text-[10px] text-[var(--muted-foreground)] font-arabic mt-1">
              هذه الوثيقة رسمية ومعتمدة إلكترونياً
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
