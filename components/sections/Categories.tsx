import { getLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { categoryHref } from '@/components/layout/navigation';
import { Reveal } from '@/components/motion/Reveal';
import { CategoryTile } from '@/components/ui/CategoryTile';
import { categories } from '@/content/categories';
import { pickLocale } from '@/lib/format';

/**
 * Section 2. Brand device: none — the gold icon chips on the tiles carry the
 * brand here, and adding a blob or halftone on top would put two devices in one
 * viewport.
 */
export async function Categories() {
  const locale = await getLocale();
  const t = await getTranslations('categories');

  const items = [...categories].sort((a, b) => a.position - b.position);

  return (
    <Section id="categories" background="gray">
      <Container>
        <SectionHeader id="categories" title={t('title')} subhead={t('subhead')} />

        <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {items.map((category, index) => (
            <Reveal
              key={category.slug}
              as="li"
              delayMs={index * 70}
              className={
                // Five tiles across three columns leaves a gap on md; the last
                // tile spans it rather than leaving a hole in the grid.
                index === items.length - 1 ? 'col-span-2 md:col-span-1' : undefined
              }
            >
              <CategoryTile
                category={category}
                name={pickLocale(category.name, locale)}
                tagline={pickLocale(category.tagline, locale)}
                href={categoryHref(category.slug)}
              />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
