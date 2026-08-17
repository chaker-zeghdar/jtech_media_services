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
 * ── Why this is written defensively ──────────────────────────────────────────
 * A scroll reveal that defaults to `opacity: 0` can strand real content
 * permanently invisible, and there are four separate ways in:
 *
 *   1. JS never runs (error, failed hydration, scripting disabled)
 *   2. IntersectionObserver is missing
 *   3. the reader lands mid-page — a deep link, or a restored scroll position —
 *      so sections ABOVE them never intersect and never fire
 *   4. `prefers-reduced-motion`, where nothing should be hidden in the first place
 *
 * Each is handled below, and the order matters: the component starts in the
 * 'initial' phase with NO `.reveal` class at all, so the server-rendered markup
 * is visible as delivered. Opacity is only ever applied on the client, and only
 * to an element that is genuinely still below the fold — where hiding it is
 * imperceptible.
 */
export function Reveal({ children, delayMs = 0, as: Tag = 'div', className }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  // 'initial' → untouched server markup (visible)
  // 'armed'   → below the fold, hidden, waiting to cross into view
  // 'shown'   → revealed
  const [phase, setPhase] = useState<'initial' | 'armed' | 'shown'>('initial');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // (2) and (4): never hide anything we can't reliably reveal again.
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setPhase('shown');
      return;
    }

    const rect = element.getBoundingClientRect();

    // (3) Already scrolled PAST — the element sits above the viewport top. It
    // will never intersect again on a downward scroll, so show it immediately
    // and without animating. This is the deep-link and restored-scroll case.
    if (rect.bottom <= 0) {
      setPhase('shown');
      return;
    }

    // Already on screen at mount: leave it alone rather than hiding it and
    // animating it back in, which would read as a flicker.
    if (rect.top < window.innerHeight) {
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
      // Commits slightly BEFORE the element enters, so a fast scroll doesn't
      // outrun the observer and leave a band of the page blank.
      { rootMargin: '0px 0px -10% 0px', threshold: 0 },
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
