"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils/cn";

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onCheckedChange, disabled, className }: ToggleProps) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      disabled={disabled}
      className={cn(
        "relative h-[22px] w-[38px] shrink-0 rounded-full border-none transition-colors",
        checked ? "bg-[var(--primary)]" : "bg-[var(--muted)]",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span
        className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-all"
        style={{ insetInlineEnd: checked ? "18px" : "2px" }}
      />
    </CheckboxPrimitive.Root>
  );
}
