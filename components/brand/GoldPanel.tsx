import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type GoldPanelProps = {
  children: ReactNode;
  className?: string;
};

/**
 * The full-bleed gold brand moment. **One section per page** — the delivery
 * block. See DESIGN.md.
 *
 * Two stacked gradients: diagonal white light rays over a gold base, straight
 * from the client's Instagram panels. Text on it is always ink (#1D1D1F), which
 * clears WCAG AA against every stop in the gradient.
 *
 * The `on-gold` class switches the focus-ring colour to ink for anything
 * focusable inside.
 */
export function GoldPanel({ children, className }: GoldPanelProps) {
  return (
    <div className={cn('on-gold relative overflow-hidden bg-gold-panel text-ink', className)}>
      {children}
    </div>
  );
}
