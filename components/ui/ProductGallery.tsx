'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { ProductImage } from './ProductImage';

type ProductGalleryProps = {
  /** Ordered, straight from `variant.images`. May be empty. */
  images: readonly string[];
  /** Localized product name — alt text, and the empty state's label. */
  name: string;
};

/** Matches the detail view's panel width at every breakpoint. */
const SIZES = '(max-width: 767px) 88vw, 400px';

/**
 * The detail view's photo gallery — one image at a time, with dot indicators.
 *
 * ── Why not `<Carousel />` ─────────────────────────────────────────────────
 *
 * That component is a multi-item rail: several product *cards* visible at once,
 * prev/next arrows, and a continuous progress bar reading how far along the rail
 * you are. A photo gallery is a different interaction — one full-bleed image per
 * step, and a discrete "3 of 4" position rather than a percentage. Sharing the
 * component would have meant a mode flag threaded through arrows, progress bar
 * and item widths alike.
 *
 * What IS shared is the mechanism, which is the part worth not reinventing:
 * native `scroll-snap` via the `.snap-rail` utility, no transform track, no drag
 * library. Touch, trackpad, shift+wheel and keyboard all behave the way the
 * platform does.
 *
 * ── The dots read the scroll position, they don't drive it ─────────────────
 *
 * `active` is derived in the scroll handler from where the rail actually is, the
 * same way `<Carousel />` derives its progress bar. Clicking a dot scrolls the
 * rail; the rail scrolling is what updates the dot. A separate piece of state
 * set on click would drift the moment someone swiped instead.
 *
 * RTL: `scrollLeft` runs negative from the origin, so position is read from its
 * magnitude and `scrollTo` sign-flips off the computed direction — the handling
 * `<Carousel />` already worked out, reused rather than re-derived.
 */
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const t = useTranslations('product');
  const railRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const slide = rail.clientWidth;
    // Guard the offscreen case: sections carry `content-visibility: auto`, so
    // this can run while the rail has no laid-out width, and dividing by 0
    // would set `active` to NaN.
    if (slide < 1) return;

    setActive(Math.round(Math.abs(rail.scrollLeft) / slide));
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    sync();
    rail.addEventListener('scroll', sync, { passive: true });

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sync);
    observer?.observe(rail);

    return () => {
      rail.removeEventListener('scroll', sync);
      observer?.disconnect();
    };
  }, [sync]);

  const goTo = (index: number) => {
    const rail = railRef.current;
    if (!rail) return;

    const isRtl = getComputedStyle(rail).direction === 'rtl';
    rail.scrollTo({ left: index * rail.clientWidth * (isRtl ? -1 : 1), behavior: 'smooth' });
  };

  /* One photo or none: a static frame, no rail and no dots. Gallery chrome
     around a single image — or worse, around the branded empty state — is
     navigation for somewhere there is nowhere to go. Most products are in
     exactly this state until their photos are uploaded. */
  if (images.length <= 1) {
    return (
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-card bg-gray-50">
        <ProductImage
          src={images[0]}
          name={name}
          width={520}
          height={520}
          sizes={SIZES}
          className="drop-shadow-product"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div ref={railRef} className="snap-rail rounded-card bg-gray-50">
        {images.map((src, index) => (
          <div
            key={`${index}-${src}`}
            className="flex aspect-square w-full items-center justify-center p-6"
          >
            <ProductImage
              src={src}
              name={name}
              width={520}
              height={520}
              sizes={SIZES}
              className="drop-shadow-product"
            />
          </div>
        ))}
      </div>

      <ul className="flex items-center justify-center gap-1">
        {images.map((src, index) => (
          <li key={`${index}-${src}`}>
            {/* The button is a 24px target around a much smaller dot: the dot is
                the indicator, the padding is what makes it tappable. */}
            <button
              type="button"
              onClick={() => goTo(index)}
              aria-label={t('photoOf', { index: index + 1, total: images.length })}
              aria-current={index === active}
              className="flex h-6 w-6 items-center justify-center rounded-full"
            >
              <span
                className={cn(
                  'block rounded-full transition-all duration-200 ease-brand',
                  index === active ? 'h-2 w-2 bg-ink' : 'h-1.5 w-1.5 bg-gray-300',
                )}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
