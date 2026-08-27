import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { LogoutButton } from '@/components/admin/LogoutButton';
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
    <html lang="ar" dir="ltr">
      <body className="min-h-screen bg-gray-50 text-ink antialiased">
        {user ? (
          <header className="border-b border-gray-300 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-6">
                <Link href="/admin" className="text-base font-semibold">
                  JTECH · لوحة التحكم
                </Link>
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
