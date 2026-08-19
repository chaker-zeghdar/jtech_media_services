'use client';

import { useEffect, useState } from 'react';
import { HERO_CHROME_SENTINEL_ID } from './navigation';

/**
 * True while the sticky chrome still has nothing but hero card behind it.
 *
 * Both bars need this answer and they must never disagree: <Header /> uses it to
 * decide between transparent and solid, and <LocalNav /> uses it to stay out of
 * the way entirely until the hero has been scrolled past. Two components reading
 * one rule, rather than two rules that drift.
 *
 * ── Why an observer and not `scrollY > n` ───────────────────────────────────
 *
 * The switch has to land at the exact offset where the card's content would
 * slide under an unbacked bar. That offset falls out of the card's top padding
 * and the chrome's own height, so a hardcoded number would need re-deriving
 * every time either changes. Watching the card's blank top band with the
 * header's height as a negative root margin states the rule directly: chrome is
 * "over hero" for exactly as long as it has only card behind it.
 *
 * ── Why it starts true ──────────────────────────────────────────────────────
 *
 * That is the correct answer for a load at scroll 0, which is nearly every load.
 * Starting false and correcting on mount would flash a white bar across the top
 * of the card. The cost is that without JavaScript the answer never changes, so
 * `@media (scripting: none)` in globals.css pins both bars to their scrolled
 * appearance in that case.
 */
export function useOverHero(): boolean {
  return useScrolledPast(HERO_CHROME_SENTINEL_ID);
}

/**
 * True until the whole hero section has scrolled up past the header.
 *
 * <LocalNav /> uses this rather than `useOverHero`: the header only needs to
 * stop being transparent once copy reaches it, which happens within about 40px
 * of scroll, but the jump nav must stay away for the entire hero. Revealing it
 * on the header's threshold put a second bar directly under the first for the
 * whole rest of the hero — the "two navbars" the single-nav reference doesn't
 * have. Tied to #hero itself, it appears exactly when the next section begins.
 */
export function useHeroPassed(): boolean {
  return !useScrolledPast('hero');
}

/**
 * Shared mechanic: true while any part of `id` is still below the header.
 */
function useScrolledPast(id: string): boolean {
  const [inside, setInside] = useState(true);

  useEffect(() => {
    const sentinel = document.getElementById(id);

    // No hero on this route, or no observer: the over-hero state has nothing to
    // sit on, so fall back to the ordinary chrome.
    if (!sentinel || typeof IntersectionObserver === 'undefined') {
      setInside(false);
      return;
    }

    // Read from the same custom property that drives the sticky offsets, so the
    // threshold cannot drift from the bar it is measuring.
    const headerHeight =
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
      ) || 64;

    const observer = new IntersectionObserver(
      ([entry]) => setInside(entry?.isIntersecting ?? false),
      { rootMargin: `-${headerHeight}px 0px 0px 0px`, threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [id]);

  return inside;
}
