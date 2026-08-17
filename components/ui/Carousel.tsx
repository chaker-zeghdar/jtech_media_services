'use client';

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

type CarouselProps = {
  /** Accessible name for the scrollable region. */
  label: string;
  /** One element per slide. Widths come from `itemClassName`. */
  children: ReactNode;
  className?: string;
};

/**
 * Scroll-snap rail with 36px circular arrows and a 3px gold progress bar.
 *
 * Native scrolling does the work — no transform track, no virtualisation, no
 * drag library. That means touch, trackpad, shift+wheel and keyboard all behave
 * the way the platform does, and the whole thing is a few hundred bytes.
 *
 * RTL: `scrollLeft` runs negative from the origin in RTL, so progress is read
 * from its magnitude and the arrow deltas are sign-flipped off the computed
 * direction. "Previous" always means toward the inline start, in both scripts.
 */
export function Carousel({ label, children, className }: CarouselProps) {
  const t = useTranslations('a11y');
  const railRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const max = rail.scrollWidth - rail.clientWidth;
    const position = Math.abs(rail.scrollLeft);

    setProgress(max > 1 ? Math.min(1, position / max) : 1);
    setAtStart(position <= 2);
    setAtEnd(max <= 1 || position >= max - 2);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    sync();
    rail.addEventListener('scroll', sync, { passive: true });

    // Re-measure when the rail resizes (breakpoint change, font swap).
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sync);
    observer?.observe(rail);

    return () => {
      rail.removeEventListener('scroll', sync);
      observer?.disconnect();
    };
  }, [sync]);

  const scrollByPage = (towards: 'start' | 'end') => {
    const rail = railRef.current;
    if (!rail) return;

    const isRtl = getComputedStyle(rail).direction === 'rtl';
    const step = rail.clientWidth * 0.8;
    const sign = (towards === 'end' ? 1 : -1) * (isRtl ? -1 : 1);

    rail.scrollBy({ left: sign * step, behavior: 'smooth' });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div role="region" aria-label={label} className="snap-rail gap-5 pb-1">
        {children}
      </div>

      <div className="flex items-center gap-5">
        {/* 3px gold progress bar. Decorative — the rail itself is the control. */}
        <div aria-hidden="true" className="h-[3px] flex-1 overflow-hidden rounded-full bg-gray-300">
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-200 ease-brand"
            style={{ width: `${Math.max(6, progress * 100)}%` }}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => scrollByPage('start')}
            disabled={atStart}
            aria-label={t('carouselPrev')}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-ink',
              'transition-[background-color,border-color,opacity] duration-200 ease-brand',
              'hover:border-ink hover:bg-ink hover:text-white',
              'disabled:pointer-events-none disabled:opacity-35',
            )}
          >
            <Icon name="chevron" size={16} className="-scale-x-100 rtl:scale-x-100" />
          </button>

          <button
            type="button"
            onClick={() => scrollByPage('end')}
            disabled={atEnd}
            aria-label={t('carouselNext')}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-ink',
              'transition-[background-color,border-color,opacity] duration-200 ease-brand',
              'hover:border-ink hover:bg-ink hover:text-white',
              'disabled:pointer-events-none disabled:opacity-35',
            )}
          >
            <Icon name="chevron" size={16} className="rtl:-scale-x-100" />
          </button>
        </div>
      </div>
    </div>
  );
}
