import { z } from 'zod';
import { type CategorySlug, type Product, parseContent, productSchema } from '@/content/schemas';
import { supabase } from '@/lib/supabase';

/**
 * Reads tables `products` + `product_variants`, replacing the old
 * `content/products.ts` literal. The exported selectors mirror that file's
 * one-for-one, so call sites changed only by gaining an `await`.
 *
 * ── `!inner` is load-bearing ───────────────────────────────────────────────
 *
 * `categories!inner(slug)` rather than a plain `categories(slug)` embed. A
 * plain embed is a LEFT join, and PostgREST applies a filter written against it
 * to the embedded resource, NOT to the top-level rows: `.eq('category.slug',
 * 'iphone')` over a left join returned all 26 products with `category: null` on
 * the 21 that didn't match, which then throws in `fromRow` at `row.category
 * .slug`. With `!inner` the same filters return 5 and 19 as expected. Verified
 * against the live database, both the `eq` and the `neq` case.
 *
 * The inner join is lossless everywhere else too — `products.category_id` is
 * NOT NULL and FK-enforced, so no product can be dropped by it, which is also
 * what makes `row.category` safe to dereference unconditionally.
 */

const PRODUCT_SELECT = `
  *,
  category:categories!inner(slug),
  product_variants(*)
`;

/** A `product_variants` row as Supabase returns it — snake_case. */
type VariantRow = {
  id: string;
  position: number;
  colour_slug: string;
  colour_hex: string;
  colour_label: unknown;
  storage: string | null;
  price: number;
  compare_at: number | null;
  stock: string;
  images: string[];
};

/** A `products` row plus its joined category slug and variants. */
type ProductRow = {
  slug: string;
  brand: string;
  category: { slug: string };
  badges: string[];
  featured: boolean;
  bestseller: boolean;
  name: unknown;
  description: string | null;
  specs: unknown;
  highlights: unknown;
  battery_health_percent: number | null;
  product_variants: VariantRow[];
};

/** snake_case columns → the camelCase shape `productSchema` expects. */
function fromRow(row: ProductRow): unknown {
  return {
    slug: row.slug,
    brand: row.brand,
    category: row.category.slug,
    badges: row.badges,
    featured: row.featured,
    bestseller: row.bestseller,
    name: row.name,
    // `?? undefined`, not a pass-through: the column is nullable, so a product
    // saved without a description arrives as NULL, and `productSchema.description`
    // is `.optional()` — which accepts `undefined` but rejects `null`. Without
    // this, one description-less product throws in `parseContent` and takes down
    // every page that reads the catalogue.
    description: row.description ?? undefined,
    specs: row.specs,
    highlights: row.highlights,
    batteryHealthPercent: row.battery_health_percent,
    // Sorted here rather than in the select, because the embed's own ordering
    // isn't guaranteed and swatch order is visible on the card.
    variants: [...row.product_variants]
      .sort((a, b) => a.position - b.position)
      .map((variant) => ({
        id: variant.id,
        colour: {
          slug: variant.colour_slug,
          hex: variant.colour_hex,
          label: variant.colour_label,
        },
        storage: variant.storage,
        price: variant.price,
        compareAt: variant.compare_at,
        stock: variant.stock,
        images: variant.images,
      })),
  };
}

/**
 * `.order('created_at')` keeps the catalogue in a stable, deliberate order.
 * The old static array's order was meaningful — iPhones first, accessories
 * last — and rows were seeded in exactly that order, so ordering by insert
 * time reproduces it. Without an explicit order Postgres is free to return
 * rows however it likes, which would let the rails reshuffle after any edit.
 */
function baseQuery() {
  return supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('published', true)
    .order('created_at');
}

type ProductQuery = ReturnType<typeof baseQuery>;

async function queryProducts(
  build: (query: ProductQuery) => ProductQuery = (query) => query,
): Promise<Product[]> {
  const { data, error } = await build(baseQuery());
  if (error) throw new Error(`products query: ${error.message}`);
  const rows = (data ?? []) as unknown as ProductRow[];
  return parseContent('products (supabase)', z.array(productSchema), rows.map(fromRow));
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const [product] = await queryProducts((query) => query.eq('slug', slug));
  return product;
}

export async function productsByCategory(category: CategorySlug): Promise<Product[]> {
  return queryProducts((query) => query.eq('category.slug', category));
}

/**
 * The single dark featured block. Falls back to the first product.
 *
 * Returns null on an empty catalogue rather than throwing. It used to throw
 * "No products in the database", which took the whole homepage down with a 500
 * — every visitor saw a server error because one section had nothing to show.
 * An empty catalogue is a legitimate transient state (mid-rebuild through the
 * admin panel, or a category briefly unpublished), not an exceptional one, so
 * callers skip their section instead. Behaviour is unchanged the moment a
 * single product exists.
 */
export async function featuredProduct(): Promise<Product | null> {
  const [found] = await queryProducts((query) => query.eq('featured', true).limit(1));
  if (found) return found;
  const [first] = await queryProducts((query) => query.limit(1));
  return first ?? null;
}

export async function bestsellers(): Promise<Product[]> {
  return queryProducts((query) => query.eq('bestseller', true));
}

/** Phones + computers, i.e. everything that isn't an accessory. */
export async function deviceRange(): Promise<Product[]> {
  return queryProducts((query) => query.neq('category.slug', 'accessories'));
}

export async function accessories(): Promise<Product[]> {
  return productsByCategory('accessories');
}

/**
 * Escapes a raw search term for use inside a `%…%` ILIKE pattern, then quotes
 * it for PostgREST's `.or()` filter string.
 *
 * Two independent layers, applied in this order because the first can produce
 * characters the second must also escape:
 *
 *  1. ILIKE treats `%`, `_` and `\` itself as special — prefixing each with a
 *     backslash is what makes them match literally rather than as wildcards.
 *     Without this, searching for a plain product name that happens to
 *     contain one (rare here, but not impossible) would silently behave like
 *     a fuzzier query than the customer typed.
 *  2. supabase-js's `.or('name.ilike.VALUE,brand.ilike.VALUE')` parses that
 *     string itself, where `,`, `(` and `)` are syntax — a query like "xo,
 *     black" would otherwise be read as two filters instead of one term.
 *     Wrapping the value in double quotes makes it literal, which is why the
 *     quotes and any backslash the step above just introduced need their own
 *     escaping here.
 */
function ilikeTerm(raw: string): string {
  const escaped = raw.replace(/[\\%_]/g, (char) => `\\${char}`);
  const pattern = `%${escaped}%`;
  return `"${pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 * Matches against `name` and `brand`, published only (via `queryProducts`'s
 * `baseQuery()`) — a search result is a storefront listing like any other, not
 * a way to reach a draft.
 *
 * A blank or whitespace-only query returns `[]` rather than every product:
 * `ILIKE '%%'` matches everything, and a search page silently showing the
 * whole catalogue before anyone typed anything would read as broken, not
 * helpful.
 */
export async function searchProducts(rawQuery: string): Promise<Product[]> {
  const term = rawQuery.trim().replace(/\s+/g, ' ');
  if (!term) return [];

  const pattern = ilikeTerm(term);
  return queryProducts((query) => query.or(`name.ilike.${pattern},brand.ilike.${pattern}`));
}

/**
 * Re-exported for call sites that read a product through these selectors. They
 * are pure functions over an already-fetched `Product`, not queries, and live
 * in `lib/product.ts` so client components can use them without pulling zod or
 * the Supabase client into the browser bundle.
 */
export { priceFrom, primaryVariant, productColours } from '@/lib/product';
