interface ScoreRingProps {
  value: number;
  max: number;
  size?: number;
  colorOverride?: string;
  sublabel?: string;
}

export function ScoreRing({ value, max, size = 144, colorOverride, sublabel }: ScoreRingProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const r = size / 2 - 18;
  const circ = 2 * Math.PI * r;
  const color = colorOverride ?? (pct >= 65 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--destructive)");

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ height: size, width: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (pct / 100) * circ}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="text-center">
        <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
        <p className="text-[10px] text-[var(--muted-foreground)] font-arabic">{sublabel ?? `من ${max}`}</p>
      </div>
    </div>
  );
}
