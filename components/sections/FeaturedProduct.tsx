import { getLocale, getTranslations } from 'next-intl/server';
import { GoldRibbon } from '@/components/brand/GoldRibbon';
import { Swash } from '@/components/brand/Swash';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Parallax } from '@/components/motion/Parallax';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { ProductImage } from '@/components/ui/ProductImage';
import { SpecStat } from '@/components/ui/SpecStat';
import { StockDot } from '@/components/ui/StockDot';
import { featuredProduct, priceFrom, primaryVariant, productColours } from '@/content/products';
import { whatsappLink } from '@/content/settings';
import { pickLocale } from '@/lib/format';

/**
 * Section 3 — the dark block. Brand device: GoldRibbon #2 of 2 (the page budget
 * is now spent; no further ribbons anywhere).
 *
 * This is the one place #F2A52F is used as a TEXT colour: on #1D1D1F it measures
 * ~8:1, where on white it would be ~2:1 and fail outright.
 */
export async function FeaturedProduct() {
  const locale = await getLocale();
  const t = await getTranslations('featured');
  const tProduct = await getTranslations('product');

  const product = featuredProduct();
  const variant = primaryVariant(product);
  const colours = productColours(product);
  const name = pickLocale(product.name, locale);

  return (
    <Section id="featured" background="ink">
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
            <h2 id="featured-title" className="mt-4 text-section font-semibold">
              {t('title')}
            </h2>
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
              <Button variant="link" surface="ink" href="#range">
                {t('ctaSecondary')}
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
