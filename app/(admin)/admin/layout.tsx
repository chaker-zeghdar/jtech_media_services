import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { plexArabic } from '@/lib/fonts';
import { getAdminUser } from '@/lib/supabase/server';
import '../../globals.css';

/**
 * The admin area's ROOT layout — it renders its own `<html>`/`<body>`.
 *
 * Next allows exactly one root layout per route group, and the storefront's
 * lives at `app/(storefront)/[locale]/layout.tsx`. Splitting the two into
 * groups is what lets `/admin` sit outside the `[locale]` segment at all; the
 * groups are URL-transparent, so every public path is byte-identical to before.
 *
 * Deliberately NOT wrapped in `NextIntlClientProvider`: this panel is
 * monolingual (see middleware.ts for the reasoning), so nothing under `/admin`
 * may use `useTranslations` — including storefront UI components that call it
 * internally, which is why this area builds its own plain inputs rather than
 * reusing `<Field />` and friends.
 *
 * `dir="ltr"` even though the copy is Arabic: the form is dense with Latin
 * data — slugs, hex codes, prices, URLs, `contentType` strings — and an RTL
 * frame around predominantly-LTR technical fields is harder to scan, not
 * easier. Individual Arabic inputs set their own direction.
 */
export const metadata: Metadata = {
  title: 'JTECH — لوحة التحكم',
  // A private tool has no business in an index.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Null on /admin/login, which is the one page reachable without a session.
  const user = await getAdminUser();

  return (
    /* `plexArabic.variable` is what actually defines `--font-plex-arabic`. Without
       it this subtree resolved `--font-stack-arabic` past the variable and into
       its `-apple-system, …, sans-serif` tail, so the whole panel rendered in the
       browser's UI font while the storefront rendered in Plex. `lang="ar"` already
       matches the `html[lang^='ar']` rule in globals.css that points `--font-ui`
       at the Arabic stack, so this one className is the entire fix. */
    <html lang="ar" dir="ltr" className={plexArabic.variable}>
      <body className="min-h-screen bg-gray-50 text-ink antialiased">
        {user ? (
          <header className="border-b border-gray-300 bg-white">
            {/* `flex-wrap` on both rows — same pattern the page headers below
                already use (see `/admin` and `/admin/products`). Without it,
                this row never wraps, so on a narrow screen the logo, the three
                nav links, "عرض المتجر", the email and logout button all fight
                for one line and the row overflows the viewport, taking the
                whole page with it (every table below inherited that overflow
                too — a table can only be as narrow as its ancestors let it). */}
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <Link href="/admin" className="whitespace-nowrap text-base font-semibold">
                  JTECH · لوحة التحكم
                </Link>

                <AdminNav />

                {/* Crosses into the storefront root layout, so Next does a full
                    document navigation here rather than a client transition —
                    which is correct: the two groups load different CSS and a
                    different provider tree. */}
                <Link href="/" className="text-sm text-gray-700 hover:text-ink">
                  عرض المتجر ↗
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <span className="hidden text-sm text-gray-700 sm:inline">{user.email}</span>
                <LogoutButton />
              </div>
            </div>
          </header>
        ) : null}

        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
