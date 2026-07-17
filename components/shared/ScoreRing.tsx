import { useState } from "react";

interface ScoreRingProps {
  value: number;
  max: number;
  size?: number;
  colorOverride?: string;
  sublabel?: string;
  detail?: string;
}

export function ScoreRing({ value, max, size = 144, colorOverride, sublabel, detail }: ScoreRingProps) {
  const [active, setActive] = useState(false);
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const r = size / 2 - 18;
  const circ = 2 * Math.PI * r;
  const color = colorOverride ?? (pct >= 65 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--destructive)");

  return (
    <div
      className="relative flex items-center justify-center shrink-0 cursor-pointer"
      style={{ height: size, width: size }}
      tabIndex={0}
      role="button"
      aria-label={`${sublabel ?? `من ${max}`}: ${value}${detail ? ` — ${detail}` : ""}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      onClick={() => setActive(prev => !prev)}
    >
      <svg
        className="absolute inset-0 -rotate-90 transition-transform"
        width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ transform: active ? "rotate(-90deg) scale(1.03)" : "rotate(-90deg)" }}
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={active ? 12 : 10}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (pct / 100) * circ}
          style={{ transition: "stroke-dashoffset 1s ease, stroke-width .15s" }}
        />
      </svg>
      <div className="text-center px-2">
        <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
        <p className="text-[10px] text-[var(--muted-foreground)] font-arabic">{sublabel ?? `من ${max}`}</p>
      </div>
      {active && detail && (
        <div className="pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 shadow-lg">
          <p className="text-[11px] font-bold text-[var(--foreground)] font-arabic">{detail}</p>
        </div>
      )}
    </div>
  );
}
