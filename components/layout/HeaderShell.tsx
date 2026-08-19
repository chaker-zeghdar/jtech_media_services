'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useOverHero } from './useOverHero';

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
 *            the reference design puts its nav at the very top of the page
 * scrolled   the solid white bar with a hairline — everything the sticky header
 *            already did, unchanged
 *
 * Both states are `sticky top-0`. The stickiness is deliberate and predates this
 * treatment; going transparent must not cost it, so only the paint changes.
 *
 * When the switch happens is `useOverHero`'s business — see the note there.
 *
 * ── Why no layout jump ──────────────────────────────────────────────────────
 *
 * `border-b` is present in BOTH states and only its colour changes. Toggling the
 * border itself would move the whole page by 1px each way, which is precisely
 * the "layout jump when the background swaps" this pattern is prone to.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const overHero = useOverHero();

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
