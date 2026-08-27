import { getLocale, getTranslations } from 'next-intl/server';
import { CornerBlob } from '@/components/brand/CornerBlob';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { categoryHref } from '@/components/layout/navigation';
import { Button } from '@/components/ui/Button';
import { Carousel } from '@/components/ui/Carousel';
import { ProductCard } from '@/components/ui/ProductCard';
import { productsByCategory } from '@/lib/queries/products';
import { RAIL_ITEM, RAIL_LIMIT, RAIL_SIZES } from '@/lib/rail';

/**
 * حواسيبنا — one category, one rail, no tab. The simplest of the new sections.
 *
 * Brand device: <CornerBlob /> at .08, not a second <GoldOrb />. The orb budget
 * is one per page and <OurPhones /> two sections up has it; a second glow this
 * close would read as clutter, which is the opposite of what this restructure
 * is for. A flat device also keeps the alternation honest against the gray
 * sections either side of this white one.
 *
 * Its subhead deliberately echoes the `pc` tagline in content/categories.ts —
 * the same promise worded the same way, not a duplication to tidy up.
 */
export async function OurLaptops() {
  const locale = await getLocale();
  const t = await getTranslations('laptops');
  const tCommon = await getTranslations('common');
  const tA11y = await getTranslations('a11y');

  const products = (await productsByCategory('pc')).slice(0, RAIL_LIMIT);

  /* A heading and a subhead over an empty rail is worse than no section: it
     reads as a broken component rather than as an empty category. Only reached
     when this category has nothing published. */
  if (products.length === 0) return null;

  return (
    <Section
      id="laptops"
      background="white"
      device={<CornerBlob corner="bottom-end" size={38} opacity={0.08} />}
    >
      <Container>
        <SectionHeader id="laptops" title={t('title')} subhead={t('subhead')} />
      </Container>

      <Carousel label={`${t('title')} — ${tA11y('carouselProgress')}`} className="mt-14">
        {products.map((product) => (
          <div key={product.slug} className={RAIL_ITEM}>
            <ProductCard product={product} locale={locale} bed="gray" sizes={RAIL_SIZES} />
          </div>
        ))}
      </Carousel>

      <Container className="mt-8">
        <Button variant="link" href={categoryHref('pc')}>
          {tCommon('viewAll')}
        </Button>
      </Container>
    </Section>
  );
}
