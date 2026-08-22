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
  /** Runs the conveyor the other physical way — see `.marquee-reverse` below. */
  reverse?: boolean;
  /**
   * Whether resting the mouse over the banner pauses it, independent of
   * `:focus-within` (keyboard pause is never optional — see the note below).
   * Defaults to `true`, matching the original, deliberate a11y call. Full-bleed
   * instances should pass `false` — see the note below for why.
   */
  pauseOnHover?: boolean;
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
 *
 * `dir="ltr"` on the viewport is load-bearing, not decorative. `.marquee-track`
 * is a bare `display: flex` row and `marquee-track`'s keyframe is a raw
 * `translate3d` pixel offset — neither knows about text direction. Flexbox's
 * main-start follows the box's own `direction`, so under the site's default
 * Arabic (`dir="rtl"` on `<html>`), the SAME keyframe that reads left-to-right
 * in French/English instead laid the panels out mirrored and the banner
 * visibly ran backwards. Pinning this one element to `ltr` keeps the physical
 * on-screen motion identical in all three locales — the same fix
 * `Carousel.tsx` makes explicitly (it reads `getComputedStyle().direction` and
 * sign-flips), just done here by forcing the direction instead of branching on
 * it, since a banner has no reason to mirror by locale at all.
 *
 * `reverse` is a per-instance choice, not a locale one — the hero strip and
 * `BrandMarquee` are free to travel opposite ways without either one's fix
 * leaking into the other, which is why this is a prop and not a second change
 * to the shared `marquee-track` keyframe.
 *
 * `pauseOnHover` exists because the hover pause quietly stopped being an edge
 * case once the hero banner went full-bleed. `BrandMarquee`'s rail has real
 * page around it, so ":hover" only fires when someone actually mouses over the
 * panels. A full-bleed banner has no edges to hover PAST — the viewport spans
 * the whole screen width, so the cursor is "hovering" it at almost any x
 * position the moment that band of the page is on screen, including while the
 * user is just scrolling past it with a mouse. That's what looked like the
 * banner randomly freezing: it wasn't broken, it was pausing exactly as
 * designed, just for a trigger that used to be rare and became constant.
 * `:focus-within` stays unconditional either way — a keyboard user's actual
 * need to stop the motion to reach a link doesn't go away because the banner
 * got wider.
 */
export async function SlideBanner({
  panelClassName,
  sizes,
  reps = 1,
  reverse = false,
  pauseOnHover = true,
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
    <div
      dir="ltr"
      className={cn('marquee-viewport', !pauseOnHover && 'marquee-no-hover-pause', className)}
      role="group"
      aria-label={label}
    >
      <div className={cn('marquee-track', reverse && 'marquee-reverse')}>
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
