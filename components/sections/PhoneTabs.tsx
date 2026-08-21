'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/cn';

type Tab = {
  slug: string;
  name: string;
  /** The rail, rendered on the SERVER and handed over — see the note below. */
  rail: ReactNode;
  viewAll: ReactNode;
};

/**
 * The only interactive part of <OurPhones /> — which category is showing.
 *
 * ── Why the rails arrive as ReactNode ──────────────────────────────────────
 *
 * <ProductCard /> is a server component: it calls `getLocale()`. A client
 * component cannot import one, so this does not build the rails — it receives
 * all three already rendered by <OurPhones /> and picks which to show. That is
 * the RSC boundary working as intended: the catalogue and the locale machinery
 * stay on the server, and the only thing that ships here is one string of state.
 *
 * It also gives the behaviour the brief asked for for free: every rail is
 * already in the payload, so switching tabs fires no request at all.
 *
 * ── Tabs, not links ────────────────────────────────────────────────────────
 *
 * `role="tablist"` with real `aria-selected`, because these swap a panel in
 * place. The link OUT to the full category page sits below the rail, separately,
 * so a keyboard user is never guessing which control filters and which navigates.
 */
export function PhoneTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.slug ?? '');
  const current = tabs.find((tab) => tab.slug === active) ?? tabs[0];

  if (!current) return null;

  return (
    <>
      <Container className="mt-10">
        <div role="tablist" aria-label={current.name} className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const selected = tab.slug === current.slug;

            return (
              <button
                key={tab.slug}
                type="button"
                role="tab"
                id={`phones-tab-${tab.slug}`}
                aria-selected={selected}
                aria-controls="phones-panel"
                onClick={() => setActive(tab.slug)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ease-brand',
                  selected
                    // Ink on gold measures 8.06:1 — the pairing every other gold
                    // fill on this page uses for its text.
                    ? 'bg-gold text-ink'
                    : 'bg-white text-gray-700 hover:text-ink',
                )}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      </Container>

      {/* Keyed on the slug so React swaps the subtree instead of diffing one
          rail into another — without it the cards would animate between
          unrelated products as the lists re-key. */}
      <div
        key={current.slug}
        id="phones-panel"
        role="tabpanel"
        aria-labelledby={`phones-tab-${current.slug}`}
      >
        {current.rail}
        <Container className="mt-8">{current.viewAll}</Container>
      </div>
    </>
  );
}
