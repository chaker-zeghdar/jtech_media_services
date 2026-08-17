import { getTranslations } from 'next-intl/server';
import { NumberedSquare } from '@/components/brand/NumberedSquare';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

/** Order matters — the written warranty is the strongest claim, so it leads. */
const REASONS = ['warranty', 'genuine', 'delivery', 'aftersales'] as const;

/**
 * Section 7 — علاش تشري من JTECH. Brand device: NumberedSquare ×4, one per card.
 *
 * Four instances of the same device is still one device, which is why this
 * section doesn't also get a blob or a halftone.
 */
export async function WhyJtech() {
  const t = await getTranslations('why');

  return (
    <Section id="why" background="white">
      <Container>
        <SectionHeader id="why" title={t('title')} subhead={t('subhead')} />

        <ul className="mt-14 grid gap-5 md:grid-cols-2">
          {REASONS.map((reason, index) => (
            <Reveal key={reason} as="li" delayMs={index * 80} className="h-full">
              <Card
                surface={reason === 'warranty' ? 'gray' : 'white'}
                bordered={reason !== 'warranty'}
                className={cn(
                  'flex h-full flex-col gap-5 p-7 sm:p-9',
                  // The warranty card is the section's anchor claim: gray bed and
                  // a gold hairline instead of the standard gray one.
                  reason === 'warranty' && 'border border-gold',
                )}
              >
                <NumberedSquare value={index + 1} />
                <div className="flex flex-col gap-3">
                  <h3 className="text-h3 font-semibold">{t(`items.${reason}.title`)}</h3>
                  <p className="max-w-[46ch] text-base text-gray-700">
                    {t(`items.${reason}.body`)}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
