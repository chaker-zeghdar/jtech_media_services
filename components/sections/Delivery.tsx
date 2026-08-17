import { getLocale, getTranslations } from 'next-intl/server';
import { GoldPanel } from '@/components/brand/GoldPanel';
import { Swash } from '@/components/brand/Swash';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { settings, whatsappLink } from '@/content/settings';
import { wilayas } from '@/content/wilayas';
import { formatInteger } from '@/lib/format';

/**
 * Section 9 — the delivery block, and the page's single full-bleed gold moment.
 *
 * Brand device: GoldPanel. This is the one section allowed to break the ~12%
 * gold-pixel budget, because it *is* the brand moment; every other section stays
 * well under it so this one lands.
 *
 * The wilaya accordion makes the "58 wilayas" claim checkable — grouped by fee
 * band rather than listed 58 times, so a customer can find their own tariff in
 * two taps. Data comes straight from content/wilayas.ts.
 */
export async function Delivery() {
  const locale = await getLocale();
  const t = await getTranslations('delivery');
  const tCommon = await getTranslations('common');
  const tProduct = await getTranslations('product');

  const currency = tCommon('currency');

  // Group wilayas by their (desk, home) fee pair, cheapest band first.
  const bands = new Map<string, { deskFee: number; homeFee: number; names: string[] }>();
  for (const wilaya of wilayas) {
    const key = `${wilaya.deskFee}-${wilaya.homeFee}`;
    const band = bands.get(key) ?? { deskFee: wilaya.deskFee, homeFee: wilaya.homeFee, names: [] };
    band.names.push(locale === 'ar' ? wilaya.nameAr : wilaya.nameFr);
    bands.set(key, band);
  }
  const feeBands = [...bands.values()].sort((a, b) => a.homeFee - b.homeFee);

  const stats = [
    { key: 'wilayas', value: formatInteger(settings.delivery.wilayaCount), unit: null },
    { key: 'desk', value: formatInteger(settings.delivery.deskFee), unit: currency },
    { key: 'home', value: formatInteger(settings.delivery.homeFee), unit: currency },
    { key: 'confirm', value: formatInteger(settings.delivery.confirmationHours), unit: null },
  ] as const;

  return (
    <Section id="delivery" background="white" flush>
      <GoldPanel className="py-section-sm md:py-section">
        <Container>
          <Reveal className="max-w-prose">
            <h2 id="delivery-title" className="text-section font-semibold text-ink">
              {t('title')}
            </h2>
            {/* On gold the swash needs to be ink, not gold-on-gold. */}
            <Swash tone="ink" />
            <p className="mt-6 max-w-[52ch] text-subhead text-ink/75">{t('subhead')}</p>
          </Reveal>

          {/* ---- Stats ---------------------------------------------------- */}
          <Reveal delayMs={120}>
            <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-ink/20 pt-10 lg:grid-cols-4">
              {stats.map((stat) => (
                // A <dl> group must be dt-then-dd in the DOM; `flex-col-reverse`
                // keeps the numeral visually above its label without lying about
                // the order in the markup.
                <div key={stat.key} className="flex flex-col-reverse gap-2">
                  <dt className="text-caption text-ink/70">{t(`stats.${stat.key}`)}</dt>
                  <dd className="flex items-baseline gap-1.5 text-numeral-sm font-semibold text-ink">
                    {/* `.num` goes on the numeral only. On the parent it would
                        also force the Arabic currency word into the Latin font
                        stack, which falls back to a mismatched face. */}
                    <bdi className="num">{stat.value}</bdi>
                    {stat.unit ? <bdi className="text-[0.4em] font-semibold">{stat.unit}</bdi> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* ---- Fee bands ----------------------------------------------- */}
          <Reveal delayMs={180} className="mt-16 max-w-prose">
            <Accordion tone="gold">
              {feeBands.map((band, index) => (
                <AccordionItem
                  key={`${band.deskFee}-${band.homeFee}`}
                  tone="gold"
                  defaultOpen={index === 0}
                  title={
                    <>
                      <bdi className="num">
                        {formatInteger(band.deskFee)} / {formatInteger(band.homeFee)}
                      </bdi>{' '}
                      {currency}
                    </>
                  }
                  meta={
                    <>
                      <bdi className="num">{formatInteger(band.names.length)}</bdi>{' '}
                      {t('stats.wilayas')}
                    </>
                  }
                >
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-1 text-sm sm:grid-cols-3">
                    {band.names.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </AccordionItem>
              ))}
            </Accordion>

            <p className="mt-8 max-w-[60ch] text-caption text-ink/70">{t('note')}</p>

            <div className="mt-8">
              <Button
                surface="gold"
                href={whatsappLink(tProduct('deliveryMessage'))}
                external
              >
                {t('cta')}
              </Button>
            </div>
          </Reveal>
        </Container>
      </GoldPanel>
    </Section>
  );
}
