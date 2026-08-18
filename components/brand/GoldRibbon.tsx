import { cn } from '@/lib/cn';

type GoldRibbonProps = {
  /**
   * Stable, unique per instance — used to key the SVG gradient definition.
   * Two ribbons on a page must not share an id, or the second `<defs>` is
   * invalid and resolves to the first.
   */
  id: string;
  /**
   * `back` sits under the product image, `front` crosses over it. Rendering both
   * around the same product produces the wrap from the client's Instagram — the
   * ribbon disappears behind the device and re-emerges the other side.
   */
  layer?: 'back' | 'front';
  /** Spec range is 14–18px. Stays constant regardless of container aspect. */
  strokeWidth?: number;
  /** Stagger the front layer slightly behind the back one. */
  delayMs?: number;
  /**
   * Positioning is the caller's job — pass `inset-0` to fill the frame, or
   * negative insets to let the ribbon bleed past the product bed so it visibly
   * re-emerges on both sides. Required, because there is no sensible default
   * that works for both the hero and the dark featured block.
   */
  className: string;
};

/**
 * The signature JTECH device. **Two per page maximum** — hero and the dark
 * featured block. See DESIGN.md.
 *
 * Draws itself over 1.2s via a clip wipe (see the `draw-ribbon` keyframes in
 * globals.css for why it is a wipe and not a stroke-dash). The animation is a
 * pure CSS keyframe with `both` fill, which matters twice over:
 *
 *  - it fails safe. An earlier version armed the draw from an
 *    IntersectionObserver, which left the ribbon completely invisible if
 *    hydration never happened. `both` fill lands on the fully-revealed state no
 *    matter what, and `prefers-reduced-motion` collapses the duration so it
 *    simply appears.
 *  - it needs no `'use client'`. Both ribbons are in the top third of the page,
 *    so scroll-gating bought nothing and cost client JS on the LCP path.
 *
 * `preserveAspectRatio="none"` + `vector-effect="non-scaling-stroke"` lets the
 * curve span any container aspect while the stroke stays exactly strokeWidth px.
 */
export function GoldRibbon({
  id,
  layer = 'back',
  strokeWidth = 16,
  delayMs = 0,
  className,
}: GoldRibbonProps) {
  const gradientId = `jtech-ribbon-${id}-${layer}`;

  const path =
    layer === 'back'
      ? 'M -30 292 C 66 322 112 236 194 196 C 276 156 352 128 500 74'
      : 'M 140 250 C 198 302 268 296 322 236';

  return (
    <svg
      viewBox="0 0 480 360"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(
        'pointer-events-none absolute overflow-visible animate-draw-ribbon',
        className,
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-gold-light)" />
          <stop offset="100%" stopColor="var(--color-gold-deep)" />
        </linearGradient>
      </defs>
      <path
        d={path}
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
