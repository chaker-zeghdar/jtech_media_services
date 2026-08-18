import { getLocale, getTranslations } from 'next-intl/server';
import { GoldRibbon } from '@/components/brand/GoldRibbon';
import { Container } from '@/components/layout/Container';
import { Enter } from '@/components/motion/Enter';
import { StaggerText } from '@/components/motion/StaggerText';
import { Button } from '@/components/ui/Button';
import { ProductImage } from '@/components/ui/ProductImage';
import { SlideBanner } from '@/components/ui/SlideBanner';
import { featuredProduct, primaryVariant } from '@/content/products';
import { whatsappLink } from '@/content/settings';
import { pickLocale } from '@/lib/format';

/**
 * The hero — a stage, not a split.
 *
 * Centred type with the product large and BENEATH it, owning the viewport, the
 * way apple.com/iphone opens. The previous two-column layout put the headline
 * beside a bed and capped the section at roughly 60vh, which read as a banner
 * rather than an opening.
 *
 * Brand device: GoldRibbon #1 of 2, sweeping behind the product. Composed inline
 * rather than passed to <Section device> because it is positioned relative to the
 * product, not to a section corner — it is still this section's one device.
 *
 * Everything animates through <Enter /> / <StaggerText />, both CSS-only server
 * components, so the hero ships no client JavaScript for its own motion and the
 * headline (the LCP element) paints without waiting on hydration.
 */
export async function Hero() {
  const locale = await getLocale();
  const t = await getTranslations('hero');
  const tProduct = await getTranslations('product');
  // Reuses the alt text <BrandMarquee /> already has for these same four photos.
  const tSocial = await getTranslations('social');

  const product = featuredProduct();
  const variant = primaryVariant(product);
  const name = pickLocale(product.name, locale);

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative flex min-h-hero flex-col justify-center overflow-hidden bg-white py-16 md:py-20"
    >
      <Container className="flex flex-col items-center text-center">
        {/* ---- Copy ------------------------------------------------------- */}
        <Enter>
          <p className="text-eyebrow uppercase text-gray-700">{t('eyebrow')}</p>
        </Enter>

        <StaggerText
          as="h1"
          id="hero-title"
          text={t('title')}
          delayMs={120}
          className="mt-5 max-w-[18ch] text-balance text-hero font-semibold"
        />

        <Enter delayMs={260}>
          <p className="mt-7 max-w-[52ch] text-subhead text-gray-700">{t('subhead')}</p>
        </Enter>

        <Enter
          delayMs={360}
          className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
        >
          <Button href="#range">{t('ctaPrimary')}</Button>
          <Button variant="link" href={whatsappLink(tProduct('generalMessage'))} external>
            {t('ctaSecondary')}
          </Button>
        </Enter>

        {/* ---- Product stage ----------------------------------------------
            16:10 rather than a taller crop on purpose: at 5:4 the composition ran
            past 88vh and left a blank band below the fold. It also caps the
            product's rendered height, which is what keeps the cutout inside its
            own resolution — see the note on `src`. */}
        <Enter delayMs={160} className="relative mt-10 w-full max-w-hero">
          <div className="relative aspect-[16/10]">
            {/* No bed and no glow: the product sits on the page's own white, and
                the ribbon is the only thing behind it. Negative insets let the
                ribbon bleed past the product and re-emerge on both sides. */}
            <GoldRibbon id="hero" className="-inset-x-10 -inset-y-6 z-10" strokeWidth={16} />

            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <ProductImage
                /**
                 * A client-supplied cutout (520×677), not a hero-resolution
                 * photograph — swap it when the client sends real product
                 * photography.
                 *
                 * It holds up here because the stage is 16:10 and the image is
                 * `object-contain`, so HEIGHT is the binding constraint: 388px
                 * tall → ~298px wide, well inside the 520px source. The 620px
                 * stage width is never the rendered width. `sizes` reflects the
                 * ~298px it actually paints at, so next/image doesn't fetch a
                 * larger variant than the source can supply.
                 */
                src={variant.images[0]}
                name={name}
                width={520}
                height={677}
                priority
                sizes="(max-width: 767px) 45vw, 300px"
                className="drop-shadow-product"
              />
            </div>
          </div>
        </Enter>

        <Enter delayMs={440}>
          <p className="mt-8 max-w-[52ch] text-caption text-gray-700">{t('trust')}</p>
        </Enter>

        {/* ---- Proof strip -------------------------------------------------
            The four panels are one graphic, so they run flush — see
            <SlideBanner />. Still not an auto-rotating hero: the panels move as a
            single banner, the message above them never changes, and the strip
            links down to the full rail rather than competing with it.
            Capped at the product stage's width so one pass of four panels
            (4 × 96px = 384px) already covers the viewport it scrolls through. */}
        <Enter delayMs={480} className="mt-8 w-full max-w-[384px]">
          <SlideBanner
            panelClassName="w-24"
            sizes="96px"
            label={tSocial('marqueeLabel')}
            href="#social"
          />
        </Enter>
      </Container>
    </section>
  );
}
