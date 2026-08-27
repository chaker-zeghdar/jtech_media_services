import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * ONE middleware doing two unrelated jobs, because Next.js allows exactly one
 * middleware file and a second would silently never run.
 *
 *   /admin/**  → Supabase session refresh + the auth gate. No next-intl.
 *   everything else → next-intl's locale routing, exactly as before.
 *
 * ── Why /admin is NOT localized ────────────────────────────────────────────
 *
 * The admin panel lives at `app/admin/`, outside the `[locale]` segment. It has
 * one user, who speaks Arabic, and giving it ar/fr/en routing would mean three
 * URLs for every screen and a translation burden on a private tool. Public copy
 * is trilingual because customers are; this isn't.
 *
 * That decision has a load-bearing consequence here. The previous matcher,
 * `/((?!api|_next|_vercel|.*\..*).*)`, **matched `/admin`** — next-intl would
 * have treated it as a path under the unprefixed default locale and rewritten
 * it to `/ar/admin`, which does not exist. Admin routes have to be excluded
 * from next-intl before they can work at all; the exclusion is in the matcher
 * below and in the early return in `middleware()`.
 */

const handleIntl = createMiddleware(routing);

/** The one admin path reachable without a session. */
const LOGIN_PATH = '/admin/login';

async function handleAdmin(request: NextRequest) {
  /* The response is created up front and mutated by `setAll`, because a
     refreshed token has to be written onto the response that is actually
     returned. Building a fresh NextResponse afterwards would discard the
     refreshed cookies and log the admin out at random intervals. */
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Verified against the auth server, not just decoded from the cookie — this
  // is an authorisation decision, so `getUser()` rather than `getSession()`.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLogin = pathname === LOGIN_PATH;

  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    // Where to return to once signed in.
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Already signed in and staring at the login form — send them onward.
  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return handleAdmin(request);
  }
  return handleIntl(request);
}

export const config = {
  /**
   * Unchanged from the next-intl original, and `/admin` deliberately still
   * matches: this middleware IS the auth gate, so excluding admin paths here
   * would mean the gate never runs. What keeps next-intl away from them is the
   * dispatcher above, not the matcher.
   *
   * `/api` stays excluded from both — the upload route does its own session
   * check server-side rather than relying on this gate, so that a change here
   * can't quietly open it.
   */
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
