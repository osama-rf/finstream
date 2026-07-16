'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    className="toaster group font-arabic"
    toastOptions={{
      classNames: {
        toast: 'group toast font-arabic rounded-[12px] border border-[var(--border)]',
        description: 'text-[var(--muted-foreground)] font-arabic',
        actionButton: 'bg-[#0A3057] text-white font-arabic',
        cancelButton: 'bg-[var(--muted)] text-[var(--foreground)] font-arabic',
      },
    }}
    {...props}
  />
);

export { Toaster };
