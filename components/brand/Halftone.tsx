import { cn } from '@/lib/cn';

type HalftoneProps = {
  /**
   * Which corner it bleeds off. Logical, not physical — `start`/`end` flip with
   * the writing direction so the AR layout mirrors from the same markup.
   */
  corner?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  /** Square edge length. Spec range is 160–220px. */
  size?: number;
  /** Base is .35; the footer uses .2. */
  opacity?: number;
  className?: string;
};

const CORNER_CLASS: Record<NonNullable<HalftoneProps['corner']>, string> = {
  'top-start': '-top-8 -start-8',
  'top-end': '-top-8 -end-8',
  'bottom-start': '-bottom-8 -start-8',
  'bottom-end': '-bottom-8 -end-8',
};

/**
 * Gold halftone dot field, masked so it fades out toward the bottom-left and
 * bleeds off a section corner.
 *
 * Never place this behind text: the mask keeps contrast unpredictable. Sections
 * position it in a corner gutter, outside the 980px content column.
 */
export function Halftone({
  corner = 'top-end',
  size = 200,
  opacity = 0.35,
  className,
}: HalftoneProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'halftone-field pointer-events-none absolute select-none',
        CORNER_CLASS[corner],
        className,
      )}
      style={{ width: size, height: size, opacity }}
    />
  );
}
