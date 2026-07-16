import type { ReactNode } from "react";

interface ListItemRowProps {
  icon: ReactNode;
  iconBg?: string;
  title: string;
  sub?: string;
  right?: ReactNode;
}

export function ListItemRow({ icon, iconBg, title, sub, right }: ListItemRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 sm:px-4 sm:py-3">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black sm:h-8 sm:w-8"
        style={{ background: iconBg ?? "var(--muted)" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-medium text-[var(--foreground)] font-arabic sm:text-sm">{title}</p>
        {sub && <p className="text-[10px] text-[var(--muted-foreground)] font-arabic sm:text-xs">{sub}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
