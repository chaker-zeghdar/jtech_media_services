import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

/**
 * The mosaic — the page's structural change of gear.
 *
 * Every other section is the same rhythm: heading, swash, subhead, grid of equal
 * cards. Apple's pages read well because they alternate scale and surface, and
 * this is where that happens: one wide tile then two half tiles, ink against
 * gray, each with a product cropped by the tile's own bottom edge.
 *
 * Brand device: NONE, deliberately. The colour blocking is the visual interest
 * here; a halftone or a blob on top would be a second device in one section and
 * would muddy the very contrast the section exists to create.
 *
 * The images are sized DOWN from their sources on purpose — see the note on
 * `image.width` below.
 */
type Tile = {
  key: 'warranty' | 'repair' | 'delivery';
  href: string;
  surface: 'ink' | 'gray';
  /** The wide tile leads the section; the other two share the row beneath it. */
  span: 'full' | 'half';
  image: { src: string; width: number; height: number };
};

/**
 * Render widths are all BELOW each source's intrinsic size, so nothing is
 * upscaled. The cutouts are small (the Samsung ones are 157–173px wide), and a
 * product peeking out of a tile's bottom edge is exactly the crop that lets them
 * be used at a size they can actually carry.
 */
const TILES: readonly Tile[] = [
  {
    key: 'warranty',
    href: '#why',
    surface: 'ink',
    span: 'full',
    image: { src: '/products/iphone-16-pro.png', width: 260, height: 339 },
  },
  {
    key: 'repair',
    href: '#services',
    surface: 'gray',
    span: 'half',
    image: { src: '/products/galaxy-z-fold-8-ultra.png', width: 150, height: 226 },
  },
  {
    key: 'delivery',
    href: '#delivery',
    surface: 'ink',
    span: 'half',
    image: { src: '/products/galaxy-watch-ultra-2.png', width: 140, height: 165 },
  },
];

export async function FeatureMosaic() {
  const t = await getTranslations('mosaic');

  return (
    <Section id="promise" background="white">
      <Container>
        <SectionHeader id="promise" title={t('title')} subhead={t('subhead')} />

        <ul className="mt-14 grid gap-5 md:grid-cols-2">
          {TILES.map((tile, index) => {
            const onInk = tile.surface === 'ink';

            return (
              <Reveal
                key={tile.key}
                as="li"
                delayMs={index * 90}
                className={cn('h-full', tile.span === 'full' && 'md:col-span-2')}
              >
                <article
                  className={cn(
                    // `overflow-hidden` is what crops the product at the tile's
                    // bottom edge — the whole point of the composition.
                    'group relative flex h-full min-h-[520px] flex-col overflow-hidden rounded-tile p-8 sm:p-11',
                    onInk ? 'on-ink bg-ink text-white' : 'bg-gray-50 text-ink',
                  )}
                >
                  <div className={cn('relative z-10 flex flex-col', tile.span === 'full' && 'md:max-w-[52%]')}>
                    <p
                      className={cn(
                        'text-eyebrow uppercase',
                        onInk ? 'text-gold' : 'text-gray-700',
                      )}
                    >
                      {t(`items.${tile.key}.eyebrow`)}
                    </p>

                    <h3 className="mt-4 text-balance text-h2 font-semibold">
                      {t(`items.${tile.key}.title`)}
                    </h3>

                    <p
                      className={cn(
                        'mt-4 max-w-[42ch] text-base',
                        onInk ? 'text-gray-300' : 'text-gray-700',
                      )}
                    >
                      {t(`items.${tile.key}.body`)}
                    </p>

                    <div className="mt-7">
                      {/* The tile's single anchor. The stretched pseudo-element
                          makes the whole card clickable without nesting a second
                          interactive element inside it. */}
                      <Button
                        variant="link"
                        surface={onInk ? 'ink' : 'light'}
                        href={tile.href}
                        className="after:absolute after:inset-0 after:content-['']"
                      >
                        {t(`items.${tile.key}.cta`)}
                      </Button>
                    </div>
                  </div>

                  {/* Anchored to the tile's bottom edge and pushed past it, so the
                      frame does the cropping. Logical `end-*` so it mirrors in AR. */}
                  <Image
                    src={tile.image.src}
                    alt={t(`items.${tile.key}.imageAlt`)}
                    width={tile.image.width}
                    height={tile.image.height}
                    sizes={`${tile.image.width}px`}
                    loading="lazy"
                    className={cn(
                      'pointer-events-none absolute -bottom-6 end-6 h-auto drop-shadow-product',
                      'transition-transform duration-500 ease-brand group-hover:-translate-y-2',
                      tile.span === 'full' ? 'w-[180px] sm:w-[260px]' : 'w-[120px] sm:w-[150px]',
                    )}
                  />
                </article>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
