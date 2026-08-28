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
import { categoryHref } from '@/components/layout/navigation';
import { whatsappLink } from '@/content/settings';
import { priceFrom, primaryVariant, productColours } from '@/lib/product';
import { bestsellers, deviceRange, featuredProduct } from '@/lib/queries/products';
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

  /**
   * The whole section is the spotlight plus a rail of the same catalogue, so
   * with no products there is nothing here to render — not an empty shell with
   * a heading over a blank rail. Skipped entirely rather than crashing the page
   * (see `featuredProduct()`), and unaffected once any product exists.
   */
  const product = await featuredProduct();
  if (!product) return null;

  const variant = primaryVariant(product);
  const colours = productColours(product);
  const name = product.name;
  // Two, not the product's full highlight set — see the note at the <dl />.
  const highlights = product.highlights.slice(0, 2);

  /**
   * One rail where there used to be two sections. `bestsellers()` leads because
   * it is the higher-intent, hand-curated list; `deviceRange()` tops it up to
   * RAIL_LIMIT. De-duplicated by slug, because a product can legitimately be in
   * both and the old two-section layout hid that by keeping them apart.
   */
  const railProducts = [...(await bestsellers()), ...(await deviceRange())]
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
          deepest point of the cut (4vw) — that `+4vw` term is the diagonal-cut
          mechanic itself and is untouched; only the base rem values it's added
          to were pulled down a notch (py-14/16 → py-10/12) to shrink the block. */}
      <div className="diagonal-end on-ink mt-14 rounded-tile rounded-b-none bg-ink py-10 pb-[calc(2.5rem+4vw)] text-white md:mt-16 md:py-12 md:pb-[calc(3rem+4vw)]">
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
                {/* The product's real name, interpolated — this headline named
                    "iPhone 16 Pro" in hardcoded copy long after that product left
                    the catalogue. The gold pill now falls on the name itself,
                    which is the thing a spotlight is actually emphasising. */}
                {t.rich('title', { product: name, em: goldPill })}
              </h3>
              <Swash />
              <p className="mt-5 max-w-[46ch] text-subhead text-gray-300">{t('subhead')}</p>
            </Reveal>

            {/* Two spec numerals, not four — 48MP · A18. This was a full
                spec-sheet moment (48MP / A18 / 12 / 3) inside a panel meant to
                say "here's the one product," and the same numbers are one tap
                away on the product's own quick-view / category page. The two
                kept are the two a phone is actually marketed on — the camera
                and the chip; front-camera resolution and lens count are detail,
                not headline. `grid-cols-2` with no `sm:` step: two items
                already fill two columns at every width, so the old
                `sm:grid-cols-4` had nothing left to do. */}
            {highlights.length > 0 ? (
              <Reveal delayMs={120}>
                <dl className="mt-8 grid grid-cols-2 gap-x-8 border-t border-white/15 pt-8">
                  {highlights.map((highlight) => (
                    <div key={highlight.label}>
                      <dt className="sr-only">{highlight.label}</dt>
                      <dd>
                        <SpecStat
                          value={highlight.value}
                          unit={highlight.unit}
                          label={highlight.label}
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
              <Reveal delayMs={180} className="mt-8">
                {/* gray-500 on ink, not gray-700 — see the note in Price.tsx. */}
                <h3 className="text-caption uppercase text-gray-500">{t('coloursLabel')}</h3>
                <ul className="mt-4 flex flex-wrap items-center gap-3">
                  {colours.map((colour) => (
                    <li key={colour.slug}>
                      <span
                        className="block h-8 w-8 rounded-full border border-white/25"
                        style={{ backgroundColor: colour.hex }}
                      >
                        <span className="sr-only">{colour.label}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            {/* Price + actions */}
            <Reveal delayMs={240} className="mt-8 flex flex-col gap-7">
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
                  {t('cta', { product: name })}
                </Button>
                {/* The product's OWN category, not a fixed "#phones" anchor.
                    The old link read "see every iPhone" and jumped to the phones
                    rail, which is wrong the moment a laptop or an accessory is
                    the featured product. */}
                <Button variant="link" surface="ink" href={categoryHref(product.category)}>
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

      {/* Inside <Container>, like <Categories /> and <AccessoriesRail />.
          Rendered outside it, the rail spanned the full viewport and its first
          card sat FLUSH against the screen edge — 0px gutter — while the
          headline, price and button beside it all sat within the normal page
          margin. That mismatch is the bug: a white card bed running into the
          browser edge reads as broken, not as full-bleed. Cards still peek past
          the container's inline end, so the row still reads as scrollable. */}
      <Container className="mt-6">
        <Carousel label={`${t('railLabel')} — ${tA11y('carouselProgress')}`}>
          {railProducts.map((product) => (
            <div key={product.slug} className={RAIL_ITEM}>
              <ProductCard product={product} locale={locale} bed="white" sizes={RAIL_SIZES} />
            </div>
          ))}
        </Carousel>
      </Container>
    </Section>
  );
}
