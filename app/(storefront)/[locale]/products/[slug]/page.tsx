import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TikTokViewContent } from '@/components/analytics/TikTokViewContent';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { ProductGallery } from '@/components/ui/ProductGallery';
import { ProductInfo } from '@/components/ui/ProductInfo';
import { ProductPageOrder } from '@/components/ui/ProductPageOrder';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { categoryHref } from '@/components/layout/navigation';
import { primaryVariant } from '@/lib/product';
import { getCategory } from '@/lib/queries/categories';
import { getProduct } from '@/lib/queries/products';
import { pickLocale } from '@/lib/format';
import { getSiteUrl } from '@/lib/siteUrl';

/**
 * One product, at a real URL — the destination a Meta ad points at.
 *
 * Everything else that shows a product in full is `<QuickView />`, a dialog
 * with no address of its own: nothing to put in Ads Manager, nothing to share,
 * nothing for a crawler to read. This page is that address. The dialog stays
 * exactly as it is for in-catalogue browsing, which is faster than a
 * navigation; the two coexist rather than one replacing the other.
 *
 * Structure is deliberately linear: the product, then the order form. There is
 * no dialog to open, so the primary CTA scrolls down rather than opening
 * anything — one page, one path through it.
 */

export const dynamic = 'force-dynamic';

type PageParams = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const product = await getProduct(slug);
  if (!product) return {};

  const variant = primaryVariant(product);
  const title = `${product.name} — JTECH`;
  /* `description` is optional since the catalogue went single-language, so the
     fallback is built from what every product always has: a name, a brand and
     a price. Never an empty tag — an ad preview with a blank description looks
     broken in the feed. */
  const description =
    product.description?.slice(0, 160) ||
    `${product.name} — ${product.brand}، من ${variant.price} دج.`;

  const image = variant.images[0];

  // `as-needed` prefixing, same rule as the root layout: Arabic has no prefix.
  const path =
    locale === routing.defaultLocale ? `/products/${slug}` : `/${locale}/products/${slug}`;

  return {
    metadataBase: getSiteUrl(),
    title,
    description,
    alternates: {
      canonical: path,
      languages: Object.fromEntries(
        routing.locales.map((entry) => [
          entry,
          entry === routing.defaultLocale ? `/products/${slug}` : `/${entry}/products/${slug}`,
        ]),
      ),
    },
    openGraph: {
      title,
      description,
      type: 'website',
      /* Meta's crawler reads Open Graph first. The image is a full R2 URL
         already, which is what it needs — a relative path would resolve
         against the crawler's own origin, not ours. Omitted entirely rather
         than pointing at a placeholder when a product has no photo yet. */
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageParams) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  /* `getProduct` filters `published = true` in its base query, so an
     unpublished draft resolves to undefined here and 404s — an ad must never
     land on a draft, and this is the check that guarantees it. */
  const product = await getProduct(slug);
  if (!product) notFound();

  const t = await getTranslations('product');
  const variant = primaryVariant(product);
  /* Category names are still trilingual — the single-language change in prompt
     1 covered product words only — so this one goes through `pickLocale`. */
  const category = await getCategory(product.category);

  return (
    <>
      {/* The ad-funnel's first half. Pairs with the `Purchase` fired from
          <CheckoutView />; both carry `content_id: product.slug`, which is what
          lets TikTok match a view to the order it produced. Renders nothing. */}
      <TikTokViewContent slug={slug} name={product.name} price={variant.price} />

      <Section id="product" background="white">
        <Container>
          {/* Breadcrumb back into the catalogue. This page is often the FIRST
              thing a visitor sees — they arrived from an ad, not the homepage —
              so it needs a way into the site, not just out of it. Named after
              the actual category rather than a generic "view all", because a
              cold visitor needs to know where the link goes. */}
          {category ? (
            <nav aria-label="مسار التنقل" className="text-sm text-gray-700">
              <Link href={categoryHref(product.category)} className="hover:text-ink">
                ← {pickLocale(category.name, locale as Locale)}
              </Link>
            </nav>
          ) : null}

          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <ProductGallery images={variant.images} name={product.name} />

            <ProductInfo
              product={product}
              titleId="product-title"
              /* This page owns the document outline — the dialog's copy is an
                 h2 because it sits inside a page that already has an h1. */
              headingLevel="h1"
              action={
                /* Scrolls to the form below rather than opening anything.
                   `Button` renders a plain anchor for a `#` href, and
                   globals.css already handles smooth scrolling and the
                   sticky-header offset for anchor targets. */
                <Button href="#order" fullWidth>
                  {t('order')}
                </Button>
              }
            />
          </div>
        </Container>
      </Section>

      <Section id="order" background="gray">
        <Container>
          {/* No heading of its own: <CheckoutView /> already renders a visible
              h2 carrying `titleId`, and adding one here would put the same id
              on two elements in the same document. */}
          <ProductPageOrder product={product} slug={slug} />
        </Container>
      </Section>
    </>
  );
}
