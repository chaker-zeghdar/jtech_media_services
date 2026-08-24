import type { Badge, Product, ProductColour, ProductVariant } from '@/content/schemas';

/**
 * Cards show exactly ONE badge. Stacking two ("جديد" over "الأكثر مبيعاً") reads
 * as a rendering bug rather than as emphasis, so this picks the single most
 * useful one: an active deal beats novelty, novelty beats scarcity, and a
 * generic warranty note is the weakest claim of the set.
 */
const BADGE_PRIORITY: readonly Badge[] = ['promo', 'new', 'last-units', 'bestseller', 'warranty'];

export function primaryBadge(product: Product): Badge | null {
  for (const badge of BADGE_PRIORITY) {
    if (product.badges.includes(badge)) return badge;
  }
  return null;
}

/**
 * Pure product selectors.
 *
 * These live in lib/ rather than in content/products.ts on purpose: the content
 * module runs zod at import time and holds the whole catalogue, so a client
 * component importing a helper from it would ship both. Here the only import is
 * a type, which the compiler erases — <ProductCard /> and <QuickView /> can use
 * these with zero bundle cost.
 */

/** First variant, which is the canonical card and hero shot. */
export function primaryVariant(product: Product): ProductVariant {
  const [variant] = product.variants;
  if (!variant) {
    // Unreachable: productSchema enforces `.min(1)`. Kept so the return type is
    // honest under `noUncheckedIndexedAccess` without a non-null assertion.
    throw new Error(`Product "${product.slug}" has no variants`);
  }
  return variant;
}

/** Cheapest variant price — what a card shows when variants differ. */
export function priceFrom(product: Product): number {
  return Math.min(...product.variants.map((variant) => variant.price));
}

/** Unique colours across variants, in variant order, for the swatch row. */
export function productColours(product: Product): ProductColour[] {
  const seen = new Map<string, ProductColour>();
  for (const variant of product.variants) {
    if (!seen.has(variant.colour.slug)) seen.set(variant.colour.slug, variant.colour);
  }
  return [...seen.values()];
}

/**
 * Every variant sharing a colour, in variant order — the storage options a
 * checkout's storage picker offers once a colour is chosen.
 *
 * Colour and storage are not an independent grid in this catalogue: a variant
 * is one SKU the shop actually stocks, so "black, 256GB" only exists as an
 * option if that exact row is in content/products.ts. Filtering by colour
 * first is what keeps the storage picker from ever offering a combination
 * nobody sells.
 */
export function variantsForColour(product: Product, colourSlug: string): ProductVariant[] {
  return product.variants.filter((variant) => variant.colour.slug === colourSlug);
}

/**
 * The exact variant for a (colour, storage) pick.
 *
 * Falls back to the first variant for that colour if the requested storage
 * isn't one of its options — reachable only via a stale selection (e.g. the
 * colour just changed and storage hasn't caught up yet in the same render),
 * never as the normal path, since the checkout view always re-derives a valid
 * storage alongside every colour change.
 */
export function resolveVariant(
  product: Product,
  colourSlug: string,
  storage: string | null,
): ProductVariant {
  const forColour = variantsForColour(product, colourSlug);
  return forColour.find((variant) => variant.storage === storage) ?? forColour[0] ?? primaryVariant(product);
}
