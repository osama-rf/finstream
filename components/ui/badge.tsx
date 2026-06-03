import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-arabic transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--accent)] text-[var(--accent-foreground)]',
        secondary: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
        destructive: 'bg-[color:color-mix(in_srgb,var(--destructive)_16%,transparent)] text-[var(--destructive)]',
        success: 'bg-[color:color-mix(in_srgb,var(--success)_16%,transparent)] text-[var(--success)]',
        warning: 'bg-[color:color-mix(in_srgb,var(--warning)_18%,transparent)] text-[var(--warning)]',
        outline: 'border border-[var(--border)] text-[var(--foreground)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
