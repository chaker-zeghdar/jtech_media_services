import { createBrowserClient } from '@supabase/ssr';

/**
 * Session-aware client for admin **client** components (the login form, the
 * product form, the logout button).
 *
 * Distinct from `lib/supabase.ts`, which is the plain anon client the public
 * storefront reads through and which carries no session at all. Public reads
 * don't need auth; the admin panel does, on both sides of the boundary — see
 * `lib/supabase/server.ts` for the server half.
 *
 * Anon key, as always. What authorises a write is the session cookie this
 * client reads, checked by RLS in Postgres — never a privileged key in the
 * browser.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
