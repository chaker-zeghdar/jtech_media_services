import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Session-aware client for Server Components, Server Actions and route
 * handlers in the admin area.
 *
 * `getAll`/`setAll`, not `get`/`set`/`remove`: the latter trio is deprecated in
 * the installed @supabase/ssr (0.12) and its own types warn that partial
 * implementations cause "random logouts, early session termination, JSON
 * parsing errors". Checked against the installed package rather than copied
 * from an older guide.
 *
 * The `setAll` try/catch is required, not defensive noise. `cookies()` is
 * read-only inside Server Components — only middleware, Server Actions and
 * route handlers may write. A token refresh triggered during a page render
 * therefore throws here, and swallowing it is correct **because the middleware
 * refreshes the session on every admin request anyway**, so the write that
 * matters already happened somewhere it was allowed.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component render — middleware owns the refresh. See above.
          }
        },
      },
    },
  );
}

/**
 * The signed-in admin, or null.
 *
 * `getUser()` rather than `getSession()`: `getSession()` returns whatever the
 * cookie claims without verifying it against the auth server, which is fine for
 * rendering but not for an authorisation decision. Every gate in this codebase
 * uses this function.
 */
export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
