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
/**
 * ~12% down from the previous 290px, at every breakpoint alike (72→64,
 * 42→37, 31→27, 23→20, 290→256) — a "smaller, more premium" card is a
 * proportional shrink of the whole rail, not just the fixed desktop step,
 * otherwise the card would suddenly jump in scale at the `xl` breakpoint.
 */
export const RAIL_ITEM =
  'w-[64vw] min-w-[64vw] max-w-[64vw] ' +
  'sm:w-[37vw] sm:min-w-[37vw] sm:max-w-[37vw] ' +
  'md:w-[27vw] md:min-w-[27vw] md:max-w-[27vw] ' +
  'lg:w-[20vw] lg:min-w-[20vw] lg:max-w-[20vw] ' +
  'xl:w-[256px] xl:min-w-[256px] xl:max-w-[256px]';

/** Homepage rails show this many products; the full list lives in content/. */
export const RAIL_LIMIT = 10;

/** The painted width of RAIL_ITEM, per breakpoint. Must stay in lockstep — see above. */
export const RAIL_SIZES =
  '(max-width: 639px) 64vw, (max-width: 767px) 37vw, (max-width: 1023px) 27vw, (max-width: 1279px) 20vw, 256px';
