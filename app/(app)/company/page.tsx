"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UserAvatar } from "@/components/UserAvatar";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { Building2, Landmark, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/contexts/UserContext";
import type { UserRole } from "@/lib/types/database";
import { COMPANY_PROFILE, TEAM, ACTIVITY_LOG, BANKS } from "@/lib/mock";

const permissionBadgeVariant = {
  navy: "default",
  green: "success",
  gray: "secondary",
  amber: "warning",
} as const;

export default function CompanyPage() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "", role: "accountant" as UserRole,
  });

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name || !form.email || !form.password) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (form.password.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("تم إنشاء الحساب بنجاح");
        setOpen(false);
        setForm({ first_name: "", last_name: "", email: "", password: "", role: "accountant" });
      } else {
        toast.error(json.error || "فشل إنشاء الحساب");
      }
    } catch {
      toast.error("حدث خطأ. يرجى المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  }

  const activityIconMap: Record<string, string> = { check: "✓", link: "🔗", share: "📤" };

  return (
    <div className="space-y-6 page-transition-shell" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-arabic">الشركة والفريق</h1>
        <Button size="sm" className="font-arabic w-fit" onClick={() => setOpen(true)}>
          دعوة عضو
        </Button>
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
                <Label>اسم الشركة</Label>
                <Input defaultValue={COMPANY_PROFILE.name} />
              </div>
              <div className="space-y-2">
                <Label>رقم السجل التجاري</Label>
                <Input defaultValue={COMPANY_PROFILE.commercialRegistration} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>الرقم الضريبي</Label>
                <Input defaultValue={COMPANY_PROFILE.taxNumber} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>القطاع</Label>
                <Input defaultValue={COMPANY_PROFILE.sector} />
              </div>
              <div className="space-y-2">
                <Label>الخدمات المقدمة</Label>
                <Input defaultValue={COMPANY_PROFILE.servicesOffered} />
              </div>
            </div>
            <Button className="mt-4 w-full font-arabic" onClick={() => toast.success("تم حفظ التغييرات")}>
              حفظ التغييرات
            </Button>
          </CardContent>
        </Card>

        {/* Bank accounts */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)]">
                  <Landmark className="h-5 w-5 text-[var(--success)]" />
                </div>
                <h2 className="text-base font-bold text-[var(--foreground)] font-arabic">الحسابات البنكية</h2>
              </div>
              <a href="/control-center" className="text-xs font-bold text-[var(--primary)] font-arabic">إدارة الربط</a>
            </div>
            <div className="space-y-2">
              {BANKS.map(bank => (
                <div key={bank.id} className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white font-bold text-xs" style={{ background: bank.color }}>
                      {bank.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)] font-arabic">{bank.name}</p>
                      {bank.iban && <p className="text-[11px] text-[var(--muted-foreground)]" dir="ltr">{bank.iban}</p>}
                    </div>
                  </div>
                  <Badge variant={bank.status === "connected" ? "success" : "secondary"} className="font-arabic">
                    {bank.status === "connected" ? "نشط" : "غير مربوط"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team table */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-3">فريق العمل</h2>
        <Card>
          <CardContent className="p-5">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>العضو</TableHeaderCell>
                  <TableHeaderCell>الدور</TableHeaderCell>
                  <TableHeaderCell>الصلاحية</TableHeaderCell>
                  <TableHeaderCell>آخر نشاط</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {TEAM.map(member => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          user={{ id: member.id, first_name: member.name.split(" ")[0], last_name: member.name.split(" ")[1] ?? "" }}
                          className="h-8 w-8"
                          textClassName="text-xs"
                          alt={member.name}
                        />
                        <span>{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell><Badge variant={permissionBadgeVariant[member.permissionVariant]} className="font-arabic">{member.permissionLabel}</Badge></TableCell>
                    <TableCell>{member.lastActivity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Activity log */}
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] font-arabic mb-3">سجلّ النشاط</h2>
        <Card>
          <CardContent className="p-5 space-y-2">
            {ACTIVITY_LOG.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-sm">
                  {activityIconMap[entry.icon] ?? "•"}
                </div>
                <div>
                  <p className="text-sm text-[var(--foreground)] font-arabic">{entry.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">{entry.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Add member dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة عضو جديد</DialogTitle>
            <DialogDescription>سيتم إنشاء حساب له في المنصة فوراً</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-bold">الاسم الأول *</Label>
                <Input
                  placeholder="أحمد"
                  value={form.first_name}
                  onChange={(e) => setField("first_name", e.target.value)}
                  disabled={isLoading}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">الاسم الأخير</Label>
                <Input
                  placeholder="العمر"
                  value={form.last_name}
                  onChange={(e) => setField("last_name", e.target.value)}
                  disabled={isLoading}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold">البريد الإلكتروني *</Label>
              <Input
                type="email"
                placeholder="ahmed@company.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                disabled={isLoading}
                className="h-10"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold">الصلاحية *</Label>
              <select
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
                disabled={isLoading}
                className="flex h-10 w-full rounded-[10px] border border-[var(--input)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--foreground)] font-arabic focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors hover:border-[var(--primary)]"
              >
                <option value="accountant">محاسب</option>
                <option value="auditor">مدقق حسابات</option>
                <option value="company_admin">مدير الشركة</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold">كلمة المرور *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="8 أحرف على الأقل"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  disabled={isLoading}
                  className="h-10 pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" className="font-arabic" onClick={() => setOpen(false)} disabled={isLoading}>
                إلغاء
              </Button>
              <Button type="submit" className="font-arabic" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    جاري الإنشاء...
                  </span>
                ) : "إنشاء الحساب"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
