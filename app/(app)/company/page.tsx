"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Landmark, Save } from "lucide-react";
import { toast } from "sonner";

export default function CompanyPage() {
  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">بيانات الشركة</h1>
        <p className="text-sm text-[var(--muted-foreground)] font-arabic">معلومات الشركة والحساب البنكي والسجل التجاري</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Company info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                <Building2 className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">بيانات الشركة</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم الشركة بالعربية</Label>
                <Input defaultValue="شركة الأفق للتقنية والاستشارات" />
              </div>
              <div className="space-y-2">
                <Label>اسم الشركة بالإنجليزية</Label>
                <Input defaultValue="Horizon Technology & Consulting Co." dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>رقم السجل التجاري</Label>
                <Input defaultValue="1010123456" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>الرقم الضريبي</Label>
                <Input defaultValue="300012345600003" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input defaultValue="الرياض، حي العليا، طريق الملك فهد" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank account */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)]">
                <Landmark className="h-5 w-5 text-[var(--success)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">الحساب البنكي</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم البنك</Label>
                <Input defaultValue="بنك الراجحي" />
              </div>
              <div className="space-y-2">
                <Label>رقم الآيبان (IBAN)</Label>
                <Input defaultValue="SA44 2000 0001 2345 6789 1234" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>رقم الحساب</Label>
                <Input defaultValue="0012345678901" dir="ltr" />
              </div>
              <div className="rounded-[12px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_6%,transparent)] px-4 py-3">
                <p className="text-xs font-bold text-[var(--primary)] font-arabic mb-1">حالة الربط: نشط</p>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic">
                  مرتبط عبر Open Banking API — آخر مزامنة: منذ ساعتين
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button className="font-arabic gap-2" onClick={() => toast.success("تم حفظ البيانات")}>
          <Save className="h-4 w-4" />
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}
