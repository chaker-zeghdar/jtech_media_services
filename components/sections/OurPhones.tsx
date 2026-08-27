import { getLocale, getTranslations } from 'next-intl/server';
import { GoldOrb } from '@/components/brand/GoldOrb';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { categoryHref } from '@/components/layout/navigation';
import { PhoneTabs } from '@/components/sections/PhoneTabs';
import { Button } from '@/components/ui/Button';
import { Carousel } from '@/components/ui/Carousel';
import { ProductCard } from '@/components/ui/ProductCard';
import type { CategorySlug } from '@/content/schemas';
import { getCategories } from '@/lib/queries/categories';
import { productsByCategory } from '@/lib/queries/products';
import { pickLocale } from '@/lib/format';
import { RAIL_ITEM, RAIL_LIMIT, RAIL_SIZES } from '@/lib/rail';

/** The three phone categories, in the order the category strip declares. */
const PHONE_SLUGS = ['iphone', 'samsung', 'android'] as const satisfies readonly CategorySlug[];

/**
 * هواتفنا — a browsable taste of the phone catalogue, one category at a time.
 *
 * Brand device: <GoldOrb />, and this is the page's only one. A phone on a soft
 * gold glow is close to what Posts 1 and 3 actually show, so this is where the
 * "yellow shapes like the posts" request lands now that <BrandMarquee /> — its
 * previous home — no longer exists. One per page is a hard cap in DESIGN.md §3.
 *
 * ── Where the work happens ─────────────────────────────────────────────────
 *
 * All three categories are read HERE, on the server, and handed to <PhoneTabs />
 * as plain arrays. The client component owns one piece of state — which tab is
 * open — and nothing else. Switching tabs is a local re-render: no fetch, no
 * request, and the content layer never crosses to the client. Same split the
 * header already uses for <MobileMenu />.
 */
export async function OurPhones() {
  const locale = await getLocale();
  const t = await getTranslations('phones');
  const tCommon = await getTranslations('common');
  const tA11y = await getTranslations('a11y');

  const categories = await getCategories();

  /* Three category queries, in parallel rather than awaited one after the
     other — they're independent, and serialising them would make this section
     three round trips deep for no reason. */
  const tabs = await Promise.all(
    PHONE_SLUGS.map(async (slug) => {
      const category = categories.find((entry) => entry.slug === slug);
      // Reuses the names already on the category rows — this section introduces
      // no new copy for its own tab labels.
      const name = category ? pickLocale(category.name, locale) : slug;
      const products = (await productsByCategory(slug)).slice(0, RAIL_LIMIT);

      return {
        slug,
        name,
        // Rendered HERE, on the server, because <ProductCard /> is a server
        // component. <PhoneTabs /> only chooses between them.
        rail: (
          <Carousel label={`${name} — ${tA11y('carouselProgress')}`} className="mt-8">
            {products.map((product) => (
              <div key={product.slug} className={RAIL_ITEM}>
                <ProductCard product={product} locale={locale} bed="white" sizes={RAIL_SIZES} />
              </div>
            ))}
          </Carousel>
        ),
        // The way out to the real category page, through the same helper the
        // header, the category tiles and the footer all use.
        viewAll: (
          <Button variant="link" href={categoryHref(slug)}>
            {tCommon('viewAll')}
          </Button>
        ),
      };
    }),
  );

  return (
    <Section
      id="phones"
      background="gray"
      device={<GoldOrb corner="top-end" size={380} opacity={0.5} />}
    >
      <Container>
        <SectionHeader
          id="phones"
          title={t('title')}
          /* Colour-swap accent, not a pill: this section already carries the
             page's <GoldOrb />, and a gold pill on top of that would be two
             loud gold things competing in one viewport. Swapping the three
             brand names to gold-text lifts the part that actually answers
             "what do you sell" without adding a second filled shape.
             gold-text on gray-50 measures ~5.2:1. */
          subhead={t.rich('subhead', {
            em: (chunks) => <span className="font-semibold text-gold-text">{chunks}</span>,
          })}
        />
      </Container>

      <PhoneTabs tabs={tabs} />
    </Section>
  );
}
