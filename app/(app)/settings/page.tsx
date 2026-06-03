"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User, Bell, Shield, Save } from "lucide-react";
import { useUser } from "@/lib/contexts/UserContext";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">الإعدادات</h1>
        <p className="text-sm text-[var(--muted-foreground)] font-arabic">إدارة حسابك وتفضيلات المنصة</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                <User className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">الملف الشخصي</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>الاسم الأول</Label>
                  <Input defaultValue={user?.first_name || ""} />
                </div>
                <div className="space-y-2">
                  <Label>الاسم الأخير</Label>
                  <Input defaultValue={user?.last_name || ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input defaultValue={user?.email || ""} dir="ltr" />
              </div>
            </div>
            <Button className="mt-4 font-arabic gap-2" onClick={() => toast.success("تم حفظ الملف الشخصي")}>
              <Save className="h-4 w-4" />
              حفظ
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--warning)_12%,transparent)]">
                <Settings className="h-5 w-5 text-[var(--warning)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">المظهر</h2>
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)] font-arabic">الوضع الداكن / الفاتح</p>
                <p className="text-xs text-[var(--muted-foreground)] font-arabic">تبديل مظهر واجهة التطبيق</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--destructive)_10%,transparent)]">
                <Shield className="h-5 w-5 text-[var(--destructive)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">الأمان</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>كلمة المرور الحالية</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور الجديدة</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>تأكيد كلمة المرور</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>
            <Button variant="outline" className="mt-4 font-arabic gap-2" onClick={() => toast.success("تم تحديث كلمة المرور")}>
              <Shield className="h-4 w-4" />
              تحديث كلمة المرور
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)]">
                <Bell className="h-5 w-5 text-[var(--success)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">الإشعارات</h2>
            </div>
            <div className="space-y-3">
              {[
                "إشعار عند مزامنة البيانات البنكية",
                "إشعار عند اكتمال التصنيف التلقائي",
                "إشعار عند طلب موافقة جديدة",
                "إشعار عند اكتمال الإيداع الرسمي",
              ].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <p className="text-sm text-[var(--foreground)] font-arabic">{item}</p>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded accent-[var(--primary)]"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
