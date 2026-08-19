'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
// Client component — see the import note in ProductCard.tsx.
import { whatsappLink } from '@/content/contact';
import { cn } from '@/lib/cn';
import { LOCAL_NAV_IDS, type SectionId } from './navigation';
import { useOverHero } from './useOverHero';
import { Container } from './Container';

/**
 * Sticky in-page navigation, 48px tall, with a 2px gold reading-progress bar
 * welded to its bottom edge.
 *
 * Hidden while the hero is still under the chrome. This is a secondary jump nav
 * for a long page, not a permanent fixture: showing it above the fold put a
 * white band and a hairline between the header and the hero card, which read as
 * a seam across a design whose whole point is that the nav sits directly on the
 * gradient. It fades in at the same moment <Header /> goes solid — one shared
 * rule, `useOverHero`, so the two bars cannot disagree.
 *
 * It keeps its 48px of flow height in both states. Collapsing the height would
 * be the obvious way to hide it and the wrong one: the document would shift by
 * 48px each way as it came and went. `visibility` also takes it out of the tab
 * order and the accessibility tree while hidden, so there are no focusable links
 * behind the hero card.
 *
 * Two scroll signals, both cheap:
 *   progress — rAF-throttled document scroll ratio, written to a CSS variable
 *   active   — one IntersectionObserver over the sections, with a top band that
 *              starts just below the nav so the highlighted entry is the section
 *              actually under the nav rather than whichever is largest on screen
 */
export function LocalNav() {
  const overHero = useOverHero();
  const t = useTranslations('nav');
  const tA11y = useTranslations('a11y');
  const tProduct = useTranslations('product');

  const barRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      barRef.current?.style.setProperty('--scroll-progress', `${(ratio * 100).toFixed(2)}%`);
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
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const sections = LOCAL_NAV_IDS.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (sections.length === 0) return;

    // Resolved from real DOM position, NOT from the order of LOCAL_NAV_IDS. The
    // nav array is a display order and has diverged from document order before;
    // reading offsetTop means reordering the nav can never silently break the
    // highlight again.
    const documentOrder = [...sections]
      .sort((a, b) => a.offsetTop - b.offsetTop)
      .map((element) => element.id);

    const visible = new Set<string>();

    const rootStyle = getComputedStyle(document.documentElement);
    const px = (name: string) => Number.parseFloat(rootStyle.getPropertyValue(name)) || 0;
    const chromeHeight = px('--header-height') + px('--nav-height');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }

        // Last one down the page wins, so scrolling down advances the highlight.
        const current = [...documentOrder].reverse().find((id) => visible.has(id)) ?? null;
        setActive(current as SectionId | null);
      },
      // Top band starts below BOTH sticky bars, read from the same custom
      // property rather than a second hardcoded pixel value.
      { rootMargin: `-${chromeHeight}px 0px -68% 0px`, threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{ top: 'var(--header-height)' }}
      data-over-hero={overHero || undefined}
      className={cn(
        // Stacks directly under the now-sticky Header. `top` comes from the
        // same custom property that drives --nav-offset, so the sticky stacking
        // and the anchor offset cannot drift apart.
        'sticky z-nav border-b border-gray-300',
        // Paint only — the 48px of flow height is kept either way.
        'transition-[opacity,visibility] duration-300 ease-brand',
        overHero ? 'invisible opacity-0' : 'visible opacity-100',
        // Blurred translucent bed, with a solid fallback where backdrop-filter
        // isn't supported so the nav is never unreadable over content.
        'bg-white/85 supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl',
      )}
    >
      <Container className="flex h-12 items-center justify-between gap-4">
        <nav aria-label={tA11y('sectionNav')} className="min-w-0 flex-1">
          <ul className="snap-rail items-center gap-1">
            {LOCAL_NAV_IDS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={active === id ? 'true' : undefined}
                  className={cn(
                    'block whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors duration-200',
                    active === id
                      ? 'bg-gold-tint font-semibold text-gold-text'
                      : 'text-gray-700 hover:text-ink',
                  )}
                >
                  {t(id)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href={whatsappLink(tProduct('generalMessage'))}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-gray-700 sm:inline-flex"
        >
          <Icon name="whatsapp" size={15} />
          {t('order')}
        </a>
      </Container>

      {/* 2px gold progress bar on the nav's bottom edge. */}
      <div
        ref={barRef}
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-px h-0.5 overflow-hidden"
      >
        <div
          className="h-full bg-gold"
          style={{ width: 'var(--scroll-progress, 0%)' }}
        />
      </div>
    </div>
  );
}
