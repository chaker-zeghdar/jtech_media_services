import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { NumberedSquare } from '@/components/brand/NumberedSquare';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Card } from '@/components/ui/Card';
import { Carousel } from '@/components/ui/Carousel';

/** Order matters — the written warranty is the strongest claim, so it leads. */
const REASONS = ['warranty', 'genuine', 'delivery', 'aftersales'] as const;

/**
 * Section — علاش تشري من JTECH, as a rail of compact reason cards.
 *
 * Modelled on "The Apple Store difference" on apple.com/store: a plain horizontal
 * rail of borderless cards, each a small device, a short bold headline with ONE
 * phrase picked out in colour, and a single line of supporting copy. No product
 * photo, no button, no border.
 *
 * Brand device: NumberedSquare ×4, unchanged. Four instances of one device is
 * still one device — this pass changes the layout, not the device budget, and the
 * section keeps its place in the surface alternation.
 *
 * The cards are `gray` on this section's white bed. Apple's are white on a gray
 * bed; the relationship (plain borderless card, contrasting with the section) is
 * what carries over, not the literal colour. White cards here would disappear —
 * the same trap DESIGN.md records for the ProductCard image bed.
 *
 * The headline emphasis comes through `t.rich`, so the phrase to highlight is
 * marked up inside the message (`<em>…</em>`) and a translator moves it with the
 * sentence instead of it being positional.
 */
export async function WhyJtech() {
  const t = await getTranslations('why');

  /**
   * The emphasised phrase now sits ON a gold pill rather than being coloured
   * gold — the text-highlight treatment the client's own posts use behind one
   * headline word.
   *
   * The contrast rule inverts when you do that, and it is worth being explicit
   * about because the old comment here said the opposite: `text-gold-text` was
   * required precisely because brand gold measures 2.1:1 as TEXT on a light
   * surface. As a BACKGROUND it is fine, and ink on it measures 8.06:1 — so the
   * pill uses bare `bg-gold`, and the text on it goes to ink.
   *
   * `box-decoration-clone` is what keeps it a pill when the phrase wraps across
   * two lines: without it the second line loses its rounding and the padding,
   * and a two-word phrase in a ~280px card wraps often.
   */
  const goldPhrase = (chunks: ReactNode) => (
    <span className="box-decoration-clone rounded-full bg-gold px-2 py-0.5 font-semibold text-ink">
      {chunks}
    </span>
  );

  return (
    <Section id="why" background="white">
      <Container>
        <SectionHeader id="why" title={t('title')} subhead={t('subhead')} />

        <Carousel label={t('railLabel')} className="mt-14">
          {REASONS.map((reason, index) => (
            <div
              key={reason}
              /**
               * ~280px up to lg, where four cards genuinely overflow and the rail
               * scrolls. At xl they fill the row instead: four fixed 280px cards
               * in a 1616px shell leave ~440px of dead space at the end, which
               * reads as a layout hole rather than as a rail. The card language
               * (radius, padding, type scale) is what has to match the other
               * rails, not the exact pixel width.
               */
              className="w-[74vw] sm:w-[46vw] md:w-[34vw] lg:w-[26vw] xl:w-[calc((100%-3.75rem)/4)]"
            >
              <Reveal delayMs={index * 80} className="h-full">
                <Card
                  surface="gray"
                  bordered={false}
                  className="flex h-full flex-col gap-5 p-7"
                >
                  <NumberedSquare value={index + 1} />

                  <div className="flex flex-col gap-3">
                    <h3 className="text-h3 font-semibold leading-tight">
                      {t.rich(`items.${reason}.title`, { em: goldPhrase })}
                    </h3>
                    <p className="text-base text-gray-700">{t(`items.${reason}.body`)}</p>
                  </div>
                </Card>
              </Reveal>
            </div>
          ))}
        </Carousel>

        {/* Social proof as a plain sentence, deliberately NOT a fifth card: the
            device budget is four NumberedSquares, and a card without one would
            read as a mismatched afterthought. DESIGN.md also bans animated
            counters — these are facts, not a scoreboard. */}
        <Reveal delayMs={320}>
          <p className="mt-10 text-caption text-gray-700">{t('socialProof')}</p>
        </Reveal>
      </Container>
    </Section>
  );
}
