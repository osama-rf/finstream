"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, LoaderCircle, Landmark, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/contexts/UserContext";

function LoginContent() {
  const router = useRouter();
  const { refetchUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("تم تسجيل الدخول بنجاح");
        await refetchUser();
        router.refresh();
        router.push("/control-center");
      } else {
        toast.error(json.error || "فشل تسجيل الدخول");
      }
    } catch {
      toast.error("حدث خطأ. يرجى المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" dir="ltr">
      {isLoading && (
        <div className="fixed inset-x-0 top-0 z-50">
          <div className="h-1 overflow-hidden bg-[var(--border)]">
            <div className="login-progress h-full w-1/3 rounded-full bg-[var(--primary)]" />
          </div>
        </div>
      )}

      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-[var(--muted)] flex-col justify-between p-14 border-r border-[var(--border)]"
        dir="rtl"
      >
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[var(--primary)]/8 blur-[80px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[var(--primary)]/5 blur-[60px]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[var(--primary)]">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black text-[var(--foreground)] font-arabic">منصة ركائز</span>
        </div>

        {/* Value props */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-black leading-[1.4] text-[var(--foreground)] font-arabic xl:text-5xl">
              بياناتك البنكية
              <br />
              <span className="text-[var(--primary)]">تحكي قصة نجاحك</span>
              <br />
              للبنوك
            </h2>
            <p className="text-base leading-8 text-[var(--muted-foreground)] font-arabic max-w-sm">
              وسيط المصرفية المفتوحة للمنشآت الصغيرة والمتوسطة — اجمع بياناتك من بنوكك المتعددة وحوّلها إلى تقرير ائتماني يمكّنك من الحصول على التمويل.
            </p>
          </div>

          {/* Flow cards */}
          <div className="space-y-3">
            {[
              { step: "1", title: "ربط البنوك وبوابات الدفع", desc: "اجمع بيانات منشأتك من بنوكك المتعددة في مكان واحد" },
              { step: "2", title: "تقرير مالي موحد", desc: "تحليل مؤشراتك المالية وإعداد تقرير جاهز للبنوك" },
              { step: "3", title: "مقارنة بمتوسط القطاع", desc: "قارن أداءك بمتوسطات القطاع عالمياً لدعم التحسين" },
              { step: "4", title: "قوائم مالية بالذكاء الاصطناعي", desc: "أنشئ قوائمك المالية وشاركها مع البنوك مباشرة" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--card)] px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-black text-white">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)] font-arabic">{item.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] font-arabic">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-[var(--muted-foreground)] font-arabic">
          © 2026 منصة ركائز. جميع الحقوق محفوظة.
        </p>
      </div>

      {/* Right — Form */}
      <div
        className="flex flex-1 flex-col items-center justify-center bg-[var(--background)] px-6 py-12 sm:px-10"
        dir="rtl"
      >
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--primary)]">
            <Landmark className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-black text-[var(--foreground)] font-arabic">منصة ركائز</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-[var(--foreground)] font-arabic">تسجيل الدخول</h1>
            <p className="mt-1.5 text-sm text-[var(--muted-foreground)] font-arabic">
              أدخل بياناتك للوصول إلى لوحة التحكم
            </p>
          </div>

          {isLoading && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]">
              <LoaderCircle className="h-4 w-4 animate-spin text-[var(--primary)]" />
              <span className="font-arabic">جاري التحقق من بياناتك...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="h-11 pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="h-11 w-full text-sm font-black" disabled={isLoading}>
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  تسجيل الدخول
                  <ArrowLeft className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--muted-foreground)] font-arabic">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="font-black text-[var(--primary)] hover:underline">
              إنشاء حساب
            </Link>
          </p>

          <style jsx>{`
            .login-progress {
              animation: login-progress 1.2s ease-in-out infinite;
            }
            @keyframes login-progress {
              0% { transform: translateX(-120%); }
              100% { transform: translateX(420%); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
