'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { type OrderStatus, orderStatusSchema } from '@/content/schemas';
import { saveInputSchema } from '@/lib/admin/productInput';
import { categoryIdBySlug } from '@/lib/queries/admin';
import { createClient, getAdminUser } from '@/lib/supabase/server';

/**
 * Admin write actions.
 *
 * Every one of them re-checks the session. The middleware already gates
 * `/admin`, and RLS already requires an authenticated role — this is the third
 * layer, and it is the cheap one: a Server Action is a POST endpoint that any
 * client can call directly, so "the page it lives on was protected" is not by
 * itself an authorisation argument.
 */

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error('Not authenticated.');
  return user;
}

/**
 * Creates or updates a product and **replaces its variants wholesale**.
 *
 * The variant set is deleted and re-inserted rather than diffed. The form
 * always submits the complete current list, so a diff would be strictly more
 * code arriving at the same rows — and it is the approach the schema file's own
 * comment anticipates in explaining why `product_variants` carries no
 * `updated_at` trigger.
 *
 * Not transactional. Supabase's JS client has no multi-statement transaction,
 * so a failure between the delete and the insert would leave a product with no
 * variants — visible in the admin list, and fixed by saving again. Making this
 * atomic means moving it into a Postgres function, which is the right upgrade
 * if it ever actually bites.
 */
export async function saveProduct(rawInput: unknown): Promise<{ id: string }> {
  await requireAdmin();

  /* Validated against `productSchema` itself, not an admin-shaped lookalike:
     whatever survives this call is guaranteed to render on the storefront
     without a runtime zod failure, because it is the identical schema the
     public query layer parses rows through. */
  const { id, published, product } = saveInputSchema.parse(rawInput);

  const supabase = await createClient();
  const categoryIds = await categoryIdBySlug();
  const categoryId = categoryIds.get(product.category);
  if (!categoryId) throw new Error(`Unknown category "${product.category}".`);

  const row = {
    slug: product.slug,
    category_id: categoryId,
    brand: product.brand,
    badges: product.badges,
    featured: product.featured,
    bestseller: product.bestseller,
    name: product.name,
    description: product.description,
    specs: product.specs,
    highlights: product.highlights,
    battery_health_percent: product.batteryHealthPercent,
    published,
  };

  let productId = id;

  if (productId) {
    const { error } = await supabase.from('products').update(row).eq('id', productId);
    if (error) throw new Error(`Saving the product failed: ${error.message}`);
  } else {
    const { data, error } = await supabase.from('products').insert(row).select('id').single();
    if (error) throw new Error(`Creating the product failed: ${error.message}`);
    productId = data.id as string;
  }

  const { error: deleteError } = await supabase
    .from('product_variants')
    .delete()
    .eq('product_id', productId);
  if (deleteError) throw new Error(`Clearing old variants failed: ${deleteError.message}`);

  const variantRows = product.variants.map((variant, index) => ({
    /* The form mints a uuid per variant, so ids are explicit rather than
       server-assigned. That is what lets the whole payload validate against
       `productVariantSchema` (which requires an `id`) before it is sent. */
    id: variant.id,
    product_id: productId,
    position: index,
    colour_slug: variant.colour.slug,
    colour_hex: variant.colour.hex,
    colour_label: variant.colour.label,
    storage: variant.storage,
    price: variant.price,
    compare_at: variant.compareAt,
    stock: variant.stock,
    images: variant.images,
  }));

  const { error: insertError } = await supabase.from('product_variants').insert(variantRows);
  if (insertError) throw new Error(`Saving the variants failed: ${insertError.message}`);

  revalidateEverything();
  return { id: productId };
}

export async function setPublished(id: string, published: boolean): Promise<void> {
  await requireAdmin();
  const parsed = z.object({ id: z.string().uuid(), published: z.boolean() }).parse({ id, published });

  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ published: parsed.published })
    .eq('id', parsed.id);
  if (error) throw new Error(`Updating publication failed: ${error.message}`);

  revalidateEverything();
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await requireAdmin();
  /* `orderStatusSchema` is the shared definition from content/schemas.ts, not a
     second copy — the Postgres enum, this action and the admin UI all read the
     same four values, so none of them can drift. */
  const parsed = z
    .object({ id: z.string().uuid(), status: orderStatusSchema })
    .parse({ id, status });

  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status: parsed.status })
    .eq('id', parsed.id);
  if (error) throw new Error(`Updating order status failed: ${error.message}`);

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${parsed.id}`);
  // The dashboard's pending count is derived from these rows.
  revalidatePath('/admin');
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  const parsed = z.string().uuid().parse(id);

  const supabase = await createClient();
  /* Variants go first. The FK is ON DELETE CASCADE in the schema, so this is
     belt-and-braces rather than required — but it keeps the delete correct even
     if that constraint is ever relaxed. */
  await supabase.from('product_variants').delete().eq('product_id', parsed);
  const { error } = await supabase.from('products').delete().eq('id', parsed);
  if (error) throw new Error(`Deleting the product failed: ${error.message}`);

  revalidateEverything();
}

/**
 * A catalogue edit can surface anywhere — the homepage rails, a category page,
 * the header and footer category lists. Revalidating the root layout is
 * broader than strictly necessary and is the right trade for a shop this size:
 * a stale price is worse than a rebuild.
 */
function revalidateEverything() {
  revalidatePath('/', 'layout');
  revalidatePath('/admin');
}
