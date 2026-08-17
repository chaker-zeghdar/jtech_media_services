import { getTranslations } from 'next-intl/server';
import { Halftone } from '@/components/brand/Halftone';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Carousel } from '@/components/ui/Carousel';
import { ProductCard } from '@/components/ui/ProductCard';
import { deviceRange } from '@/content/products';

/** Rail item width. Shared with <AccessoriesRail /> so both rails snap alike. */
export const RAIL_ITEM = 'w-[72vw] sm:w-[42vw] md:w-[31vw] lg:w-[23vw] xl:w-[290px]';
/** Homepage rails show this many products; the full list lives in content/. */
export const RAIL_LIMIT = 10;
export const RAIL_SIZES =
  '(max-width: 639px) 72vw, (max-width: 767px) 42vw, (max-width: 1023px) 31vw, (max-width: 1279px) 23vw, 290px';

/**
 * Section 4 — التشكيلة الكاملة. Brand device: Halftone in the top-end corner,
 * outside the content column and never behind text.
 */
export async function FullRange() {
  const t = await getTranslations('range');
  const tA11y = await getTranslations('a11y');
  // Display cap. The homepage rail is a taste of the range, not the catalogue —
  // and every extra card is ~40 DOM nodes of layout work on a throttled phone.
  const products = deviceRange().slice(0, RAIL_LIMIT);

  return (
    <Section
      id="range"
      background="white"
      device={<Halftone corner="top-end" size={210} opacity={0.35} />}
    >
      <Container>
        <SectionHeader id="range" title={t('title')} subhead={t('subhead')} />

        <Carousel label={`${t('title')} — ${tA11y('carouselProgress')}`} className="mt-14">
          {products.map((product) => (
            <div key={product.slug} className={RAIL_ITEM}>
              <ProductCard product={product} sizes={RAIL_SIZES} />
            </div>
          ))}
        </Carousel>
      </Container>
    </Section>
  );
}
