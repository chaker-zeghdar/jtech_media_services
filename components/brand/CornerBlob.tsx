import { cn } from '@/lib/cn';

type CornerBlobProps = {
  corner?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  /**
   * Edge length as a viewport-width percentage. Spec range is 30–45vw.
   */
  size?: number;
  /**
   * Full saturation is allowed at most twice per page; everywhere else this
   * drops to .08 so the blob reads as a tint on the section, not as a shape.
   */
  opacity?: number;
  className?: string;
};

const CORNER_CLASS: Record<NonNullable<CornerBlobProps['corner']>, string> = {
  'top-start': 'top-0 start-0 -translate-x-1/3 -translate-y-1/3 rtl:translate-x-1/3',
  'top-end': 'top-0 end-0 translate-x-1/3 -translate-y-1/3 rtl:-translate-x-1/3',
  'bottom-start': 'bottom-0 start-0 -translate-x-1/3 translate-y-1/3 rtl:translate-x-1/3',
  'bottom-end': 'bottom-0 end-0 translate-x-1/3 translate-y-1/3 rtl:-translate-x-1/3',
};

/**
 * Flat gold organic shape bleeding off a section corner.
 *
 * Deliberately flat — no blur, no shadow, no gradient. The client's Instagram
 * shapes are solid fills and adding depth here is the fastest way to make the
 * page stop looking like theirs.
 */
export function CornerBlob({
  corner = 'bottom-end',
  size = 36,
  opacity = 0.08,
  className,
}: CornerBlobProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute select-none rounded-full bg-gold',
        CORNER_CLASS[corner],
        className,
      )}
      style={{
        width: `${size}vw`,
        height: `${size}vw`,
        // Slightly off-round so it reads as organic rather than as a circle.
        borderRadius: '50% 46% 54% 50% / 52% 50% 50% 48%',
        opacity,
      }}
    />
  );
}
