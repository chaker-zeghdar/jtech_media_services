import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type EnterProps = {
  children: ReactNode;
  /** Stagger siblings by passing an increasing delay. */
  delayMs?: number;
  as?: ElementType;
  className?: string;
};

/**
 * Load-triggered entrance for ABOVE-the-fold content — same fade + 20px rise as
 * <Reveal />, but driven by a CSS animation that plays as soon as the stylesheet
 * parses.
 *
 * A server component with no hooks and no `'use client'`, so the hero costs zero
 * client JavaScript to animate. That matters specifically because the hero
 * headline is the LCP element: scroll-gating it behind an IntersectionObserver
 * would hold LCP until hydration finished, which the 2.5s-on-4G target can't
 * absorb.
 *
 * Use <Reveal /> for anything below the fold.
 */
export function Enter({ children, delayMs = 0, as: Tag = 'div', className }: EnterProps) {
  return (
    <Tag
      style={delayMs ? ({ ['--reveal-delay' as string]: `${delayMs}ms` } as const) : undefined}
      className={cn('enter', className)}
    >
      {children}
    </Tag>
  );
}
