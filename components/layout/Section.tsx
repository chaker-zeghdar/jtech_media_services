import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type SectionProps = {
  /** Anchor target for the LocalNav. Also seeds the heading id. */
  id: string;
  background?: 'white' | 'gray' | 'ink';
  /**
   * The section's ONE brand device (§5). Singular by design: the prop takes a
   * single node so a section structurally cannot ship with two devices. If you
   * find yourself passing a fragment with two devices in it, that's the rule
   * being broken — split the section instead.
   */
  device?: ReactNode;
  /** Drop the vertical padding when the child supplies its own full-bleed bed. */
  flush?: boolean;
  /**
   * Skip rendering work while the section is offscreen (`content-visibility`).
   * On by default; turn it off only for a section whose height genuinely can't
   * be estimated, where a bad guess would move the scrollbar.
   */
  deferOffscreen?: boolean;
  children: ReactNode;
  className?: string;
};

const BACKGROUND: Record<NonNullable<SectionProps['background']>, string> = {
  white: 'bg-white text-ink',
  gray: 'bg-gray-50 text-ink',
  ink: 'on-ink bg-ink text-white',
};

/**
 * A homepage section: 120px desktop / 72px mobile padding, a background, and a
 * corner-anchored brand device clipped to its own bounds.
 *
 * `overflow-hidden` is what makes CornerBlob and Halftone bleed off the corner
 * instead of adding a horizontal scrollbar.
 */
export function Section({
  id,
  background = 'white',
  device,
  flush = false,
  deferOffscreen = true,
  children,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        'relative overflow-hidden',
        BACKGROUND[background],
        !flush && 'py-section-sm md:py-section',
        deferOffscreen && 'defer-offscreen',
        className,
      )}
    >
      {device}
      {/* Content sits above the device in every case — devices never overlay text. */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
