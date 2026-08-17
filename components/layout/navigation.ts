import type { CategorySlug } from '@/content/schemas';

/**
 * Homepage section anchors. `id` matches the <Section id> and the messages key
 * under `nav.*`, so a section, its nav entry and its label can't drift apart.
 */
export const SECTION_IDS = [
  'categories',
  'featured',
  'range',
  'bestsellers',
  'accessories',
  'why',
  'services',
  'delivery',
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
  'range',
  'bestsellers',
  'accessories',
  'services',
  'delivery',
  'contact',
];

/**
 * PHASE 2: return `/categories/${slug}`.
 *
 * Category pages don't exist yet, so every category link resolves to the range
 * section on the homepage. Changing this one function switches the header nav,
 * the category tiles and the footer columns over at once.
 */
export function categoryHref(_slug: CategorySlug): string {
  return '#range';
}
