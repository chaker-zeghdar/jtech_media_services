import type { Product, ProductColour, ProductVariant } from '@/content/schemas';

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
