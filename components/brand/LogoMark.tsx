import { cn } from '@/lib/cn';

type LogoMarkProps = {
  /** Rendered size in px (square). */
  size?: number;
  className?: string;
};

/**
 * The JTECH mark: an ink rounded-square badge with a gold J.
 *
 * Purely decorative wherever it appears next to the wordmark, so it carries
 * aria-hidden and the accessible name lives on the wrapping link instead. Also
 * reused at 28px / opacity .12 as the watermark in <ProductImage />'s empty state.
 */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
    >
      <rect width="32" height="32" rx="9.6" fill="currentColor" />
      <path
        d="M20.4 8.2v11.3c0 2.9-2 4.6-5 4.6-2.6 0-4.4-1.2-5.1-3.3l3-1.1c.3 1 .9 1.5 1.9 1.5 1.1 0 1.8-.7 1.8-2V11h-4.2V8.2h7.6Z"
        fill="var(--color-gold)"
      />
    </svg>
  );
}

type LogoProps = {
  /** `ink` for light surfaces, `white` for the ink footer and dark blocks. */
  tone?: 'ink' | 'white';
  className?: string;
};

/** Mark + wordmark. The accessible name is supplied by the parent link. */
export function Logo({ tone = 'ink', className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark size={26} className={tone === 'white' ? 'text-white' : 'text-ink'} />
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
