import { z } from 'zod';
import { type Product, parseContent, productSchema } from '@/content/schemas';
import { createClient } from '@/lib/supabase/server';

/**
 * Admin-side reads.
 *
 * Two things separate these from `lib/queries/products.ts`:
 *
 *   1. **No `published` filter.** The public queries hide unpublished rows; the
 *      admin list is the one place that must show them, or a draft product
 *      would be invisible to the person drafting it.
 *   2. **The session-aware client.** These run behind the admin gate and read
 *      through the caller's session, so RLS sees an authenticated user rather
 *      than the anon role.
 *
 * Rows still go through `productSchema`, so anything the admin list can show is
 * something the storefront can render.
 */

const PRODUCT_SELECT = `
  *,
  category:categories!inner(slug),
  product_variants(*)
`;

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

type ProductRow = {
  id: string;
  slug: string;
  brand: string;
  category: { slug: string };
  badges: string[];
  featured: boolean;
  bestseller: boolean;
  published: boolean;
  name: unknown;
  description: string | null;
  specs: unknown;
  highlights: unknown;
  battery_health_percent: number | null;
  product_variants: VariantRow[];
};

/** A validated `Product`, plus the two columns only the admin cares about. */
export type AdminProduct = Product & { id: string; published: boolean };

function toContentShape(row: ProductRow): unknown {
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

function toAdminProduct(row: ProductRow): AdminProduct {
  const product = parseContent(`product ${row.slug} (supabase)`, productSchema, toContentShape(row));
  return { ...product, id: row.id, published: row.published };
}

export async function listAdminProducts(): Promise<AdminProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at');

  if (error) throw new Error(`listAdminProducts: ${error.message}`);
  return ((data ?? []) as unknown as ProductRow[]).map(toAdminProduct);
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).eq('id', id).maybeSingle();

  if (error) throw new Error(`getAdminProduct: ${error.message}`);
  if (!data) return null;
  return toAdminProduct(data as unknown as ProductRow);
}

/* -------------------------------------------------------------------------- */
/*  Orders — dashboard reads only. The full order views land in prompt 3.      */
/* -------------------------------------------------------------------------- */

/** The `order_status` enum, in the order a dashboard should read them. */
export const ORDER_STATUSES = ['pending', 'confirmed', 'delivered', 'canceled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderSummary = {
  id: string;
  productName: string;
  variantLabel: string | null;
  customerName: string;
  total: number;
  createdAt: string;
};

/**
 * How many orders sit in each status.
 *
 * One row-per-order fetch of just the `status` column, tallied in JS. Postgres
 * could group this server-side, but PostgREST has no GROUP BY without a
 * database view or RPC, and four `head: true` counts would be four round trips
 * for a number this small. Revisit if the table ever gets large enough to care.
 *
 * Every status is present in the result even at zero, so the dashboard renders
 * a stable set of cards rather than a row that changes shape with the data.
 */
export async function countOrdersByStatus(): Promise<Record<OrderStatus, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('orders').select('status');
  if (error) throw new Error(`countOrdersByStatus: ${error.message}`);

  const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<
    OrderStatus,
    number
  >;
  for (const row of (data ?? []) as { status: OrderStatus }[]) {
    if (row.status in counts) counts[row.status] += 1;
  }
  return counts;
}

/** The newest orders still awaiting action — the dashboard's one worklist. */
export async function recentPendingOrders(limit = 5): Promise<OrderSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('id, product_name, variant_label, customer_name, total, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`recentPendingOrders: ${error.message}`);

  return ((data ?? []) as {
    id: string;
    product_name: string;
    variant_label: string | null;
    customer_name: string;
    total: number;
    created_at: string;
  }[]).map((row) => ({
    id: row.id,
    productName: row.product_name,
    variantLabel: row.variant_label,
    customerName: row.customer_name,
    total: row.total,
    createdAt: row.created_at,
  }));
}

/** Slug → id, for resolving `products.category_id` on save. */
export async function categoryIdBySlug(): Promise<Map<string, string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('categories').select('id, slug');
  if (error) throw new Error(`categoryIdBySlug: ${error.message}`);
  const rows = parseContent(
    'categories (supabase)',
    z.array(z.object({ id: z.string(), slug: z.string() })),
    data,
  );
  return new Map(rows.map((row) => [row.slug, row.id]));
}
