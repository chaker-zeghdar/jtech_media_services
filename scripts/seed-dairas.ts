/**
 * One-time import of Algeria's dairas into Supabase. Local only — never
 * imported by the app, never deployed.
 *
 *   node --env-file=.env.local --import tsx scripts/seed-dairas.ts
 *
 * Source: github.com/othmanus/algeria-cities, whose SQL dump is COMMUNE-level
 * (1,541 rows, one per commune) and written in MySQL dialect —
 * `VARCHAR(255) NOT NULL COMMENT '...'` is not valid Postgres, so the file
 * cannot simply be replayed. It is parsed here and reduced instead.
 *
 * We only keep daira-level rows: delivery pricing is wilaya-only (see
 * `wilayas.desk_fee`/`home_fee`), and the daira exists purely to make a
 * customer's address precise. Deduplicating `(wilaya_code, daira_name)`
 * collapses the 1,541 communes to Algeria's ~550 dairas.
 *
 * Uses the SERVICE ROLE key, which bypasses RLS. Read from the environment;
 * never inline it here.
 *
 * ── Safety ────────────────────────────────────────────────────────────────
 *
 * Refuses to run when `dairas` is non-empty, so it can never silently
 * duplicate. Pass `--force` to seed on top of existing rows. It contains no
 * DELETE or TRUNCATE: clearing a populated table is a decision for a human.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SOURCE_URL =
  'https://raw.githubusercontent.com/othmanus/algeria-cities/master/sql/algeria_cities.sql';

/**
 * Field positions AFTER the leading integer id is stripped — see `splitTuple`.
 * Order in the dump: id, commune_name, commune_name_ascii, daira_name,
 * daira_name_ascii, wilaya_code, wilaya_name, wilaya_name_ascii.
 */
const DAIRA_NAME = 2;
const DAIRA_NAME_ASCII = 3;
const WILAYA_CODE = 4;

/** Insert size. Small enough to stay well under any statement/body limit. */
const BATCH = 200;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Run with: node --env-file=.env.local --import tsx scripts/seed-dairas.ts',
  );
}

const supabase = createClient(url, serviceKey);
const force = process.argv.includes('--force');

/**
 * Splits one `VALUES (...)` tuple into its seven string fields.
 *
 * ── The source does not escape apostrophes ─────────────────────────────────
 *
 * Real daira names contain them — M'sara, M'daourouche, El H'madna, Sidi
 * M'hamed Benali — and the dump writes them raw: `'M'sara'`, not the SQL-legal
 * `'M''sara'`. So the file is not actually parseable as SQL, and a quote-aware
 * tokenizer (the obvious first attempt) treats every one of those rows as
 * malformed and drops it. That silently loses whole dairas while still
 * reporting "every wilaya covered", because the wilaya keeps its other dairas.
 *
 * What IS reliable is the shape: a fixed 8-column layout where the first field
 * is a bare integer and the rest are quoted. Splitting on the `','` boundary
 * rather than on `,` never trips over a lone apostrophe inside a name, because
 * an apostrophe is only ever a separator when a comma and another quote follow
 * it. Returns the seven fields after the id.
 */
function splitTuple(tuple: string): string[] | null {
  const match = /^\s*\d+\s*,\s*'([\s\S]*)'\s*$/.exec(tuple);
  if (!match) return null;
  return match[1]!.split("','");
}

type Daira = { wilaya_code: number; name: string; name_ascii: string };

function parseDairas(sql: string): Daira[] {
  // Every tuple that follows a VALUES keyword, up to the closing paren before
  // the statement's semicolon.
  const tuples = sql.matchAll(/VALUES\s*\(([\s\S]*?)\);/g);

  const seen = new Map<string, Daira>();
  let rows = 0;
  let skipped = 0;

  for (const match of tuples) {
    rows += 1;
    const fields = splitTuple(match[1]!);

    const name = fields?.[DAIRA_NAME];
    const nameAscii = fields?.[DAIRA_NAME_ASCII];
    const code = Number(fields?.[WILAYA_CODE]);

    if (
      !fields ||
      fields.length !== 7 ||
      !name ||
      !nameAscii ||
      !Number.isInteger(code) ||
      code < 1 ||
      code > 58
    ) {
      skipped += 1;
      console.warn(`  skipped malformed tuple: ${match[1]!.slice(0, 70)}…`);
      continue;
    }

    // A daira name is only unique WITHIN its wilaya, so the key carries both.
    const key = `${code}::${name}`;
    if (!seen.has(key)) seen.set(key, { wilaya_code: code, name, name_ascii: nameAscii });
  }

  console.log(`parsed ${rows} commune rows (${skipped} skipped) -> ${seen.size} unique dairas`);
  /* Any skip here means a daira may have been dropped entirely, which the
     per-wilaya cross-check below would NOT catch. Fail rather than import a
     quietly incomplete address list. */
  if (skipped > 0) throw new Error(`${skipped} tuple(s) failed to parse — refusing a partial import`);
  return [...seen.values()].sort(
    (a, b) => a.wilaya_code - b.wilaya_code || a.name_ascii.localeCompare(b.name_ascii),
  );
}

async function main() {
  const { count, error: countError } = await supabase
    .from('dairas')
    .select('id', { count: 'exact', head: true });
  if (countError) throw new Error(`pre-flight count: ${countError.message}`);

  if (count && count > 0 && !force) {
    throw new Error(
      `dairas already holds ${count} row(s) — refusing to seed on top of it. ` +
        'Empty the table deliberately first, or pass --force.',
    );
  }

  console.log('fetching', SOURCE_URL);
  const response = await fetch(SOURCE_URL);
  if (!response.ok) throw new Error(`fetch failed: ${response.status} ${response.statusText}`);
  const sql = await response.text();

  const dairas = parseDairas(sql);
  if (dairas.length === 0) throw new Error('parsed zero dairas — the source format probably changed');

  for (let i = 0; i < dairas.length; i += BATCH) {
    const slice = dairas.slice(i, i + BATCH);
    const { error } = await supabase.from('dairas').insert(slice);
    if (error) throw new Error(`insert batch at ${i}: ${error.message}`);
    console.log(`  inserted ${i + slice.length}/${dairas.length}`);
  }

  /* Cross-check against `wilayas` rather than against a hardcoded 58: if a
     wilaya ends up with no dairas the address picker silently offers nothing
     for it, which is the kind of gap that only shows up as a customer
     complaint. Warn loudly instead. */
  const { data: wilayaRows, error: wilayaError } = await supabase.from('wilayas').select('code, name_fr');
  if (wilayaError) throw new Error(`wilaya cross-check: ${wilayaError.message}`);

  const covered = new Set(dairas.map((d) => d.wilaya_code));
  const missing = (wilayaRows ?? []).filter((w) => !covered.has(w.code as number));

  const { count: finalCount } = await supabase
    .from('dairas')
    .select('id', { count: 'exact', head: true });

  console.log(`\ndone — ${finalCount} dairas across ${covered.size} wilayas`);
  if (missing.length > 0) {
    console.warn(
      `\n⚠️  ${missing.length} wilaya(s) have NO dairas: ` +
        missing.map((w) => `${w.code} ${w.name_fr}`).join(', '),
    );
  } else {
    console.log('every wilaya in the table has at least one daira.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
