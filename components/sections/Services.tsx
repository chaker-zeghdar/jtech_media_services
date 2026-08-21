import { getLocale, getTranslations } from 'next-intl/server';
import { CornerBlob } from '@/components/brand/CornerBlob';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { FeatureChip } from '@/components/ui/FeatureChip';
import { PriceFrom } from '@/components/ui/Price';
import { services } from '@/content/services';
import { whatsappLink } from '@/content/settings';
import { pickLocale } from '@/lib/format';

/**
 * Section 8 — in-store services. Brand device: CornerBlob at .08 (top-end, so it
 * doesn't sit in the same corner as the bestsellers blob).
 */
export async function Services() {
  const locale = await getLocale();
  const t = await getTranslations('services');
  const tCommon = await getTranslations('common');
  const tProduct = await getTranslations('product');

  const items = [...services].sort((a, b) => a.position - b.position);

  return (
    <Section
      id="services"
      background="white"
      device={<CornerBlob corner="top-end" size={34} opacity={0.08} />}
    >
      <Container>
        <SectionHeader id="services" title={t('title')} subhead={t('subhead')} />

        {/* A threaded list, not a four-across grid. Services have an order and
            a price each; four equal cards in a row said neither, and it was the
            most generic-looking block on the page — an icon in a box, repeated.
            Same connector pattern <WhyJtech /> uses, so the two list sections on
            this page read as one idea rather than two solutions.

            Two columns at lg rather than <WhyJtech />'s one, because each item
            here carries a price row and a CTA and would otherwise run very long.
            The connector runs down each column independently. */}
        <ul className="relative mt-14 grid gap-x-14 gap-y-10 lg:grid-cols-2">
          {items.map((service, index) => {
            const name = pickLocale(service.name, locale);

            return (
              <Reveal key={service.slug} as="li" delayMs={index * 70} className="h-full">
                <div className="relative flex h-full gap-6">
                  {/* Marker column: the chip sits ON a hairline that runs the
                      height of the item, so the list threads instead of
                      floating. `last:before:hidden` stops the line dangling
                      past the final item in each column. */}
                  <div className="relative flex shrink-0 flex-col items-center">
                    <FeatureChip icon={service.icon} />
                    <span aria-hidden="true" className="mt-4 w-px flex-1 bg-gray-300" />
                  </div>

                  <div className="flex flex-1 flex-col gap-5 pb-2">
                  <div className="flex flex-1 flex-col gap-3">
                    <h3 className="text-h3 font-semibold">{name}</h3>
                    <p className="text-base text-gray-700">
                      {pickLocale(service.description, locale)}
                    </p>
                  </div>

                  <dl className="hairline-t flex flex-col gap-2 pt-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="sr-only">{tCommon('priceFrom')}</dt>
                      <dd>
                        {service.priceFrom > 0 ? (
                          <PriceFrom value={service.priceFrom} />
                        ) : (
                          // Ink, not green. --color-green is scoped to the
                          // in-stock dot; as 17px text on white it measures
                          // 2.4:1. This is a price, so it reads like one.
                          <span className="text-base font-semibold text-ink">
                            {tCommon('free')}
                          </span>
                        )}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-caption text-gray-700">{t('durationLabel')}</dt>
                      <dd className="text-caption font-medium text-gray-700">
                        <bdi>{pickLocale(service.duration, locale)}</bdi>
                      </dd>
                    </div>
                  </dl>

                  <Button
                    variant="link"
                    size="sm"
                    href={whatsappLink(tProduct('serviceMessage', { service: name }))}
                    external
                    ariaLabel={`${t('cta')} — ${name}`}
                  >
                    {t('cta')}
                  </Button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
