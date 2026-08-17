import { cn } from '@/lib/cn';

/**
 * The JTECH mark: a "JT" monogram built from four italic parallelogram strokes —
 * the J's hook and stem, then the T's stem and crossbar.
 *
 * Drawn as vector paths rather than shipped as a raster so it stays crisp from
 * the 16px favicon to the hero watermark, recolours from a single fill, and costs
 * no image request.
 *
 * Aspect ratio is 153:104 (≈1.47:1), so size is driven by `height` and the width
 * follows. Passing a square size would squash it.
 */
const ASPECT = 153 / 104;

type LogoMarkProps = {
  /** Rendered height in px; width is derived from the mark's aspect ratio. */
  height?: number;
  /**
   * `gold` paints the brand colour. `current` inherits `currentColor`, which is
   * what the <ProductImage /> watermark uses so it can sit at 12% ink.
   */
  tone?: 'gold' | 'current';
  className?: string;
};

export function LogoMark({ height = 24, tone = 'gold', className }: LogoMarkProps) {
  return (
    <svg
      width={Math.round(height * ASPECT)}
      height={height}
      viewBox="0 0 153 104"
      fill={tone === 'gold' ? 'var(--color-gold)' : 'currentColor'}
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
    >
      {/* J — hook */}
      <path d="M0 104 H26 L34.4 76 H8.4 Z" />
      {/* J — stem */}
      <path d="M34 104 H60 L91.2 0 H65.2 Z" />
      {/* T — stem */}
      <path d="M72 82 H98 L122.6 0 H96.6 Z" />
      {/* T — crossbar */}
      <path d="M118 28 H144 L152.4 0 H126.4 Z" />
    </svg>
  );
}

type LogoProps = {
  /** `ink` for light surfaces, `white` for the ink footer and dark blocks. */
  tone?: 'ink' | 'white';
  className?: string;
};

/**
 * Mark + wordmark. The accessible name is supplied by the parent link.
 *
 * The mark stays gold on both surfaces — it is a shape, not text, so the gold
 * contrast rule in DESIGN.md doesn't apply to it. The wordmark is what flips.
 */
export function Logo({ tone = 'ink', className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark height={20} />
      <span
        className={cn(
          'font-latin text-[1.0625rem] font-bold tracking-tight',
          tone === 'white' ? 'text-white' : 'text-ink',
        )}
        // The wordmark is Latin in every locale — it's the brand name.
        dir="ltr"
      >
        JTECH
      </span>
    </span>
  );
}
