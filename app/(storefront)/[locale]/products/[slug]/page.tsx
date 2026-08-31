import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { TikTokViewContent } from '@/components/analytics/TikTokViewContent';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { ProductPageOrder } from '@/components/ui/ProductPageOrder';
import { routing } from '@/i18n/routing';
import { primaryVariant } from '@/lib/product';
import { getProduct } from '@/lib/queries/products';
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
 * The page IS the order form. It used to open with a summary block — gallery,
 * name, price, and a button whose only job was to scroll down to the form —
 * above the form itself, which repeats the name and the photo and is
 * self-sufficient without it. That duplication was the client's own report:
 * the same product named twice, the same photo twice, and a button standing in
 * for a section that could simply be first.
 *
 * What went with it is worth knowing before adding anything back here (all of
 * it still renders in `<QuickView />`, which is unchanged): `<ProductInfo />`'s
 * brand line, description, specs, stock dot, the capacity/battery-health pills,
 * and the compare-at price with its discount badge — the form's summary shows
 * the charged price only. `<ProductGallery />` went too, and `<CheckoutView />`
 * shows one static photo rather than all of a variant's.
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

  /* Still read, though nothing on the page renders it directly: the pixel
     reports the price a visitor arrived to see, and `primaryVariant` is what
     `<CheckoutView />` opens on, so the two agree by construction. */
  const variant = primaryVariant(product);

  return (
    <>
      {/* The ad-funnel's first half. Pairs with the `Purchase` fired from
          <CheckoutView />; both carry `content_id: product.slug`, which is what
          lets TikTok match a view to the order it produced. Renders nothing. */}
      <TikTokViewContent slug={slug} name={product.name} price={variant.price} />

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
