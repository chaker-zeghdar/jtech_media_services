import type { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { GoldRibbon } from '@/components/brand/GoldRibbon';
import { Swash } from '@/components/brand/Swash';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Parallax } from '@/components/motion/Parallax';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { Carousel } from '@/components/ui/Carousel';
import { Price } from '@/components/ui/Price';
import { SpecStat } from '@/components/ui/SpecStat';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductImage } from '@/components/ui/ProductImage';
import { StockDot } from '@/components/ui/StockDot';
import {
  bestsellers,
  deviceRange,
  featuredProduct,
  priceFrom,
  primaryVariant,
  productColours,
} from '@/content/products';
import { whatsappLink } from '@/content/settings';
import { pickLocale } from '@/lib/format';
import { RAIL_ITEM, RAIL_LIMIT, RAIL_SIZES } from '@/lib/rail';

/**
 * التشكيلة المميزة — the merged flagship section.
 *
 * Three sections used to sit here back to back: <FeaturedProduct /> (the ink
 * spotlight), <FullRange /> and <BestSellers />, each with its own
 * <SectionHeader /> and its own rail of the same card. That repetition was the
 * concrete shape of "too much, not clear". They are now one section: the
 * spotlight, then a single rail.
 *
 * Brand device: GoldRibbon #2 of 2, relocated with the spotlight rather than
 * newly spent — the page budget is unchanged.
 */
