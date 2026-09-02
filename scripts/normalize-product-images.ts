/**
 * One-time (and safely repeatable) normalization of every product photo
 * already in R2. Local only — never imported by the app, never deployed.
 *
 *   node --env-file=.env.local --import tsx scripts/normalize-product-images.ts          # dry run
 *   node --env-file=.env.local --import tsx scripts/normalize-product-images.ts --apply  # write
 *
 * New uploads are normalized on the way in by `app/api/admin/uploads/normalize`.
 * This is the other half: the catalogue the client had already uploaded before
 * that existed. Without it they would have to re-upload 50-odd photos by hand
 * to get the fix.
 *
 * ── What it does per image ─────────────────────────────────────────────────
 *
 * Reads the object out of R2, runs `lib/images/normalize.ts` over it, writes
 * the result to a NEW key under `products/normalized/`, and points the variant
 * row at that key. The original object is never deleted or overwritten — it is
 * the only copy of what the client actually shot, and a normalization that
 * turns out to have trimmed into a product has to be redoable from it.
 *
 * ── Dry run by default ─────────────────────────────────────────────────────
 *
 * Same rule as `repair-colour-hex.ts`: a script that rewrites live product data
 * shows its work first. The dry run does all the image processing and reports
 * every decision, and simply does not upload or write to Supabase.
 *
 * ── Re-running is safe ─────────────────────────────────────────────────────
 *
 * URLs already under `products/normalized/` are skipped, so a second run costs
 * nothing and cannot compound. `--force` reprocesses them anyway, which is only
 * useful after changing a constant in the normalizer.
 */
import 'dotenv/config';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import { normalizeProductImage } from '../lib/images/normalize';
import { keyFromPublicUrl, missingR2Vars, normalizedKey, publicUrlFor, r2Client, r2Config } from '../lib/r2';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with: ' +
      'node --env-file=.env.local --import tsx scripts/normalize-product-images.ts',
  );
}

const config = r2Config();
if (!config) {
  throw new Error(`R2 is not configured. Missing or empty: ${missingR2Vars().join(', ')}.`);
}

const supabase = createClient(supabaseUrl, serviceKey);
const client = r2Client(config);
const apply = process.argv.includes('--apply');
const force = process.argv.includes('--force');

/**
 * Below this share of surviving area, the trim took away more than two thirds
 * of the frame. That is usually correct — a cutout exported onto a huge canvas
 * — but it is also what trimming INTO a product looks like, so these are listed
 * for a human to glance at rather than trusted silently.
 */
const REVIEW_TRIM_FLOOR = 0.35;

type VariantRow = { id: string; images: string[]; product: { slug: string } };

type Outcome = {
  variantId: string;
  slug: string;
  index: number;
  from: string;
  to?: string;
  strategy?: string;
  trimKept?: number;
  skipped?: 'already-normalized' | 'foreign-url';
  error?: string;
};

