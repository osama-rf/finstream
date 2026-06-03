"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";

export default function BankConnectingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    "جاري الاتصال ببوابة البنك الآمنة...",
    "جاري التحقق من بيانات الاعتماد...",
    "جاري الحصول على موافقة Open Banking...",
    "تم — جاري تحميل بياناتك...",
  ];

  useEffect(() => {
    // Animate progress bar
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 40);

    // Cycle through steps
    const stepTimers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1100),
      setTimeout(() => setStep(3), 1700),
    ];

    // Redirect after 2.2 seconds
    const redirect = setTimeout(() => {
      router.push("/bank?connected=true");
    }, 2200);

    return () => {
      clearInterval(interval);
      stepTimers.forEach(clearTimeout);
      clearTimeout(redirect);
    };
  }, []); // eslint-disable-line

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]" dir="rtl">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm px-6">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)] border border-[color:color-mix(in_srgb,var(--primary)_20%,transparent)]">
          <Landmark className="h-10 w-10 text-[var(--primary)]" />
        </div>

        {/* Status text */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-[var(--foreground)] font-arabic">
            جاري التحويل لبوابة البنك
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] font-arabic transition-all duration-300">
            {steps[step]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-2">
          <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-[var(--muted-foreground)] font-arabic tabular-nums" dir="ltr">
            {progress}%
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? "24px" : "6px",
                background: i <= step ? "var(--primary)" : "var(--border)",
              }}
            />
          ))}
        </div>

        <p className="text-center text-xs text-[var(--muted-foreground)] font-arabic">
          اتصال آمن مشفر — Open Banking API
        </p>
      </div>
    </div>
  );
}
