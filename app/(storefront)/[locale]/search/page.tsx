import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { SearchForm } from '@/components/layout/SearchForm';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { whatsappLink } from '@/content/settings';
import { routing } from '@/i18n/routing';
import { searchProducts } from '@/lib/queries/products';

/**
 * The one search results page — what the header's search icon, and the
 * drawer's own search box on narrow screens, both send a customer to.
 *
 * Deliberately not the "expand an input inline in the header" version: see
 * `<Header />`'s doc comment for why that would have had to fight the header's
 * existing sticky/over-hero/RTL-pill state instead of just sitting beside it.
 * This page owns the actual typing surface instead — its own `<SearchForm />`
 * autofocuses when there is nothing typed yet, so "click the icon, start
 * typing" still holds; it's just one page away rather than in place.
 *
 * `noindex`: a site's own internal search results are duplicate/thin content
 * from a crawler's point of view — `?q=` permutes endlessly and every one of
 * them is a worse landing page than the category or product page it points at.
 * `follow` stays on so a crawler can still walk from a result card to the real
 * product page.
 */

export const dynamic = 'force-dynamic';

type PageParams = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: 'search' });

  return {
    title: t('metaTitle'),
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ params, searchParams }: PageParams) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const { q } = await searchParams;
  /* Same normalisation `searchProducts` applies server-side — done again here
     so an empty/whitespace-only `?q=` renders the PROMPT state rather than
     asking the database for it and getting `[]` back the long way round. */
  const query = (q ?? '').trim().replace(/\s+/g, ' ');

  const t = await getTranslations('search');
  const tProduct = await getTranslations('product');
  const items = query ? await searchProducts(query) : [];

  return (
    <Section id="search" background="white">
      <Container>
        <SectionHeader
          id="search"
          eyebrow={t('eyebrow')}
          title={query ? t('titleQuery', { query }) : t('titleEmpty')}
          subhead={items.length > 0 ? t('count', { count: items.length }) : undefined}
        />

        {/* Pre-filled with whatever's already in the URL, so refining a search
            (or correcting a typo) doesn't mean clearing a blank box first.
            Autofocus only when there's nothing typed yet — a customer who
            already has real results on screen shouldn't have their keyboard
            pop up and steal focus from the page they're reading. */}
        <SearchForm defaultValue={query} autoFocus={!query} className="mt-8 max-w-md" />

        {!query ? (
          <p className="mt-8 max-w-prose text-subhead text-gray-700">{t('promptEmpty')}</p>
        ) : items.length > 0 ? (
          /* Same card, same grid the category pages use — a search result is a
             product listing like any other, not a new design. */
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} locale={locale} bed="white" sizes={GRID_SIZES} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-14 max-w-prose">
            <p className="text-subhead text-gray-700">{t('noResults', { query })}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {/* No standalone `/categories` index exists — the homepage's own
                  category tiles are it, so that's what "browse all
                  categories" actually points at. */}
              <Button href="/#categories">{t('noResultsCta')}</Button>
              <Button href={whatsappLink(tProduct('generalMessage'))} external variant="secondary">
                {tProduct('order')}
              </Button>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}

/** Same painted width as the category grid's — same grid, same breakpoints. */
const GRID_SIZES = '(max-width: 639px) calc(100vw - 3rem), (max-width: 1023px) calc(50vw - 3rem), 33vw';
