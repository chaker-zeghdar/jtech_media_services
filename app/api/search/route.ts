import { primaryVariant, priceFrom } from '@/lib/product';
import { searchProducts } from '@/lib/queries/products';

/**
 * `GET /api/search?q=...` — the live type-ahead's data source.
 *
 * A route handler, not a server action, for the same reason `/api/dairas` is
 * one: the search box lives in client components (the header drawer's inline
 * form, and the dedicated `/search` page's own form, which are both
 * `'use client'`), and a route handler is what a `useEffect`-driven debounce
 * can `fetch()` on every keystroke pause without a server round trip through
 * React's action machinery for what is, structurally, just a read.
 *
 * Public and unauthenticated, like every other catalogue read — a product
 * search result is not customer data.
 *
 * Returns a small, pre-shaped payload rather than the full `Product` (specs,
 * every variant, every image, badges, highlights): a dropdown row shows a
 * thumbnail, a name and a price, and this fires on every debounced keystroke,
 * so the win from not serialising the rest is real, not theoretical.
 */

/** Enough to fill a dropdown without it growing taller than a phone screen;
 *  the "see all N results" link under it is where the rest live. */
const LIMIT = 6;

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q') ?? '';

  const products = await searchProducts(q);

  const results = products.slice(0, LIMIT).map((product) => ({
    slug: product.slug,
    name: product.name,
    price: priceFrom(product),
    image: primaryVariant(product).images[0] ?? null,
  }));

  return Response.json({ results, total: products.length });
}
