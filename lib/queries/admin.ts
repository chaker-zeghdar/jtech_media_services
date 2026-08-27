import { z } from 'zod';
import { type OrderStatus, type Product, orderStatusSchema, parseContent, productSchema } from '@/content/schemas';
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

/**
 * The `order_status` values, in the order a dashboard should read them.
 * Derived from `orderStatusSchema` rather than restated, so the enum has one
 * definition shared by the schema, the admin action and this file.
 */
export const ORDER_STATUSES = orderStatusSchema.options;
export type { OrderStatus };

/**
 * A full order row, camelCased.
 *
 * Nullable columns are typed and normalised as `| null`, NOT dropped to
 * `undefined`: `daira_id`, `address`, `product_id`, `variant_id` and `notes`
 * are all genuinely nullable, and the `productSchema.description` incident —
 * where `.optional()` rejected the `null` Postgres actually returns and 500'd
 * every catalogue page — is exactly what happens when a nullable column meets a
 * schema that only allows `undefined`. Null is the value here; it is kept.
 */
export type AdminOrder = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  productId: string | null;
  variantId: string | null;
  productName: string;
  variantLabel: string | null;
  quantity: number;
  unitPrice: number;
  wilayaCode: number;
  dairaId: number | null;
  deliveryMethod: string;
  deliveryFee: number;
  total: number;
  customerName: string;
  customerPhone: string;
  address: string | null;
  landingSlug: string | null;
  notes: string | null;
};

type OrderRowShape = {
  id: string;
  created_at: string;
  status: OrderStatus;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_label: string | null;
  quantity: number;
  unit_price: number;
  wilaya_code: number;
  daira_id: number | null;
  delivery_method: string;
  delivery_fee: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  address: string | null;
  landing_slug: string | null;
  notes: string | null;
};

function toAdminOrder(row: OrderRowShape): AdminOrder {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    productId: row.product_id,
    variantId: row.variant_id,
    productName: row.product_name,
    variantLabel: row.variant_label,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    wilayaCode: row.wilaya_code,
    dairaId: row.daira_id,
    deliveryMethod: row.delivery_method,
    deliveryFee: row.delivery_fee,
    total: row.total,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    address: row.address,
    landingSlug: row.landing_slug,
    notes: row.notes,
  };
}

/** Newest first. Optionally narrowed to one status for the filter pills. */
export async function listAdminOrders(status?: OrderStatus): Promise<AdminOrder[]> {
  const supabase = await createClient();
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw new Error(`listAdminOrders: ${error.message}`);
  return ((data ?? []) as OrderRowShape[]).map(toAdminOrder);
}

export async function getAdminOrder(id: string): Promise<AdminOrder | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`getAdminOrder: ${error.message}`);
  return data ? toAdminOrder(data as OrderRowShape) : null;
}

/** One daira's display name, for the order detail page. Null when unset. */
export async function getDairaName(id: number | null): Promise<string | null> {
  if (id === null) return null;
  const supabase = await createClient();
  const { data } = await supabase.from('dairas').select('name').eq('id', id).maybeSingle();
  return (data?.name as string) ?? null;
}

/** Wilaya display name for an order row. */
export async function getWilayaName(code: number): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('wilayas').select('name_ar').eq('code', code).maybeSingle();
  return (data?.name_ar as string) ?? null;
}

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
