'use client';

import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--foreground)] shadow-[var(--shadow-soft)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] ${className}`}
      aria-label="تبديل المظهر"
      title={resolvedTheme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
    >
      {resolvedTheme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </button>
  );
}
