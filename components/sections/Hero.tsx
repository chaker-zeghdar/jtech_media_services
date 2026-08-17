import { getLocale, getTranslations } from 'next-intl/server';
import { GoldRibbon } from '@/components/brand/GoldRibbon';
import { Container } from '@/components/layout/Container';
import { Enter } from '@/components/motion/Enter';
import { StaggerText } from '@/components/motion/StaggerText';
import { Button } from '@/components/ui/Button';
import { ProductImage } from '@/components/ui/ProductImage';
import { featuredProduct, primaryVariant } from '@/content/products';
import { whatsappLink } from '@/content/settings';
import { pickLocale } from '@/lib/format';

/**
 * Section 1 of the homepage proper.
 *
 * Brand device: GoldRibbon #1 of 2, sweeping behind the product and re-emerging
 * on both sides. It's composed inline rather than passed to <Section device>
 * because it has to be positioned relative to the product, not to a section
 * corner — it is still this section's one and only device.
 *
 * Everything here animates through <Enter /> / <StaggerText />, both of which are
 * CSS-only server components. The hero therefore ships no client JavaScript for
 * its own animation, so the headline (the LCP element) paints without waiting on
 * hydration.
 */
export async function Hero() {
  const locale = await getLocale();
  const t = await getTranslations('hero');
  const tProduct = await getTranslations('product');

  const product = featuredProduct();
  const variant = primaryVariant(product);
  const name = pickLocale(product.name, locale);

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative overflow-hidden bg-white">
      <Container className="grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:py-28">
        {/* ---- Copy ------------------------------------------------------ */}
        <div className="max-w-[36ch]">
          <Enter>
            <p className="text-eyebrow uppercase text-gray-700">{t('eyebrow')}</p>
          </Enter>

          <StaggerText
            as="h1"
            id="hero-title"
            text={t('title')}
            delayMs={120}
            className="mt-5 text-hero font-semibold"
          />

          <Enter delayMs={260}>
            <p className="mt-7 max-w-[46ch] text-subhead text-gray-700">{t('subhead')}</p>
          </Enter>

          <Enter delayMs={360} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button href="#range">{t('ctaPrimary')}</Button>
            <Button
              variant="link"
              href={whatsappLink(tProduct('generalMessage'))}
              external
            >
              {t('ctaSecondary')}
            </Button>
          </Enter>

          <Enter delayMs={440}>
            <p className="mt-10 max-w-[42ch] text-caption text-gray-700">{t('trust')}</p>
          </Enter>
        </div>

        {/* ---- Product + ribbon ------------------------------------------ */}
        <Enter delayMs={160} className="relative mx-auto w-full max-w-[560px]">
          {/* Three layers, and the order is the whole effect: the bed is opaque
              at the bottom, the ribbon sits ON the bed (and bleeds past its
              rounded edge via the negative insets), and the product sits on top
              of the ribbon — so the ribbon disappears behind the device and
              re-emerges the other side. Putting the ribbon under the bed instead
              hides it almost entirely. */}
          <div className="relative aspect-square">
            <div className="absolute inset-0 rounded-tile bg-gray-50" />

            <GoldRibbon id="hero" className="-inset-x-10 -inset-y-8 z-10" strokeWidth={16} />

            <div className="absolute inset-0 z-20 flex items-center justify-center p-10 sm:p-14">
              <ProductImage
                src={variant.images[0]}
                name={name}
                width={620}
                height={620}
                // The only priority image on the page — this is the LCP element.
                priority
                sizes="(max-width: 1023px) 84vw, 520px"
                className="drop-shadow-product"
              />
            </div>
          </div>
        </Enter>
      </Container>
    </section>
  );
}
