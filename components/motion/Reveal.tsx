'use client';

import { type ElementType, type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

type RevealProps = {
  children: ReactNode;
  /** Stagger siblings by passing an increasing delay. */
  delayMs?: number;
  as?: ElementType;
  className?: string;
};

/**
 * Fade + 20px rise, 600ms on the brand easing, once only — for content BELOW the
 * fold. Above the fold use <Enter />, which needs no JavaScript at all.
 *
 * Fails safe to visible. The server-rendered markup carries no `.reveal` class,
 * so the content is painted normally; the class (and therefore opacity 0) is only
 * applied on mount, and only when the element is still offscreen. A JS error, a
 * failed hydration or a scripting-disabled browser therefore leaves the page fully
 * readable instead of blanking every section — which is what an
 * `opacity: 0`-by-default reveal does.
 *
 * The transition itself is CSS; this component only toggles a data attribute, so
 * the most-used motion primitive on the page costs effectively no bundle weight.
 * Framer Motion stays reserved for <QuickView />, which is lazily loaded.
 */
export function Reveal({ children, delayMs = 0, as: Tag = 'div', className }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  // 'initial' → untouched server markup (visible)
  // 'armed'   → offscreen, hidden, waiting to cross into view
  // 'shown'   → revealed
  const [phase, setPhase] = useState<'initial' | 'armed' | 'shown'>('initial');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setPhase('shown');
      return;
    }

    // Already on screen when we mount: leave it alone rather than hiding it and
    // animating it back in, which would read as a flicker.
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setPhase('shown');
      return;
    }

    setPhase('armed');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPhase('shown');
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-revealed={phase === 'shown' ? 'true' : 'false'}
      style={delayMs ? ({ ['--reveal-delay' as string]: `${delayMs}ms` } as const) : undefined}
      className={cn(phase !== 'initial' && 'reveal', className)}
    >
      {children}
    </Tag>
  );
}
