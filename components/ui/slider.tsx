import { cn } from "@/lib/utils/cn";

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  className?: string;
}

export function Slider({ min, max, value, onChange, step = 1, className }: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn("w-full accent-[var(--primary)]", className)}
    />
  );
}
