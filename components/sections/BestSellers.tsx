import { getTranslations } from 'next-intl/server';
import { CornerBlob } from '@/components/brand/CornerBlob';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { bestsellers, primaryVariant } from '@/content/products';

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
  /**
   * Photo-complete only, then capped at 8.
   *
   * A fixed `.slice(0, 8)` took whatever mix of real cutouts and
   * <ProductImage />'s empty state the first eight bestsellers happened to have,
   * and interleaved them: 4 photos and 4 JTECH-mark placeholders in one grid.
   * Side by side in a row that reads as broken rather than as "photos coming
   * soon" — the empty state is right for a lone card in a rail, wrong next to a
   * real photograph.
   *
   * The grid is deliberately NOT padded back up to eight. A short, complete row
   * is an honest picture of the catalogue today; a full row half-filled with
   * placeholders is not. This resolves itself with no code change as cutouts
   * land in public/products/ — see that folder's README.
   *
   * Filtered here rather than inside `bestsellers()`: that list is curated
   * merchandising and means "these are our bestsellers" regardless of whether a
   * photo exists yet. This is the one consumer, and it is a presentation
   * constraint, so it belongs at the call site.
   */
  const products = bestsellers()
    .filter((product) => primaryVariant(product).images[0])
    .slice(0, 8);

  return (
    <Section
      id="bestsellers"
      background="white"
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
