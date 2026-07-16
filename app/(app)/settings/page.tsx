"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { Toggle } from "@/components/ui/toggle";
import { Settings, User, Bell, Shield, Save, CreditCard, Briefcase, Users2, Plus, Globe, Camera, Trash2 } from "lucide-react";
import { useUser } from "@/lib/contexts/UserContext";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SUBSCRIPTION, SERVICES, CLIENTS, NOTIFICATIONS } from "@/lib/mock";
import { formatCurrency } from "@/lib/utils/format";
import { UserAvatar } from "@/components/UserAvatar";

export default function SettingsPage() {
  const { user, updateUser } = useUser();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  function toggleNotification(key: string) {
    setNotifications(prev => prev.map(n => n.key === key ? { ...n, enabled: !n.enabled } : n));
  }

  function updateAvatar(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) { toast.error("اختر صورة بحجم أقل من 2 ميجابايت"); return; }
    const reader = new FileReader();
    reader.onload = () => { const value = String(reader.result); window.localStorage.setItem("rakaez-profile-avatar", value); updateUser({ avatar_url: value }); toast.success("تم تحديث الصورة الشخصية"); };
    reader.readAsDataURL(file);
  }

  function removeAvatar() { window.localStorage.removeItem("rakaez-profile-avatar"); updateUser({ avatar_url: null }); toast.success("تم حذف الصورة الشخصية"); }

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">الإعدادات</h1>
        <p className="text-sm text-[var(--muted-foreground)] font-arabic">تفضيلات الحساب، الأمان، والإشعارات</p>
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
              <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                <UserAvatar user={user} className="h-16 w-16" textClassName="text-lg" alt="الصورة الشخصية" />
                <div className="flex flex-wrap gap-2"><label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 text-xs font-medium text-[var(--primary-foreground)] font-arabic"><Camera className="h-3.5 w-3.5" />تغيير الصورة<input type="file" accept="image/*" className="hidden" onChange={event => updateAvatar(event.target.files?.[0])} /></label>{user?.avatar_url && <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={removeAvatar}><Trash2 className="h-3.5 w-3.5" />حذف</Button>}<p className="w-full text-[10px] text-[var(--muted-foreground)] font-arabic">PNG أو JPG، بحد أقصى 2 ميجابايت</p></div>
              </div>
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
              <p className="text-sm font-medium text-[var(--foreground)] font-arabic">الوضع الداكن / الفاتح</p>
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
              {notifications.map((n) => (
                <div key={n.key} className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <p className="text-sm text-[var(--foreground)] font-arabic">{n.label}</p>
                  <Toggle checked={n.enabled} onCheckedChange={() => toggleNotification(n.key)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Language & currency */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                <Globe className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">اللغة والعملة</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)] font-arabic">لغة الواجهة</span>
                <span className="text-sm font-bold text-[var(--foreground)] font-arabic">العربية</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)] font-arabic">العملة الأساسية</span>
                <span className="text-sm font-bold text-[var(--foreground)] font-arabic">ريال سعودي (SAR)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription & billing */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                <CreditCard className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">الاشتراك والفوترة</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)] font-arabic">الباقة الحالية</span>
                <span className="text-sm font-bold text-[var(--foreground)] font-arabic">{SUBSCRIPTION.planName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)] font-arabic">القيمة الشهرية</span>
                <span className="text-sm font-bold text-[var(--foreground)] tabular-nums" dir="ltr">{formatCurrency(SUBSCRIPTION.monthlyPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)] font-arabic">تجديد الاشتراك</span>
                <span className="text-sm font-bold text-[var(--foreground)] font-arabic">{SUBSCRIPTION.renewalDate}</span>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full font-arabic">إدارة الاشتراك والفواتير</Button>
          </CardContent>
        </Card>
      </div>

      {/* Services & pricing */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-3 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-[var(--primary)]" />
          الخدمات والأسعار
        </h2>
        <Card>
          <CardContent className="p-5">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>الخدمة</TableHeaderCell>
                  <TableHeaderCell>السعر</TableHeaderCell>
                  <TableHeaderCell>الحالة</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {SERVICES.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.price}</TableCell>
                    <TableCell><Badge variant={s.active ? "success" : "secondary"} className="font-arabic">{s.active ? "مفعّلة" : "متوقفة"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" size="sm" className="mt-4 font-arabic gap-2">
              <Plus className="h-4 w-4" />
              إضافة خدمة
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Client management */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-3 flex items-center gap-2">
          <Users2 className="h-4 w-4 text-[var(--primary)]" />
          العملاء
        </h2>
        <Card>
          <CardContent className="p-5">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>العميل</TableHeaderCell>
                  <TableHeaderCell>إجمالي التعاملات</TableHeaderCell>
                  <TableHeaderCell>آخر فاتورة</TableHeaderCell>
                  <TableHeaderCell>الحالة</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {CLIENTS.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell><span dir="ltr">{formatCurrency(c.totalTransactions)}</span></TableCell>
                    <TableCell>{c.lastInvoiceDate}</TableCell>
                    <TableCell><Badge variant={c.status === "active" ? "success" : "warning"} className="font-arabic">{c.status === "active" ? "نشط" : "متأخر السداد"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" size="sm" className="mt-4 font-arabic gap-2">
              <Plus className="h-4 w-4" />
              إضافة عميل
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
