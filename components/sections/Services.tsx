import { getLocale, getTranslations } from 'next-intl/server';
import { CornerBlob } from '@/components/brand/CornerBlob';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((service, index) => {
            const name = pickLocale(service.name, locale);

            return (
              <Reveal key={service.slug} as="li" delayMs={index * 70} className="h-full">
                <Card className="flex h-full flex-col gap-5 p-7">
                  {/* The icon slot only — card shell, <dl> and CTA untouched.
                      Icon-only rather than <FeatureChip label>: the service name
                      is the <h3> directly beneath, so a label here would say the
                      same thing twice. */}
                  <FeatureChip icon={service.icon} />

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
                </Card>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
