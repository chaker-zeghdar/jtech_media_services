import { getLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { categoryHref } from '@/components/layout/navigation';
import { Carousel } from '@/components/ui/Carousel';
import { CategoryTile } from '@/components/ui/CategoryTile';
import { categories } from '@/content/categories';
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
 * Brand device: still none of the named devices. The gold is carried by the
 * alternating gradient card faces — see the note in <CategoryTile /> and the
 * per-page budget in DESIGN.md §3.
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
      href: categoryHref(category.slug),
    }));

  return (
    /* White, not gray — and that is a consequence of the card faces, not a
       whim. One of the two faces IS gray-50, which is exactly what this section
       used to be, so gray-on-gray left those cards with no edge at all: they
       read as loose text and a product floating on the page rather than as
       cards. The alternation rule still holds either way — hero (gold fade) →
       this → featured (ink). */
    <Section id="categories" background="white">
      <Container>
        <SectionHeader id="categories" title={t('title')} subhead={t('subhead')} />

        <Carousel label={`${t('title')} — ${tA11y('carouselProgress')}`} className="mt-14">
          {items.map((item, index) => (
            <div key={item.category.slug} className={CARD_ITEM}>
              {/* gradient, gray, gradient, gray, gradient. By parity rather than
                  a hand-picked list, so a sixth category keeps the rhythm. */}
              <CategoryTile
                category={item.category}
                name={item.name}
                tagline={item.tagline}
                href={item.href}
                bed={index % 2 === 0 ? 'gradient' : 'gray'}
                sizes={CARD_SIZES}
              />
            </div>
          ))}
        </Carousel>
      </Container>
    </Section>
  );
}
