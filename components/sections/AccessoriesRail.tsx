import { getLocale, getTranslations } from 'next-intl/server';
import { Halftone } from '@/components/brand/Halftone';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Carousel } from '@/components/ui/Carousel';
import { ProductCard } from '@/components/ui/ProductCard';
import { accessories } from '@/lib/queries/products';
import { RAIL_ITEM, RAIL_SIZES } from '@/lib/rail';

/**
 * Section 6 — accessories rail. Brand device: Halftone, this time on the
 * bottom-start corner so it doesn't echo the range section's placement.
 */
export async function AccessoriesRail() {
  const locale = await getLocale();
  const t = await getTranslations('accessoriesSection');
  const tA11y = await getTranslations('a11y');
  const products = (await accessories()).slice(0, 6);

  /* Same reasoning as <OurLaptops />: an empty rail under a live heading reads
     as a rendering fault, so the section stands down instead. */
  if (products.length === 0) return null;

  return (
    <Section
      id="accessories"
      background="gray"
      device={<Halftone corner="bottom-start" size={190} opacity={0.35} />}
    >
      <Container>
        <SectionHeader id="accessories" title={t('title')} subhead={t('subhead')} />

        <Carousel label={`${t('title')} — ${tA11y('carouselProgress')}`} className="mt-14">
          {products.map((product) => (
            <div key={product.slug} className={RAIL_ITEM}>
              <ProductCard product={product} locale={locale} bed="white" sizes={RAIL_SIZES} />
            </div>
          ))}
        </Carousel>
      </Container>
    </Section>
  );
}
