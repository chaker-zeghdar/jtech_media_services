/**
 * One-time repair of variant colours whose stored hex contradicts their name.
 * Local only — never imported by the app, never deployed.
 *
 *   node --env-file=.env.local --import tsx scripts/repair-colour-hex.ts          # dry run
 *   node --env-file=.env.local --import tsx scripts/repair-colour-hex.ts --apply  # write
 *
 * The admin form used to take the colour NAME and the colour HEX as two
 * independent inputs, defaulting the hex to `#000000` — so "never touched it"
 * was indistinguishable from "chose black", and a live variant ended up
 * labelled `white` and painted black. The form now derives the hex from the
 * name (see `content/colours.ts`); this brings existing rows in line.
 *
 * Dry run by default. A script that rewrites live product data on the strength
 * of a fuzzy name match should show its work before doing it.
 *
 * Names it does not recognise are REPORTED, never guessed at: a confidently
 * wrong colour is worse than an obviously neutral one, and a human can look at
 * the short list this prints.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { colourHexFor, findColourPreset } from '../content/colours';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
}

const supabase = createClient(url, serviceKey);
const apply = process.argv.includes('--apply');

async function main() {
  const { data, error } = await supabase
    .from('product_variants')
    .select('id, colour_label, colour_hex, product:products(slug, name)');
  if (error) throw new Error(`read: ${error.message}`);

  /* `as unknown as` because Supabase types an embedded to-one relation as an
     ARRAY here; it is a single row at runtime, and the cast says so once rather
     than being worked around at every use. */
  const rows = (data ?? []) as unknown as {
    id: string;
    colour_label: string;
    colour_hex: string;
    product: { slug: string; name: string } | null;
  }[];

  const fixes: { id: string; from: string; to: string; label: string; product: string }[] = [];
  const unknown: { id: string; label: string; product: string; hex: string }[] = [];

  for (const row of rows) {
    const product = row.product?.slug ?? '(orphan)';
    const preset = findColourPreset(row.colour_label);

    if (!preset) {
      unknown.push({ id: row.id, label: row.colour_label, product, hex: row.colour_hex });
      continue;
    }
    if (row.colour_hex.toUpperCase() !== preset.hex.toUpperCase()) {
      fixes.push({
        id: row.id,
        from: row.colour_hex,
        to: preset.hex,
        label: row.colour_label,
        product,
      });
    }
  }

  console.log(`${rows.length} variant(s) scanned\n`);

  console.log(`— ${fixes.length} with a hex that contradicts its name:`);
  for (const f of fixes) {
    console.log(`   ${f.product.padEnd(22)} "${f.label}"  ${f.from} -> ${f.to}`);
  }

  console.log(`\n— ${unknown.length} whose colour name matches no preset (NOT touched, check by hand):`);
  for (const u of unknown) {
    console.log(
      `   ${u.product.padEnd(22)} "${u.label}"  currently ${u.hex}  ` +
        `(would display as ${colourHexFor(u.label)})`,
    );
  }

  if (!apply) {
    console.log('\nDRY RUN — nothing written. Re-run with --apply to commit these changes.');
    return;
  }

  for (const f of fixes) {
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ colour_hex: f.to })
      .eq('id', f.id);
    if (updateError) throw new Error(`update ${f.id}: ${updateError.message}`);
  }
  console.log(`\napplied — ${fixes.length} variant(s) updated`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
