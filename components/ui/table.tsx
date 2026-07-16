import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--border)]">{children}</tbody>;
}

export function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("border-b border-[var(--border)] last:border-b-0", className)}>{children}</tr>;
}

export function TableHeaderCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn("pb-3 text-start text-xs font-semibold text-[var(--muted-foreground)] font-arabic", className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("py-3 text-sm text-[var(--foreground)] font-arabic", className)}>{children}</td>;
}
