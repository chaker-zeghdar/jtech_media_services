import { getTranslations } from 'next-intl/server';
import { CornerBlob } from '@/components/brand/CornerBlob';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { bestsellers } from '@/content/products';

/**
 * Section 5 — الأكثر مبيعاً, with quick view on every card.
 *
 * Brand device: CornerBlob at .08. Full-saturation blobs are budgeted at two per
 * page and both are spent on the gold panel and the hero ribbon, so this one is
 * a tint — it reads as a warm corner rather than as a shape.
 */
export async function BestSellers() {
  const t = await getTranslations('bestsellers');
  const tCommon = await getTranslations('common');
  const products = bestsellers();

  return (
    <Section
      id="bestsellers"
      background="gray"
      device={<CornerBlob corner="bottom-start" size={38} opacity={0.08} />}
    >
      <Container>
        <SectionHeader
          id="bestsellers"
          title={t('title')}
          subhead={t('subhead')}
          action={
            <Button variant="link" href="#range">
              {tCommon('viewAll')}
            </Button>
          }
        />

        <ul className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal key={product.slug} as="li" delayMs={(index % 4) * 70}>
              <ProductCard
                product={product}
                sizes="(max-width: 767px) 44vw, (max-width: 1023px) 30vw, 300px"
              />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
