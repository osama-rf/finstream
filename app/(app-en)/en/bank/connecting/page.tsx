"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";

export default function BankConnectingEnPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    "Connecting to secure bank portal...",
    "Verifying credentials...",
    "Obtaining Open Banking consent...",
    "Done — loading your data...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => { if (p >= 100) { clearInterval(interval); return 100; } return p + 2; });
    }, 40);
    const stepTimers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1100),
      setTimeout(() => setStep(3), 1700),
    ];
    const redirect = setTimeout(() => { router.push("/en/bank?connected=true"); }, 2200);
    return () => { clearInterval(interval); stepTimers.forEach(clearTimeout); clearTimeout(redirect); };
  }, []); // eslint-disable-line

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]" dir="ltr">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)] border border-[color:color-mix(in_srgb,var(--primary)_20%,transparent)]">
          <Landmark className="h-10 w-10 text-[var(--primary)]" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-[var(--foreground)]">Redirecting to Bank Portal</h1>
          <p className="text-sm text-[var(--muted-foreground)] transition-all duration-300">{steps[step]}</p>
        </div>
        <div className="w-full space-y-2">
          <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-100" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-center text-xs text-[var(--muted-foreground)] tabular-nums">{progress}%</p>
        </div>
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className="h-1.5 rounded-full transition-all duration-300" style={{ width: i === step ? "24px" : "6px", background: i <= step ? "var(--primary)" : "var(--border)" }} />
          ))}
        </div>
        <p className="text-center text-xs text-[var(--muted-foreground)]">Secure encrypted connection — Open Banking API</p>
      </div>
    </div>
  );
}
