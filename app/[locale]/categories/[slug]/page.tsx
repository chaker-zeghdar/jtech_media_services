import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { categories } from '@/content/categories';
import { productsByCategory } from '@/content/products';
import type { CategorySlug } from '@/content/schemas';
import { whatsappLink } from '@/content/settings';
import { routing } from '@/i18n/routing';
import { pickLocale } from '@/lib/format';

export const dynamic = 'force-dynamic';

/**
 * One category, one page — the thing `categoryHref()` promised and returned
 * `#range` for until now. Every category entry in the header, the homepage
 * category tiles and the footer column resolves here, so "iPhone" and "Samsung"
 * finally land somewhere different from each other.
 *
 * Deliberately plain. The Dribbble reference this project's hero follows only
 * ever shows a hero; it has nothing to say about a listing page. So this is
 * built out of the pieces the rest of JTECH already uses — <Section>,
 * <Container>, <SectionHeader>, <ProductCard> — and reads as the same site
 * rather than a second design language bolted on.
 */

const SLUGS: readonly CategorySlug[] = categories.map((category) => category.slug);

function isCategorySlug(value: string): value is CategorySlug {
  return (SLUGS as readonly string[]).includes(value);
}

type PageParams = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !isCategorySlug(slug)) return {};

  const category = categories.find((entry) => entry.slug === slug);
  if (!category) return {};

  const t = await getTranslations({ locale, namespace: 'categoryPage' });
  const name = pickLocale(category.name, locale);

  // Same `as-needed` rule the root layout documents: Arabic carries no prefix,
  // so its canonical is the bare path.
  const path = (target: string) =>
    target === routing.defaultLocale ? `/categories/${slug}` : `/${target}/categories/${slug}`;

  return {
    title: t('metaTitle', { category: name }),
    description: t('metaDescription', { category: name }),
    alternates: {
      canonical: path(locale),
      languages: Object.fromEntries(routing.locales.map((entry) => [entry, path(entry)])),
    },
  };
}

export default async function CategoryPage({ params }: PageParams) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // An unknown slug is a 404, not a crash and not an empty page — the union is
  // the source of truth and anything outside it never existed.
  if (!isCategorySlug(slug)) notFound();

  setRequestLocale(locale);

  const category = categories.find((entry) => entry.slug === slug);
  if (!category) notFound();

  const t = await getTranslations({ locale, namespace: 'categoryPage' });
  const tProduct = await getTranslations({ locale, namespace: 'product' });
  const name = pickLocale(category.name, locale);
  const items = productsByCategory(slug);

  return (
    <Section id="category" background="white">
      <Container>
        <SectionHeader
          id="category"
          eyebrow={t('eyebrow')}
          title={name}
          subhead={items.length > 0 ? t('count', { count: items.length }) : undefined}
        />

        {items.length > 0 ? (
          /* The same card in the same bed the homepage rails use. A grid rather
             than a <Carousel /> because a category page is where someone wants
             to see everything at once, not scrub sideways through a selection. */
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <li key={product.slug}>
                <ProductCard
                  product={product}
                  locale={locale}
                  bed="white"
                  sizes={GRID_SIZES}
                />
              </li>
            ))}
          </ul>
        ) : (
          /* Reachable: the union is fixed but a category can legitimately be out
             of stock. A dead end with a way out beats an empty grid. */
          <div className="mt-14 max-w-prose">
            <p className="text-subhead text-gray-700">{t('empty')}</p>
            <Button
              className="mt-6"
              href={whatsappLink(tProduct('generalMessage'))}
              external
            >
              {t('emptyCta')}
            </Button>
          </div>
        )}
      </Container>
    </Section>
  );
}

/**
 * Painted width per breakpoint, matching the grid above: one column under sm,
 * two to lg, three past it, inside <Container>'s max-w-shell.
 */
const GRID_SIZES = '(max-width: 639px) calc(100vw - 3rem), (max-width: 1023px) calc(50vw - 3rem), 33vw';
