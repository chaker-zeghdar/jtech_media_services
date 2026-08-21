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

/** Rail item width. Every rail uses it so they all snap alike. */
export const RAIL_ITEM = 'w-[72vw] sm:w-[42vw] md:w-[31vw] lg:w-[23vw] xl:w-[290px]';

/** Homepage rails show this many products; the full list lives in content/. */
export const RAIL_LIMIT = 10;

/** The painted width of RAIL_ITEM, per breakpoint. */
export const RAIL_SIZES =
  '(max-width: 639px) 72vw, (max-width: 767px) 42vw, (max-width: 1023px) 31vw, (max-width: 1279px) 23vw, 290px';
