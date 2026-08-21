'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';

type NavItem = {
  slug: string;
  name: string;
  href: string;
};

/**
 * The header's category links, with a highlight pill that slides between them
 * on hover.
 *
 * ── What this is a port of ─────────────────────────────────────────────────
 *
 * The visible effect from the `MotionNavigationMenu` component that was handed
 * over — its `<Highlight mode="parent" hover>` pill. The rest of that component
 * (trigger/content/viewport mega-menu machinery) is not here, and the reasons
 * are recorded on the <Header /> call site rather than buried in a commit.
 *
 * ── How it moves ───────────────────────────────────────────────────────────
 *
 * Shared-layout, not measured rects: the pill is rendered INSIDE whichever item
 * is hovered and every copy carries the same `layoutId`, so Framer animates it
 * from the old item's box to the new one. That is what makes it RTL-safe for
 * free — it interpolates real laid-out positions, so it runs right-to-left in
 * Arabic without a single direction branch. The original used physical `left`
 * arithmetic and a `-translate-x-1/2` viewport, which would have needed
 * unpicking; DESIGN.md §7 rules out physical left/right in layout anyway.
 *
 * ── Reduced motion ─────────────────────────────────────────────────────────
 *
 * A hard off switch, per DESIGN.md §4: the pill still appears under the cursor,
 * it just stops travelling. `layout={false}` is what does that — leaving the
 * duration at 0 instead would still run a layout animation on every frame for
 * no visual gain.
 */
export function NavHighlight({ items, label }: { items: NavItem[]; label: string }) {
  const [active, setActive] = useState<string | null>(null);
  const reduce = useReducedMotion();

  return (
    <nav aria-label={label} className="hidden lg:block">
      <ul
        className="flex items-center gap-1"
        // Pointer only. The pill is decorative — focus is already shown by the
        // global focus ring, and hijacking focus to drive it would mean a
        // keyboard user's ring and the pill disagreeing about where they are.
        onPointerLeave={() => setActive(null)}
      >
        {items.map((item) => (
          <li key={item.slug} className="relative" onPointerEnter={() => setActive(item.slug)}>
            {active === item.slug ? (
              <motion.span
                aria-hidden="true"
                layoutId="header-nav-highlight"
                layout={!reduce}
                transition={{ type: 'spring', stiffness: 380, damping: 32, bounce: 0 }}
                className={
                  // Two beds, because the header sits on two surfaces: gray on
                  // the white bar, white on the hero's gold. Same reason the
                  // links themselves switch colour there.
                  'absolute inset-0 rounded-full bg-gray-50 group-data-[over-hero]:bg-white'
                }
              />
            ) : null}

            <Link
              href={item.href}
              // `relative` so the link paints above the pill without the pill
              // needing a negative z-index, which would put it behind the
              // header's own background instead.
              className="relative block whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-ink group-data-[over-hero]:text-ink"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
