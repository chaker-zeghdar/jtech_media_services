import { getLocale, getTranslations } from 'next-intl/server';
import { GoldRibbon } from '@/components/brand/GoldRibbon';
import { Container } from '@/components/layout/Container';
import { Enter } from '@/components/motion/Enter';
import { StaggerText } from '@/components/motion/StaggerText';
import { Button } from '@/components/ui/Button';
import { ProductImage } from '@/components/ui/ProductImage';
import { featuredProduct } from '@/content/products';
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

  const product = featuredProduct();
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
            16:10 rather than a taller crop on purpose. The stage currently holds
            the branded empty state (see the note on `src` below), and at 5:4 it
            pushed the whole composition past 88vh and left a tall blank band
            below the fold. This keeps the ribbon and the plate inside the first
            screen; a real hero shot can afford a taller frame later. */}
        <Enter delayMs={160} className="relative mt-10 w-full max-w-hero">
          <div className="relative aspect-[16/10]">
            {/* No bed and no glow: the product sits on the page's own white, and
                the ribbon is the only thing behind it. Negative insets let the
                ribbon bleed past the product and re-emerge on both sides. */}
            <GoldRibbon id="hero" className="-inset-x-10 -inset-y-6 z-10" strokeWidth={16} />

            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <ProductImage
                /**
                 * Deliberately NOT `variant.images[0]`.
                 *
                 * The supplied iphone-16-pro.png is 520×677 — fine in a 290px card
                 * and in the featured block, visibly soft blown up to 620px here.
                 * Upscaling adds artefacts, not detail. The hero holds the branded
                 * empty state until the client sends a real hero shot; swap this
                 * to `primaryVariant(product).images[0]` when one arrives.
                 */
                src={undefined}
                name={name}
                width={620}
                height={388}
                priority
                sizes="(max-width: 767px) 88vw, 620px"
                className="drop-shadow-product"
              />
            </div>
          </div>
        </Enter>

        <Enter delayMs={440}>
          <p className="mt-8 max-w-[52ch] text-caption text-gray-700">{t('trust')}</p>
        </Enter>
      </Container>
    </section>
  );
}
