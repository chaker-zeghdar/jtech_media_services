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
  description: unknown;
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
    description: row.description,
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
