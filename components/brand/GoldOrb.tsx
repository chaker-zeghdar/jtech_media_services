import { cn } from '@/lib/cn';

type GoldOrbProps = {
  /**
   * Which corner it sits against. Logical, not physical — `start`/`end` flip
   * with the writing direction, same as <CornerBlob /> and <Halftone />.
   */
  corner?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  /** Diameter in px. Spec range is 260–420. */
  size?: number;
  /** Spec range is .4–.6. */
  opacity?: number;
  /**
   * `circle` is the bokeh from Posts 1–2. `ring` is the glowing halo Post 3
   * draws around its battery graphic — same glow, hollow centre.
   *
   * Both live here rather than in two components because they are one motif at
   * two settings, and a second call site shouldn't need a second import.
   */
  variant?: 'circle' | 'ring';
  className?: string;
};

const CORNER_CLASS: Record<NonNullable<GoldOrbProps['corner']>, string> = {
  'top-start': 'top-0 start-0 -translate-x-1/3 -translate-y-1/3 rtl:translate-x-1/3',
  'top-end': 'top-0 end-0 translate-x-1/3 -translate-y-1/3 rtl:-translate-x-1/3',
  'bottom-start': 'bottom-0 start-0 -translate-x-1/3 translate-y-1/3 rtl:translate-x-1/3',
  'bottom-end': 'bottom-0 end-0 translate-x-1/3 translate-y-1/3 rtl:-translate-x-1/3',
};

/**
 * Soft, blurred gold glow — the bokeh circles and glowing ring the client's
 * current Instagram posts are built on.
 *
 * ── This is a scoped exception, not a drift ────────────────────────────────
 *
 * DESIGN.md §7 says "no glow or halo behind products", and <CornerBlob />'s own
 * comment says the client's shapes are solid fills with no blur. Both were true
 * when they were written and are both now out of date against the client's
 * current material: the posts this was matched to are glossy and soft-edged.
 * The rule is scoped in DESIGN.md rather than quietly contradicted, and the
 * exception is capped at **one GoldOrb per page** so it stays an accent.
 *
 * The flat devices are NOT deprecated by this. <CornerBlob /> and <Halftone />
 * remain the default; this is the one soft shape, in one section.
 *
 * ── Never behind text ──────────────────────────────────────────────────────
 *
 * Same rule <Halftone /> follows, and for a stronger reason: a blurred gradient
 * makes the backdrop under any given line unpredictable, so nothing here can be
 * contrast-checked. Sections put it in a corner gutter, outside the content
 * column. Decorative and `aria-hidden` — it carries no meaning.
 */
export function GoldOrb({
  corner = 'top-end',
  size = 340,
  opacity = 0.5,
  variant = 'circle',
  className,
}: GoldOrbProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute select-none rounded-full',
        CORNER_CLASS[corner],
        className,
      )}
      style={{
        width: size,
        height: size,
        opacity,
        /**
         * The ring's stops are the circle's, pushed outward: transparent core,
         * gold shoulder, fading edge. The blur below is what turns those hard
         * stops into a glow rather than a banded target.
         */
        background:
          variant === 'ring'
            ? 'radial-gradient(circle, transparent 34%, var(--color-gold) 52%, var(--color-gold-light) 66%, transparent 78%)'
            : 'radial-gradient(circle, var(--color-gold) 0%, var(--color-gold-light) 45%, transparent 72%)',
        // Spec is 40–60px. The blur is the whole point of the shape, not a
        // finishing touch — without it this is just a CornerBlob with a gradient.
        filter: `blur(${variant === 'ring' ? 44 : 52}px)`,
      }}
    />
  );
}
