/**
 * Restores the product catalogue into Supabase. Local only — never imported by
 * the app, never deployed.
 *
 *   node --env-file=.env.local --import tsx scripts/seed-supabase.ts
 *
 * Originally the one-time migration off `content/products.ts`; that file is
 * gone now, so it reads the frozen snapshot in `products.seed-data.ts`
 * instead (see the note at the top of that file for why the data is not
 * validated against the current zod schemas).
 *
 * Categories are NOT seeded here — they are created by the SQL migration, and
 * this only reads their ids back to resolve the `category_id` foreign key.
 *
 * Uses the SERVICE ROLE key, which bypasses RLS. Read from the environment;
 * never inline it here.
 *
 * ── Safety ────────────────────────────────────────────────────────────────
 *
 * Refuses to run when `products` is non-empty, so it can never silently
 * duplicate a live catalogue. Pass `--force` ONLY to seed on top of existing
 * rows. It contains no DELETE or TRUNCATE of any kind: restoring over a
 * populated table is a decision for a human with the table editor, not
 * something a script should do on its own.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTS_SEED_DATA } from './products.seed-data';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Run with: node --env-file=.env.local --import tsx scripts/seed-supabase.ts',
  );
}

const supabase = createClient(url, serviceKey);
const force = process.argv.includes('--force');

async function main() {
  const { count, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true });
  if (countError) throw new Error(`pre-flight count: ${countError.message}`);

  if (count && count > 0 && !force) {
    throw new Error(
      `products already holds ${count} row(s) — refusing to seed on top of it. ` +
        'Empty the table deliberately first, or pass --force.',
    );
  }

  const { data: categoryRows, error: categoryError } = await supabase
    .from('categories')
    .select('id, slug');
  if (categoryError) throw categoryError;
  const categoryIdBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));

  const droppedPhotos: string[] = [];
  let variantTotal = 0;

  for (const product of PRODUCTS_SEED_DATA) {
    const categoryId = categoryIdBySlug.get(product.category);
    if (!categoryId) {
      throw new Error(`Unknown category "${product.category}" for product "${product.slug}"`);
    }

    if (product.variants.some((v) => v.images.length > 0)) droppedPhotos.push(product.slug);

    const { data: inserted, error: productError } = await supabase
      .from('products')
      .insert({
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
        battery_health_percent: null,
        /* Explicit rather than relying on the column default: the public query
           layer filters `.eq('published', true)`, so a `false` default would
           restore rows that render nowhere. */
        published: true,
      })
      .select('id')
      .single();
    if (productError) throw new Error(`product ${product.slug}: ${productError.message}`);

    const variantRows = product.variants.map((v, index) => ({
      product_id: inserted.id,
      position: index,
      colour_slug: v.colour.slug,
      colour_hex: v.colour.hex,
      colour_label: v.colour.label,
      storage: v.storage,
      price: v.price,
      compare_at: v.compareAt,
      stock: v.stock,
      /* The original `/public` paths are not valid R2 URLs and would fail
         `productImageUrlSchema` on read. Photos are re-uploaded through the
         admin panel. */
      images: [] as string[],
    }));
    variantTotal += variantRows.length;

    const { error: variantError } = await supabase.from('product_variants').insert(variantRows);
    if (variantError) throw new Error(`variants for ${product.slug}: ${variantError.message}`);

    console.log(
      `seeded ${product.slug} (${variantRows.length} variant${variantRows.length === 1 ? '' : 's'})`,
    );
  }

  console.log(`\ndone — ${PRODUCTS_SEED_DATA.length} products, ${variantTotal} variants`);
  console.log(
    `\nphotos NOT carried over (re-upload via /admin): ${
      droppedPhotos.length ? droppedPhotos.join(', ') : 'none'
    }`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
