import type { CategorySlug } from '@/content/schemas';

/**
 * The blank strip at the top of the hero card that the sticky chrome floats over.
 *
 * <Hero /> renders it; <HeaderShell /> observes it to decide whether the header
 * is still sitting on the card (transparent) or has scrolled past it (solid).
 * It lives here rather than in either component so neither owns the other, and
 * so the id can't drift between the element and the observer.
 */
export const HERO_CHROME_SENTINEL_ID = 'hero-chrome-band';

/**
 * Homepage section anchors. `id` matches the <Section id> and the messages key
 * under `nav.*`, so a section, its nav entry and its label can't drift apart.
 */
export const SECTION_IDS = [
  'categories',
  'featured',
  'why',
  'phones',
  'laptops',
  'accessories',
  'services',
  'contact',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/**
 * The subset shown in the sticky LocalNav — the full list won't fit at 48px.
 *
 * Listed in the order the sections actually appear on the page, so clicking down
 * the nav walks the page top to bottom. (<LocalNav /> resolves the active entry
 * from real DOM position rather than trusting this order, but keeping the two in
 * sync is what makes the nav read correctly.)
 */
export const LOCAL_NAV_IDS: readonly SectionId[] = [
  'featured',
  'why',
  'phones',
  'laptops',
  'accessories',
  'services',
  'contact',
];

/**
 * The category page for a slug. Phase 2, now real.
 *
 * The old note here predicted that changing this one function would switch the
 * header nav, the category tiles and the footer columns over at once. That was
 * half true: they all read from here, so they all changed — but every one of
 * them rendered the result in a plain <a href>, which was fine for the "#range"
 * fragment this used to return and wrong the moment it became a path. A bare
 * <a href="/categories/iphone"> on /fr navigates to the ARABIC page, because
 * `as-needed` prefixing lives in next-intl's <Link>, not in the string.
 *
 * So all four call sites — <Header />, <MobileMenu />, <Categories />,
 * <Footer /> — now render this through the <Link> from `@/i18n/navigation`.
 * Anything new that links a category must do the same.
 */
export function categoryHref(slug: CategorySlug): string {
  return `/categories/${slug}`;
}
