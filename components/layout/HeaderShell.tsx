'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { HERO_CHROME_SENTINEL_ID } from './navigation';

/**
 * The <header> element and the single piece of state it needs: whether the page
 * is still scrolled to the top of the hero card.
 *
 * This exists so <Header /> can stay a server component. Everything inside the
 * bar — the logo, the resolved category names, the switcher, the mobile menu —
 * is still rendered on the server and arrives here as `children`. The only thing
 * that ships to the client is this shell and one IntersectionObserver, which is
 * what keeps the header off the critical path the way DESIGN.md §4 asks.
 *
 * ── Two states ──────────────────────────────────────────────────────────────
 *
 * over-hero  transparent, sitting directly on the hero card's gradient, the way
 *            the reference design puts its nav inside the card
 * scrolled   the solid white bar with a hairline — everything the sticky header
 *            already did, unchanged
 *
 * Both states are `sticky top-0`. The stickiness is deliberate and predates this
 * treatment; going transparent must not cost it, so only the paint changes.
 *
 * ── Why an observer and not `scrollY > n` ───────────────────────────────────
 *
 * The switch has to happen at the exact scroll offset where the card's content
 * would slide under a *transparent* bar and become unreadable. That offset is a
 * consequence of the announcement bar's height, the card's top padding and the
 * chrome's own height, so hardcoding it would mean re-deriving a magic number
 * every time any of the three changes. Observing the blank band at the top of
 * the card with the header's own height as a negative root margin expresses the
 * rule directly: transparent for exactly as long as the header has nothing but
 * card behind it.
 *
 * ── Why no layout jump ──────────────────────────────────────────────────────
 *
 * `border-b` is present in BOTH states and only its colour changes. Toggling the
 * border itself would move the whole page by 1px each way, which is precisely
 * the "layout jump when the background swaps" this pattern is prone to.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  /**
   * Starts transparent because that is the correct state for a load at scroll 0,
   * which is nearly every load. Rendering solid first and correcting on mount
   * would flash a white bar across the top of the card.
   */
  const [overHero, setOverHero] = useState(true);

  useEffect(() => {
    const sentinel = document.getElementById(HERO_CHROME_SENTINEL_ID);

    // No hero on this route: the transparent state has nothing to sit on.
    if (!sentinel) {
      setOverHero(false);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setOverHero(false);
      return;
    }

    // Read from the same custom property that drives the sticky offsets, so the
    // threshold can never drift from the bar it is measuring.
    const headerHeight =
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
      ) || 64;

    const observer = new IntersectionObserver(
      ([entry]) => setOverHero(entry?.isIntersecting ?? false),
      { rootMargin: `-${headerHeight}px 0px 0px 0px`, threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      // `group` so the icon buttons inside can pick up the state without any of
      // them needing to be client components themselves.
      data-over-hero={overHero || undefined}
      className={cn(
        'group sticky top-0 z-nav border-b transition-colors duration-300 ease-brand',
        overHero ? 'border-transparent bg-transparent' : 'border-gray-300 bg-white',
      )}
    >
      {children}
    </header>
  );
}
