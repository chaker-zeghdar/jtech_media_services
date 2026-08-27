import { createClient } from '@supabase/supabase-js';

/**
 * The anon-key client, used for all public reads.
 *
 * Anon key only — it is safe in the browser and RLS is what actually gates
 * access. The service-role key is never imported here; it belongs to
 * `scripts/seed-supabase.ts` and (later) the admin write routes, which read it
 * from the environment at run time.
 *
 * Every read in `lib/queries/` goes through this one instance rather than
 * creating a client per call.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
