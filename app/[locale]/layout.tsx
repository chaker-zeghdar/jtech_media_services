import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { HashAnchorFix } from '@/components/layout/HashAnchorFix';
import { Header } from '@/components/layout/Header';
import { LocalNav } from '@/components/layout/LocalNav';
import { MobileOrderBar } from '@/components/layout/MobileOrderBar';
import { SocialFab } from '@/components/layout/SocialFab';
import { settings } from '@/content/settings';
import { localeDirections, localeTags, routing } from '@/i18n/routing';
import { clientMessages } from '@/lib/clientMessages';
import '../globals.css';

/**
 * Fonts are loaded as CSS variables and consumed from globals.css, where the
 * system stack (SF Pro / SF Arabic) is listed FIRST. On the client's Mac and
 * iPhone the page therefore renders in real SF with no font request at all;
 * these two are the fallback for everyone else. next/font self-hosts both, so
 * there is no request to Google at runtime.
 *
 * Only ONE family is attached per locale (see `fontClassName` below). next/font
 * emits a <link rel="preload"> for every family present on the element, so
 * putting both on <html> made the Arabic page preload Inter and the French page
 * preload four weights of Plex Arabic — pure contention on the critical path for
 * bytes that locale can never render.
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const plexArabic = IBM_Plex_Sans_Arabic({
  /**
   * Arabic glyphs only. The Latin subset was measured as ~1.1s of extra First
   * Contentful Paint on the Arabic page (2.3s vs 1.2s for French) for glyphs
   * that were almost never used: Latin runs on the Arabic page — prices, the
   * JTECH wordmark, spec values like "A18 Pro" — resolve through
   * `--font-stack-latin`, which puts the system face (SF Pro, Segoe UI, Roboto)
   * ahead of any webfont. Those runs were already being rendered by the system,
   * so the downloaded Latin glyphs were dead weight on the critical path.
   */
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-plex-arabic',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Absolute origin for canonical and hreflang tags — Google ignores relative
 * hreflang values, so this has to resolve to a real host.
 *
 * Set NEXT_PUBLIC_SITE_URL once the domain is confirmed. On Vercel preview and
 * production deploys the platform-provided host is used automatically; the
 * literal is only the local-development fallback.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://jtech-dz.com');

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    metadataBase: new URL(siteUrl),
    title: t('title'),
    description: t('description'),
    // `as-needed` means Arabic has no prefix, so the canonical for ar is "/".
    alternates: {
      canonical: locale === routing.defaultLocale ? '/' : `/${locale}`,
      languages: {
        ar: '/',
        fr: '/fr',
        en: '/en',
        'x-default': '/',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: localeTags[locale],
      type: 'website',
      siteName: 'JTECH Media Services',
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Required for static rendering — without it every page opts into dynamic.
  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations('a11y');

  // One family per locale — Arabic gets Plex Arabic, the Latin locales get Inter.
  // The unused CSS variable simply doesn't resolve, and the font stacks in
  // globals.css fall through to the next entry, so nothing needs to branch.
  const fontClassName = locale === 'ar' ? plexArabic.variable : inter.variable;

  return (
    <html
      lang={localeTags[locale]}
      dir={localeDirections[locale]}
      className={fontClassName}
      // Tells Next.js the smooth scrolling in globals.css is deliberate, which
      // silences its "detected scroll-behavior: smooth" console warning.
      data-scroll-behavior="smooth"
    >
      <body className="pb-[68px] md:pb-0">
        <NextIntlClientProvider locale={locale} messages={clientMessages(messages)}>
          <a href="#main" className="skip-link">
            {t('skipToContent')}
          </a>

          <HashAnchorFix />

          {/* No <AnnouncementBar />. Everything it carried now has a better
              home: the phone and WhatsApp are icon buttons in <Header /> (and in
              <MobileMenu /> + <MobileOrderBar /> below sm, where those buttons
              are hidden), the locale switcher moved into <Header /> too, and the
              delivery/cash-on-delivery promise is stated in the hero's own
              subhead rather than in 12px type above it. The component is still
              in components/layout/ if it is ever wanted back; this is the only
              route, so gating it per-page would have been indirection with
              nothing on the other side. */}
          <Header />
          <LocalNav />

          <main id="main" aria-label={t('mainContent')}>
            {children}
          </main>

          <Footer />
          <MobileOrderBar />
          {/* Site-wide, not homepage-only: the social accounts are as relevant
              on a category page as on the homepage, and a control that appears
              and disappears between routes reads as a bug. The three URLs are
              resolved here so the client island never imports the settings
              object — see the note on <SocialFab />. */}
          <SocialFab
            links={[
              { key: 'instagram', url: settings.socials.instagram.url, label: t('openInstagram') },
              { key: 'facebook', url: settings.socials.facebook.url, label: t('openFacebook') },
              { key: 'tiktok', url: settings.socials.tiktok.url, label: t('openTiktok') },
            ]}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
