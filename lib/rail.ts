/**
 * Shared geometry for every product rail on the homepage.
 *
 * These lived in `FullRange.tsx` and were imported from there by
 * `AccessoriesRail.tsx` — fine while `FullRange` was a section, and a dangling
 * import the moment it was merged into `<Featured />`. They are geometry, not
 * a section's business, so they belong in lib.
 *
 * `RAIL_ITEM` and `RAIL_SIZES` must stay in step: the second describes the
 * painted width the first produces, and next/image has no way to notice if they
 * drift apart — it just quietly fetches the wrong source.
 */

/**
 * Rail item width. Every rail uses it so they all snap alike.
 *
 * `min-w` and `max-w` are pinned to the same value as `w` at every breakpoint,
 * which looks redundant and is not. A rail child is a flex item, and a flex
 * item's `width` is only a starting point — `min-width: auto` lets it grow to
 * its min-content size, which for these cards is the width of the longest
 * unwrapped product name. Locking all three makes the box's size a definition
 * rather than a preference, so no content can push it around.
 *
 * (The bug that prompted this was actually elsewhere — lib/ was missing from
 * Tailwind's `content` globs, so none of these classes were generated at all.
 * That is fixed in tailwind.config.ts. The pinning stays regardless: it closes
 * the flex-item variant of the same symptom independently.)
 */
export const RAIL_ITEM =
  'w-[72vw] min-w-[72vw] max-w-[72vw] ' +
  'sm:w-[42vw] sm:min-w-[42vw] sm:max-w-[42vw] ' +
  'md:w-[31vw] md:min-w-[31vw] md:max-w-[31vw] ' +
  'lg:w-[23vw] lg:min-w-[23vw] lg:max-w-[23vw] ' +
  'xl:w-[290px] xl:min-w-[290px] xl:max-w-[290px]';

/** Homepage rails show this many products; the full list lives in content/. */
export const RAIL_LIMIT = 10;

/** The painted width of RAIL_ITEM, per breakpoint. */
export const RAIL_SIZES =
  '(max-width: 639px) 72vw, (max-width: 767px) 42vw, (max-width: 1023px) 31vw, (max-width: 1279px) 23vw, 290px';
