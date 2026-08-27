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
  description: unknown;
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
    description: row.description,
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

/** The single dark featured block. Falls back to the first product. */
export async function featuredProduct(): Promise<Product> {
  const [found] = await queryProducts((query) => query.eq('featured', true).limit(1));
  if (found) return found;
  const [first] = await queryProducts((query) => query.limit(1));
  if (!first) throw new Error('No products in the database');
  return first;
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
 * Re-exported for call sites that read a product through these selectors. They
 * are pure functions over an already-fetched `Product`, not queries, and live
 * in `lib/product.ts` so client components can use them without pulling zod or
 * the Supabase client into the browser bundle.
 */
export { priceFrom, primaryVariant, productColours } from '@/lib/product';
