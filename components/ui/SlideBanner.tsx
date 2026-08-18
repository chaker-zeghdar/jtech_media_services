import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { SLIDES, SLIDE_SOURCE } from '@/content/slides';
import { cn } from '@/lib/cn';

type SlideBannerProps = {
  /** Width of ONE panel, e.g. 'w-24' or 'w-[200px] md:w-[280px]'. */
  panelClassName: string;
  /** next/image `sizes` for a single panel. */
  sizes: string;
  /**
   * How many times the four panels repeat inside one half of the track.
   *
   * A half must be at least as wide as the viewport it scrolls through, or the
   * loop shows a bare patch when that half is on screen. Full-bleed banners need
   * two passes to cover a 1920px screen; a width-capped strip needs one.
   */
  reps?: number;
  /** Accessible name for the region. */
  label: string;
  /** Where a panel click goes. */
  href: string;
  external?: boolean;
  className?: string;
};

/**
 * The client's four marketing panels, run as a continuous banner.
 *
 * These are NOT four separate posts. They are one wide design cut into four
 * square panels for Instagram's carousel format — the gold wave in the background
 * runs out of panel 1 and into panel 2. So they butt together edge to edge: no
 * gap, no per-panel radius, no per-panel border. Any of those would cut a line
 * that was drawn to be continuous, which is exactly what the earlier
 * bordered-and-gapped treatment did.
 *
 * Motion reuses `.marquee-*` from globals.css verbatim — one CSS keyframe, pause
 * on hover and focus-within, off under `prefers-reduced-motion`, no JS timer.
 *
 * Accessibility: only the FIRST four panels are links, so the set is announced
 * once. Every repetition after that — and the whole second half — is inert,
 * `aria-hidden`, and carries `.marquee-clone` so `prefers-reduced-motion` drops
 * it and leaves a plain scrollable rail of exactly four panels.
 */
export async function SlideBanner({
  panelClassName,
  sizes,
  reps = 1,
  label,
  href,
  external = false,
  className,
}: SlideBannerProps) {
  const t = await getTranslations('social');

  // Two halves so translating the track by -50% lands one exactly on the other.
  const groups = Array.from({ length: reps * 2 }, (_, index) => index);

  const panelImage = (src: string, alt: string) => (
    <Image
      src={src}
      alt={alt}
      width={SLIDE_SOURCE}
      height={SLIDE_SOURCE}
      sizes={sizes}
      loading="lazy"
      // No radius and no border: the panels are one graphic, not four cards.
      className="block aspect-square h-auto w-full object-cover"
    />
  );

  return (
    <div className={cn('marquee-viewport', className)} role="group" aria-label={label}>
      <div className="marquee-track">
        {groups.map((group) =>
          group === 0 ? (
            // The one announced copy.
            <ul key={group} className="flex">
              {SLIDES.map((slide) => (
                <li key={slide.key} className={cn('shrink-0', panelClassName)}>
                  <a
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="block"
                  >
                    {panelImage(slide.src, t(`slides.${slide.key}`))}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div key={group} aria-hidden="true" className="marquee-clone flex">
              {SLIDES.map((slide) => (
                <div key={slide.key} className={cn('shrink-0', panelClassName)}>
                  {panelImage(slide.src, '')}
                </div>
              ))}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
