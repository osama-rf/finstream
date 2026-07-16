interface MiniBarPoint {
  label: string;
  value: number;
  altValue?: number;
}

interface MiniBarsChartProps {
  data: MiniBarPoint[];
  heightPx?: number;
  formatValue?: (value: number) => string;
}

export function MiniBarsChart({ data, heightPx = 64, formatValue }: MiniBarsChartProps) {
  const maxVal = Math.max(...data.flatMap((d) => [d.value, d.altValue ?? 0]));

  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height: heightPx }}>
        {data.map((d) => {
          const h = Math.round((d.value / maxVal) * heightPx);
          const altH = d.altValue != null ? Math.round((d.altValue / maxVal) * heightPx) : null;
          return (
            <div key={d.label} className="flex flex-1 items-end justify-center gap-0.5">
              <div
                className="flex-1 max-w-[22px] rounded-t-[4px]"
                style={{ height: h, background: "var(--primary)", opacity: 0.85 }}
                title={formatValue ? formatValue(d.value) : String(d.value)}
              />
              {altH != null && (
                <div
                  className="flex-1 max-w-[22px] rounded-t-[4px]"
                  style={{ height: altH, background: "var(--muted-foreground)", opacity: 0.35 }}
                  title={formatValue ? formatValue(d.altValue!) : String(d.altValue)}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[10px] text-[var(--muted-foreground)] font-arabic">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
