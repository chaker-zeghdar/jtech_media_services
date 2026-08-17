'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

type ParallaxProps = {
  children: ReactNode;
  /**
   * Travel as a fraction of the element's own height. Clamped to 0.05 — the
   * brief caps parallax at 3–5% and anything more starts to look like a theme.
   */
  strength?: number;
  className?: string;
};

const MAX_STRENGTH = 0.05;

/**
 * Subtle scroll-linked drift, 5% of element height at most.
 *
 * Writes to a CSS custom property from a rAF-throttled scroll listener and lets
 * the compositor do the transform, so there is no layout work per frame. Bails
 * out entirely under `prefers-reduced-motion`.
 */
export function Parallax({ children, strength = 0.04, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;

    const amount = Math.min(Math.abs(strength), MAX_STRENGTH);
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewport) return;

      // -1 when the element is entering from below, +1 when leaving at the top.
      const progress = (viewport / 2 - (rect.top + rect.height / 2)) / (viewport / 2 + rect.height / 2);
      element.style.setProperty('--parallax-y', `${(progress * amount * rect.height).toFixed(2)}px`);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [strength]);

  return (
    <div
      ref={ref}
      className={cn('will-change-transform', className)}
      style={{ transform: 'translate3d(0, var(--parallax-y, 0px), 0)' }}
    >
      {children}
    </div>
  );
}
