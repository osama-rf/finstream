interface PillTabsProps<T extends string> {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}

export function PillTabs<T extends string>({ options, value, onChange }: PillTabsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold font-arabic transition-all ${
            value === opt.key
              ? "border-[var(--navy,var(--foreground))] bg-[var(--foreground)] text-[var(--background)]"
              : "border-[var(--border-strong,var(--border))] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
