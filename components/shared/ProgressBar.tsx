interface ProgressBarProps {
  label: string;
  valueLabel: string;
  pct: number;
  color?: string;
}

export function ProgressBar({ label, valueLabel, pct, color = "var(--primary)" }: ProgressBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <span className="text-[var(--foreground)] font-arabic">{label}</span>
        <span className="font-bold text-[var(--foreground)] tabular-nums" dir="ltr">{valueLabel}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }}
        />
      </div>
    </div>
  );
}
