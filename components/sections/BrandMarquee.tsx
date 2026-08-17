import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Halftone } from '@/components/brand/Halftone';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Button } from '@/components/ui/Button';
import { settings } from '@/content/settings';

/**
 * The client's own marketing posts, on a conveyor.
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
 * Deliberately CONTAINED, not full-bleed. The posts use a pale blue/cyan palette
 * with orange accents and glossy 3D shapes — a different visual language from the
 * site's gold/ink/white. Framed inside consistent rounded cards on a neutral
 * band, they read as "our social feed" and the clash is intentional quoting. Bled
 * edge to edge as page chrome, they would fight every other section and the page
 * would look like two different sites stitched together.
 *
 * Motion is pure CSS (see `.marquee-*` in globals.css): one keyframe translating
 * the track by -50%, with the set rendered twice so the loop is seamless. No JS
 * timer, no rAF, no library, and only `transform` animates so there is no layout
 * thrash. Pauses on hover and on focus-within; under `prefers-reduced-motion` the
 * animation stops entirely and the band becomes an ordinary scrollable rail.
 */
const SLIDES = [
  { key: 's1', src: '/slide/slide-1.jpg' },
  { key: 's2', src: '/slide/slide-2.jpg' },
  { key: 's3', src: '/slide/slide-3.jpg' },
  { key: 's4', src: '/slide/slide-4.jpg' },
] as const;

/** Source files are 1170×1170. Rendered ~200px mobile / ~280px desktop. */
const SLIDE_SOURCE = 1170;
const SLIDE_SIZES = '(max-width: 767px) 200px, 280px';

const SLIDE_BOX = 'w-[200px] md:w-[280px]';

export async function BrandMarquee() {
  const t = await getTranslations('social');
  const handle = settings.socials.instagram.handle;

  return (
    <Section
      id="social"
      background="gray"
      device={<Halftone corner="top-start" size={180} opacity={0.35} />}
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

      {/* Full-width viewport so slides travel the whole band, but each slide stays
          inside its own contained card — see the note above. */}
      <div className="marquee-viewport mt-14" role="group" aria-label={t('marqueeLabel')}>
        <div className="marquee-track gap-5 px-2.5">
          {/* The real set — announced once, focusable. */}
          <ul className="flex gap-5">
            {SLIDES.map((slide) => (
              <li key={slide.key} className={SLIDE_BOX}>
                <a
                  href={settings.socials.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-card border border-gray-300 bg-white transition-[transform,border-color] duration-300 ease-brand hover:-translate-y-0.5 hover:border-gold"
                >
                  <Image
                    src={slide.src}
                    alt={t(`slides.${slide.key}`)}
                    width={SLIDE_SOURCE}
                    height={SLIDE_SOURCE}
                    sizes={SLIDE_SIZES}
                    loading="lazy"
                    className="aspect-square h-auto w-full object-cover"
                  />
                </a>
              </li>
            ))}
          </ul>

          {/* The duplicate that makes the loop seamless. aria-hidden, and
              deliberately NOT links — focusable content inside aria-hidden is an
              accessibility violation, so the clone is inert markup only. */}
          <div aria-hidden="true" className="marquee-clone flex gap-5 ps-5">
            {SLIDES.map((slide) => (
              <div key={`clone-${slide.key}`} className={SLIDE_BOX}>
                <div className="overflow-hidden rounded-card border border-gray-300 bg-white">
                  <Image
                    src={slide.src}
                    alt=""
                    width={SLIDE_SOURCE}
                    height={SLIDE_SOURCE}
                    sizes={SLIDE_SIZES}
                    loading="lazy"
                    className="aspect-square h-auto w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
