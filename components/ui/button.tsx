'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] font-arabic',
  {
    variants: {
      variant: {
        default: 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]',
        destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:-translate-y-0.5 hover:opacity-90',
        outline: 'border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--foreground)] hover:-translate-y-0.5 hover:border-[var(--primary)] hover:bg-[var(--card)]',
        secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:-translate-y-0.5 hover:opacity-95',
        ghost: 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
        link: 'text-[var(--primary)] underline-offset-4 hover:underline',
        success: 'bg-[var(--success)] text-[var(--success-foreground)] hover:-translate-y-0.5 hover:opacity-90',
        warning: 'bg-[var(--warning)] text-[var(--warning-foreground)] hover:-translate-y-0.5 hover:opacity-95',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-[8px] px-3 text-xs',
        lg: 'h-12 rounded-[12px] px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
