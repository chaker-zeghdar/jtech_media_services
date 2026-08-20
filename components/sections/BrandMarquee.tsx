import { getTranslations } from 'next-intl/server';
import { GoldOrb } from '@/components/brand/GoldOrb';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Button } from '@/components/ui/Button';
import { SlideBanner } from '@/components/ui/SlideBanner';
import { settings } from '@/content/settings';

/**
 * The client's own marketing posts, on a conveyor.
 *
 * Brand device: <GoldOrb /> — the page's only one. This section had the widest
 * gap against the client's current Instagram material (see the content note
 * below: these slides are from an older, flatter graphic era), so the one soft
 * glow the system allows is spent here, where it does the most work.
 *
 * TODO — CONTENT MISMATCH, needs a decision from the client:
 * Three of these four slides advertise branding, web development, photography and
 * paid Facebook/Google advertising. None of that exists anywhere else on this
 * site, which is currently a phone shop. Either the site gains a "خدمات الوكالة"
 * (agency services) section, or these slides promise a service line the page
 * cannot deliver and should be swapped for retail posts. The phone numbers in
 * `settings.departments` already reflect the agency side, so the business really
 * does offer it — the website just doesn't say so yet.
 *
 * The four panels run flush as ONE banner rather than as four bordered cards.
 * They are a single wide design cut into squares for Instagram's carousel — the
 * gold wave continues from panel 1 into panel 2 — so the gap-and-border treatment
 * this section originally shipped was cutting a line drawn to be continuous. The
 * layout and motion now live in <SlideBanner />, shared with the hero strip.
 *
 * A hover lift is deliberately NOT applied per panel: lifting one panel of a
 * flush-edge graphic tears the seam open, which is worse than no hover at all.
 */
export async function BrandMarquee() {
  const t = await getTranslations('social');
  const handle = settings.socials.instagram.handle;

  return (
    <Section
      id="social"
      background="gray"
      /* The page's ONE <GoldOrb />, and it replaces this section's <Halftone />
         rather than joining it — `device` takes a single node, which is the
         one-device-per-section rule doing its job. `top-end` keeps it in the
         corner gutter above the banner and clear of <SectionHeader />'s text;
         it must never sit under the <SlideBanner /> panels either, since a glow
         behind photographs is exactly what DESIGN.md §7 still rules out. */
      device={<GoldOrb corner="top-end" size={380} opacity={0.5} />}
    >
      <Container>
        <SectionHeader
          id="social"
          title={t('title')}
          subhead={t('subhead', { handle })}
          action={
            <Button variant="link" href={settings.socials.instagram.url} external>
              {t('cta')}
            </Button>
          }
        />
      </Container>

      {/* Full-bleed so the banner travels the whole band. Two passes of four
          panels per half (8 × 280px = 2240px) so a half always covers the widest
          viewport — one pass would leave a bare patch at 1440px and above. */}
      <SlideBanner
        className="mt-14"
        panelClassName="w-[200px] md:w-[280px]"
        sizes="(max-width: 767px) 200px, 280px"
        reps={2}
        label={t('marqueeLabel')}
        href={settings.socials.instagram.url}
        external
      />
    </Section>
  );
}