export async function Featured() {
  /**
   * Kept identical to <WhyJtech />'s `goldPhrase` on purpose — two call sites of
   * one accent, not two treatments that drift. `box-decoration-clone` keeps it a
   * pill if the word ever lands on a line break.
   */
  const goldPill = (chunks: ReactNode) => (
    <span className="box-decoration-clone rounded-full bg-gold px-2.5 py-1 text-ink">
      {chunks}
    </span>
  );

  const locale = await getLocale();
  const t = await getTranslations('featured');
  const tProduct = await getTranslations('product');
  const tA11y = await getTranslations('a11y');

  const product = featuredProduct();
  const variant = primaryVariant(product);
  const colours = productColours(product);
  const name = pickLocale(product.name, locale);

  /**
   * One rail where there used to be two sections. `bestsellers()` leads because
   * it is the higher-intent, hand-curated list; `deviceRange()` tops it up to
   * RAIL_LIMIT. De-duplicated by slug, because a product can legitimately be in
   * both and the old two-section layout hid that by keeping them apart.
   */
  const railProducts = [...bestsellers(), ...deviceRange()]
    .filter((product, index, all) => all.findIndex((p) => p.slug === product.slug) === index)
    .slice(0, RAIL_LIMIT);

  return (
    <Section id="featured" background="gray">
      <Container>
        <SectionHeader
          id="featured"
          title={t('sectionTitle')}
          subhead={t('sectionSubhead')}
        />
      </Container>

      {/* ---- The spotlight -------------------------------------------------
          An ink block nested inside a white section rather than a section of
          its own — the same mix <FeatureMosaic /> used for its ink tiles, so
          this doesn't fight the surface-alternation rule, it uses the escape
          hatch the rule already had. Everything inside is the old
          <FeaturedProduct />, unchanged apart from its heading dropping to an
          h3 (the outer section owns the h2 now) and its secondary CTA, which
          pointed at the deleted #range. */}
      {/* `diagonal-end` cuts the bottom of the ink block on an angle so the
          rail's surface reads as slicing into it — the one boundary on this
          page where a surface genuinely becomes another, which is why it is the
          only place this is used. `rounded-b-none` because a radius and a
          diagonal cut fight each other at the same corner; the top keeps its
          radius, the bottom is the cut. Extra bottom padding clears the
          deepest point of the cut (4vw). */}
      <div className="diagonal-end on-ink mt-14 rounded-tile rounded-b-none bg-ink py-14 pb-[calc(3.5rem+4vw)] text-white md:mt-16 md:py-16 md:pb-[calc(4rem+4vw)]">
        <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* ---- Product + ribbon ------------------------------------------ */}
          <Reveal className="relative order-1 mx-auto w-full max-w-[520px] lg:order-none">
            {/* Same three-layer stack as the hero — bed, ribbon, product. */}
            <div className="relative aspect-square">
              <div className="absolute inset-0 rounded-tile bg-white/[0.05]" />

              <GoldRibbon
                id="featured"
                className="-inset-x-8 -inset-y-6 z-10"
                strokeWidth={15}
                delayMs={120}
              />

              <div className="absolute inset-0 z-20 flex items-center justify-center p-10 sm:p-14">
                {/* 4% drift, so the product moves against the ribbon behind it
                    rather than the whole composition sliding as one flat plane.
                    Below the fold, so it costs nothing on the LCP path. */}
                <Parallax strength={0.04} className="h-full w-full">
                  <ProductImage
                    src={variant.images[0]}
                    name={name}
                    width={560}
                    height={560}
                    sizes="(max-width: 1023px) 84vw, 480px"
                    className="drop-shadow-product"
                  />
                </Parallax>
              </div>
            </div>
          </Reveal>

          {/* ---- Copy ------------------------------------------------------ */}
          <div>
            <Reveal>
              <p className="text-eyebrow uppercase text-gold">{t('eyebrow')}</p>
              {/* Second and last call site for the gold pill. Same `t.rich` +
                  `<em>` pattern <WhyJtech /> uses, so the accented word travels
                  with the sentence per locale instead of being positional.

                  On this ink surface the pill needs no contrast exception the
                  light surfaces don't already need: the text on it is ink either
                  way, at 8.06:1 on gold. What changes is that the pill is now the
                  brightest thing in a dark section, which is why exactly one word
                  carries it. */}
              <h3 id="featured-spotlight-title" className="mt-4 text-section font-semibold">
                {t.rich('title', { em: goldPill })}
              </h3>
              <Swash />
              <p className="mt-6 max-w-[46ch] text-subhead text-gray-300">{t('subhead')}</p>
            </Reveal>

            {/* Big spec numerals — 48MP · A18 · 12 · 3 */}
            {product.highlights.length > 0 ? (
              <Reveal delayMs={120}>
                <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-white/15 pt-10 sm:grid-cols-4">
                  {product.highlights.map((highlight) => (
                    <div key={highlight.label.en}>
                      <dt className="sr-only">{pickLocale(highlight.label, locale)}</dt>
                      <dd>
                        <SpecStat
                          value={highlight.value}
                          unit={highlight.unit}
                          label={pickLocale(highlight.label, locale)}
                          size="md"
                          surface="ink"
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ) : null}

            {/* Colour swatches */}
            {colours.length > 1 ? (
              <Reveal delayMs={180} className="mt-12">
                {/* gray-500 on ink, not gray-700 — see the note in Price.tsx. */}
                <h3 className="text-caption uppercase text-gray-500">{t('coloursLabel')}</h3>
                <ul className="mt-4 flex flex-wrap items-center gap-3">
                  {colours.map((colour) => (
                    <li key={colour.slug}>
                      <span
                        className="block h-8 w-8 rounded-full border border-white/25"
                        style={{ backgroundColor: colour.hex }}
                      >
                        <span className="sr-only">{pickLocale(colour.label, locale)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            {/* Price + actions */}
            <Reveal delayMs={240} className="mt-12 flex flex-col gap-7">
              <div>
                <p className="text-caption uppercase text-gray-500">{t('priceLabel')}</p>
                <Price
                  value={priceFrom(product)}
                  compareAt={variant.compareAt}
                  size="lg"
                  surface="ink"
                  showSaving
                  className="mt-2 text-white"
                />
                <StockDot status={variant.stock} surface="ink" className="mt-3" />
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <Button
                  surface="ink"
                  href={whatsappLink(tProduct('orderMessage', { product: name }))}
                  external
                >
                  {t('cta')}
                </Button>
                <Button variant="link" surface="ink" href="#phones">
                  {t('ctaSecondary')}
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </div>

      {/* ---- The rail ------------------------------------------------------
          `id="range"` is deliberate and load-bearing: the hero's primary CTA
          links to #range, and Hero.tsx is out of scope for this pass. Rather
          than leave that button dead, the anchor moves onto the thing that
          actually replaced the old range section. `data-anchor` is globals.css's
          own opt-in for non-<section> anchor targets, so it still clears the
          sticky chrome by --nav-offset.

          A plain label, NOT a second <SectionHeader />: a full header here
          would rebuild the "three sections in a row" problem inside one
          section, which is the thing this merge exists to remove. */}
      <Container className="mt-16 md:mt-20">
        <p id="range" data-anchor className="text-eyebrow uppercase text-gold-text">
          {t('railLabel')}
        </p>
      </Container>

      <Carousel label={`${t('railLabel')} — ${tA11y('carouselProgress')}`} className="mt-6">
        {railProducts.map((product) => (
          <div key={product.slug} className={RAIL_ITEM}>
            <ProductCard product={product} locale={locale} bed="white" sizes={RAIL_SIZES} />
          </div>
        ))}
      </Carousel>
    </Section>
  );
}