async function main() {
  const { data, error } = await supabase
    .from('product_variants')
    .select('id, images, product:products(slug)');
  if (error) throw new Error(`read: ${error.message}`);

  /* `as unknown as` because Supabase types an embedded to-one relation as an
     ARRAY here; it is a single row at runtime, and the cast says so once. */
  const variants = (data ?? []) as unknown as VariantRow[];
  const totalImages = variants.reduce((sum, v) => sum + (v.images?.length ?? 0), 0);
  console.log(
    `${variants.length} variants, ${totalImages} images. ` +
      `${apply ? 'APPLYING' : 'DRY RUN (pass --apply to write)'}${force ? ', --force' : ''}\n`,
  );

  const outcomes: Outcome[] = [];

  for (const variant of variants) {
    const images = variant.images ?? [];
    const next: string[] = [];
    let changed = false;

    for (const [index, url] of images.entries()) {
      const base: Outcome = { variantId: variant.id, slug: variant.product.slug, index, from: url };

      const key = keyFromPublicUrl(config!, url);
      if (!key) {
        outcomes.push({ ...base, skipped: 'foreign-url' });
        next.push(url);
        continue;
      }
      if (key.startsWith('products/normalized/') && !force) {
        outcomes.push({ ...base, skipped: 'already-normalized' });
        next.push(url);
        continue;
      }

      try {
        const object = await client.send(
          new GetObjectCommand({ Bucket: config!.bucket, Key: key }),
        );
        if (!object.Body) throw new Error('empty object');
        const input = Buffer.from(await object.Body.transformToByteArray());
        const normalized = await normalizeProductImage(input);

        const outKey = normalizedKey(normalized.extension);
        const outUrl = publicUrlFor(config!, outKey);

        if (apply) {
          await client.send(
            new PutObjectCommand({
              Bucket: config!.bucket,
              Key: outKey,
              Body: normalized.buffer,
              ContentType: normalized.contentType,
              CacheControl: 'public, max-age=31536000, immutable',
              /* Provenance. Once a variant row points at the derivative, the
                 original it came from is otherwise unfindable — which matters
                 the first time a normalizer constant changes and the catalogue
                 has to be re-derived from sources rather than from already
                 -normalized squares (re-running over those is a no-op by
                 design). Learned the hard way on `hoco-w35`. */
              Metadata: { 'source-key': key, strategy: normalized.strategy },
            }),
          );
        }

        outcomes.push({
          ...base,
          to: outUrl,
          strategy: normalized.strategy,
          trimKept: normalized.trimKept,
        });
        next.push(outUrl);
        changed = true;
      } catch (err) {
        outcomes.push({ ...base, error: err instanceof Error ? err.message : String(err) });
        next.push(url); // Keep the original: a broken URL is worse than an unprocessed one.
      }
    }

    if (changed && apply) {
      const { error: writeError } = await supabase
        .from('product_variants')
        .update({ images: next })
        .eq('id', variant.id);
      if (writeError) {
        console.error(`  ! ${variant.product.slug}: write failed — ${writeError.message}`);
      }
    }
  }

  report(outcomes);
}

function report(outcomes: Outcome[]) {
  const processed = outcomes.filter((o) => o.to);
  const errors = outcomes.filter((o) => o.error);
  const skipped = outcomes.filter((o) => o.skipped);
  const inset = processed.filter((o) => o.strategy === 'inset');
  const review = processed.filter((o) => (o.trimKept ?? 1) < REVIEW_TRIM_FLOOR);

  for (const o of processed) {
    console.log(
      `  ${o.strategy === 'inset' ? 'inset' : 'crop '}  ` +
        `${String(Math.round((o.trimKept ?? 1) * 100)).padStart(3)}%  ` +
        `${o.slug}[${o.index}]`,
    );
  }

  console.log('\n─────────────────────────────────────────────');
  console.log(`processed          ${processed.length}`);
  console.log(`  inset (cutout)   ${inset.length}`);
  console.log(`  crop (photo)     ${processed.length - inset.length}`);
  console.log(`skipped            ${skipped.length}`);
  for (const reason of ['already-normalized', 'foreign-url'] as const) {
    const n = skipped.filter((o) => o.skipped === reason).length;
    if (n > 0) console.log(`  ${reason.padEnd(20)}${n}`);
  }
  console.log(`errors             ${errors.length}`);
  for (const o of errors) console.log(`  ! ${o.slug}[${o.index}] ${o.error}`);

  if (review.length > 0) {
    console.log(
      `\nCHECK BY HAND — trim removed more than ${Math.round((1 - REVIEW_TRIM_FLOOR) * 100)}% ` +
        `of the frame, which is usually a large empty canvas but is also what\n` +
        `cutting into a product looks like:`,
    );
    for (const o of review) {
      console.log(`  ${o.slug}[${o.index}]  kept ${Math.round((o.trimKept ?? 1) * 100)}%  ${o.to}`);
    }
  }

  if (!apply) console.log('\nDRY RUN — nothing was uploaded or written. Re-run with --apply.');
}

void main();
