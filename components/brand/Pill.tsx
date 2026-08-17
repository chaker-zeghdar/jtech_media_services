import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type PillProps = {
  /** `ink` — black bed, white text. `gold` — gold bed, ink text. */
  variant?: 'ink' | 'gold';
  children: ReactNode;
  className?: string;
};

/** 12px/600 label chip. Both variants clear WCAG AA at this size. */
export function Pill({ variant = 'ink', children, className }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3.5 py-1.5 text-pill leading-none',
        variant === 'ink' ? 'bg-ink text-white' : 'bg-gold text-ink',
        className,
      )}
    >
      {children}
    </span>
  );
}
