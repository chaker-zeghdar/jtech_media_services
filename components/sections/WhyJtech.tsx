import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { NumberedSquare } from '@/components/brand/NumberedSquare';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';

/** Order matters — the written warranty is the strongest claim, so it leads. */
const REASONS = ['warranty', 'genuine', 'delivery', 'aftersales'] as const;

/**
 * علاش تشري من JTECH — an asymmetric two-column list, not a rail.
 *
 * ── Why it stopped being four identical cards ──────────────────────────────
 *
 * It was a <Carousel /> of four equal-width cards, which is the same shape as
 * the three product rails on this page. Four reasons are not a catalogue: they
 * are an argument, they have an order, and the strongest one leads. A rail said
 * none of that — it said "here are four interchangeable things, scroll".
 *
 * The layout borrowed here is the reference's: a short intro column on one
 * side, the reasons stacked down the other, threaded by a thin connector line
 * with a marker at each step. The line is what turns four cards into one
 * sequence you read top to bottom.
 *
 * ── The connector absorbed the numeral ─────────────────────────────────────
 *
 * <NumberedSquare /> is still the section's device and still appears four
 * times, but it now sits ON the connector line as each step's marker rather
 * than floating inside a card. That was the choice worth making: keeping both a
 * square numeral inside the card AND a dot on the line would have been two
 * markers for one step, which is exactly the kind of decoration this pass is
 * removing. One device, doing the job the line needs anyway.
 *
 * Brand device: NumberedSquare ×4 — unchanged budget, new position.
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
        {/* 2fr/3fr rather than a even split: the intro is a paragraph, the list
            is four of them, so an even grid would leave the left column half
            empty at lg. Under lg it stacks and the connector still runs. */}
        <div className="grid gap-14 lg:grid-cols-[2fr_3fr] lg:gap-20">
          <div className="lg:sticky lg:top-[calc(var(--header-height)+var(--nav-height)+3rem)] lg:self-start">
            <SectionHeader id="why" title={t('title')} subhead={t('subhead')} />
            <Reveal delayMs={120}>
              <p className="mt-10 text-caption text-gray-700">{t('socialProof')}</p>
            </Reveal>
          </div>

          {/* The connector. `before:` draws one continuous hairline down the
              whole list, and each item's own marker sits on top of it — one
              line, not four stacked borders. `start-*` keeps it on the reading
              edge in both scripts. */}
          <ol className="relative flex flex-col gap-10 before:absolute before:inset-y-2 before:start-[1.375rem] before:w-px before:bg-gray-300">
            {REASONS.map((reason, index) => (
              <Reveal key={reason} as="li" delayMs={index * 90} className="relative flex gap-6">
                {/* The marker. `bg-white` is load-bearing: it masks the hairline
                    behind the numeral so the line reads as passing between the
                    steps rather than through them. */}
                <span className="relative z-10 shrink-0 bg-white py-1">
                  <NumberedSquare value={index + 1} />
                </span>

                <div className="flex flex-col gap-3 pt-1">
                  <h3 className="text-h3 font-semibold leading-tight">
                    {t.rich(`items.${reason}.title`, { em: goldPhrase })}
                  </h3>
                  <p className="text-base text-gray-700">{t(`items.${reason}.body`)}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
