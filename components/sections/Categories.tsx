import { getLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { categoryHref } from '@/components/layout/navigation';
import { Carousel } from '@/components/ui/Carousel';
import { CategoryTile } from '@/components/ui/CategoryTile';
import { categories } from '@/content/categories';
import { productsByCategory } from '@/content/products';
import { pickLocale } from '@/lib/format';

/**
 * Section 2 — شنو راك تقلّب عليه؟, built to the apple.com/store "The latest"
 * rail: tall rounded cards, each one an eyebrow, a name, a line of detail and
 * the product itself filling the bottom half.
 *
 * A rail rather than the five-across grid it used to be. The card shape the
 * reference uses is type-on-top, product-below, and that only reads at a tall
 * aspect — five of those across a desktop row would be columns, not cards. The
 * rail also lets the next card peek in at the inline end, which is what makes
 * the row read as browsable rather than as a finished list of five.
 *
 * <Carousel /> is the project's existing rail (gold progress bar, arrows below).
 * The reference floats its arrows over the cards instead; that is the one part
 * deliberately not copied, because this page already has a carousel idiom in
 * three other sections and a second one would be a competing control.
 *
 * Brand device: still none of the named devices. The gold moved from the old
 * icon chips to the count eyebrow on every card — see the note in
 * <CategoryTile /> and the per-page budget in DESIGN.md §3.
 */

/** Matches CARD_ITEM below, so next/image never fetches more than it paints. */
const CARD_SIZES =
  '(max-width: 639px) 74vw, (max-width: 767px) 44vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 300px';
const CARD_ITEM = 'w-[74vw] sm:w-[44vw] md:w-[33vw] lg:w-[25vw] xl:w-[300px]';

export async function Categories() {
  const locale = await getLocale();
  const t = await getTranslations('categories');
  const tA11y = await getTranslations('a11y');

  const items = [...categories]
    .sort((a, b) => a.position - b.position)
    .map((category) => ({
      category,
      name: pickLocale(category.name, locale),
      tagline: pickLocale(category.tagline, locale),
      count: t('count', { count: productsByCategory(category.slug).length }),
      href: categoryHref(category.slug),
    }));

  return (
    <Section id="categories" background="gray">
      <Container>
        <SectionHeader id="categories" title={t('title')} subhead={t('subhead')} />

        <Carousel label={`${t('title')} — ${tA11y('carouselProgress')}`} className="mt-14">
          {items.map((item) => (
            <div key={item.category.slug} className={CARD_ITEM}>
              <CategoryTile
                category={item.category}
                name={item.name}
                tagline={item.tagline}
                count={item.count}
                href={item.href}
                sizes={CARD_SIZES}
              />
            </div>
          ))}
        </Carousel>
      </Container>
    </Section>
  );
}
