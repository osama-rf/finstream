"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Landmark, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [form, setForm] = useState({
    company_name_ar: "",
    company_name_en: "",
    commercial_registration: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name_ar || !form.commercial_registration || !form.first_name || !form.email || !form.password) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (form.password.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    if (form.password !== confirmPassword) {
      toast.error("كلمة المرور وتأكيدها غير متطابقتين");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("تم إنشاء الحساب بنجاح");
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const loginJson = await loginRes.json();
        if (loginJson.success) {
          router.push("/bank");
        } else {
          router.push("/login");
        }
      } else {
        toast.error(json.error || "فشل إنشاء الحساب");
      }
    } catch {
      toast.error("حدث خطأ. يرجى المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" dir="ltr">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[var(--muted)] flex-col justify-between p-14 border-r border-[var(--border)]"
        dir="rtl"
      >
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[var(--primary)]/8 blur-[80px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[var(--primary)]/5 blur-[60px]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[var(--primary)]">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black text-[var(--foreground)] font-arabic">فين ستريم</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-black leading-[1.4] text-[var(--foreground)] font-arabic xl:text-5xl">
            سجّل شركتك
            <br />
            <span className="text-[var(--primary)]">وابدأ فوراً</span>
          </h2>
          <p className="text-base leading-8 text-[var(--muted-foreground)] font-arabic max-w-sm">
            حساب واحد يعطيك ربطاً بنكياً كاملاً، محاسبة تلقائية، قوائم مالية، وإيداع رسمي لوزارة التجارة.
          </p>
          <div className="space-y-2">
            {[
              "مزامنة تلقائية مع حسابك البنكي",
              "تصنيف المعاملات بالذكاء الاصطناعي",
              "قوائم مالية معتمدة بضغطة زر",
              "إيداع رسمي لوزارة التجارة",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                <span className="text-sm text-[var(--foreground)] font-arabic">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-[var(--muted-foreground)] font-arabic">
          © 2026 فين ستريم. جميع الحقوق محفوظة.
        </p>
      </div>

      {/* Right — Form */}
      <div
        className="flex flex-1 flex-col items-center justify-center bg-[var(--background)] px-6 py-10 sm:px-10 overflow-y-auto"
        dir="rtl"
      >
        {/* Mobile logo */}
        <div className="mb-6 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--primary)]">
            <Landmark className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-black text-[var(--foreground)] font-arabic">فين ستريم</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-black text-[var(--foreground)] font-arabic">إنشاء حساب جديد</h1>
            <p className="mt-1.5 text-sm text-[var(--muted-foreground)] font-arabic">
              أنشئ حساب شركتك وابدأ فوراً
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Company section */}
            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 space-y-4">
              <p className="text-xs font-bold text-[var(--muted-foreground)] font-arabic">بيانات الشركة</p>

              <div className="space-y-2">
                <Label className="text-sm font-bold">اسم الشركة بالعربية *</Label>
                <Input
                  placeholder="شركة الأفق للتقنية"
                  value={form.company_name_ar}
                  onChange={(e) => set("company_name_ar", e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">اسم الشركة بالإنجليزية</Label>
                <Input
                  placeholder="Horizon Technology Co."
                  value={form.company_name_en}
                  onChange={(e) => set("company_name_en", e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">رقم السجل التجاري *</Label>
                <Input
                  placeholder="1010123456"
                  value={form.commercial_registration}
                  onChange={(e) => set("commercial_registration", e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                  dir="ltr"
                />
              </div>
            </div>

            {/* User section */}
            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 space-y-4">
              <p className="text-xs font-bold text-[var(--muted-foreground)] font-arabic">بياناتك الشخصية</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">الاسم الأول *</Label>
                  <Input
                    placeholder="خالد"
                    value={form.first_name}
                    onChange={(e) => set("first_name", e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">الاسم الأخير</Label>
                  <Input
                    placeholder="العمر"
                    value={form.last_name}
                    onChange={(e) => set("last_name", e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">البريد الإلكتروني *</Label>
                <Input
                  type="email"
                  placeholder="example@company.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  className="h-11"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">كلمة المرور *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="8 أحرف على الأقل"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                    className="h-11 pe-10"
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

              <div className="space-y-2">
                <Label className="text-sm font-bold">تأكيد كلمة المرور *</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="أعد كتابة كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                    className={`h-11 pe-10 ${confirmPassword && confirmPassword !== form.password ? "border-[var(--destructive)]" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== form.password && (
                  <p className="text-xs text-[var(--destructive)] font-arabic">كلمة المرور غير متطابقة</p>
                )}
              </div>
            </div>

            <Button type="submit" className="h-11 w-full text-sm font-black" disabled={isLoading}>
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  جاري إنشاء الحساب...
                </span>
              ) : (
                "إنشاء الحساب"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted-foreground)] font-arabic">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-black text-[var(--primary)] hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
