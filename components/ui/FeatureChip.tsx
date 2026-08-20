import type { AnyIconKey } from './Icon';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

type FeatureChipProps = {
  /** Defaults to the checkmark, which is what most of the posts' chips carry. */
  icon?: AnyIconKey;
  /**
   * One short line beside the icon. Omit it and the chip is a plain icon disc —
   * the right call where the line would only repeat a heading directly beneath.
   */
  label?: string;
  className?: string;
};

/**
 * White, soft-shadowed chip — the glassy capsules the client's Instagram posts
 * use for stats and feature callouts (see the visual-language notes, §4c).
 *
 * ── Why it needs the shadow ────────────────────────────────────────────────
 *
 * White on white. Every call site so far sits on a white <Card />, so the only
 * thing separating the chip from what's behind it is `shadow-card` — the same
 * token the rest of the system already uses, and close enough to the posts' own
 * soft drop shadow that nothing new had to be invented. Drop the shadow and the
 * chip disappears; it is structural here, not decoration.
 *
 * ── Why the icon is gold-text ──────────────────────────────────────────────
 *
 * `--color-gold-text` (5.29:1 on white), never brand gold, which is 2.1:1 there.
 * It also keeps a note of gold in a card that no longer has a gold fill on it,
 * which matters because the section's actual brand device is a corner blob at
 * .08 — easy to miss that the chip was never carrying the brand here, unlike
 * the category cards where it was.
 *
 * `rounded-full` rather than a new radius: an icon-only chip reads as a disc and
 * matches the header's contact buttons and the hero's social chips, and a
 * labelled one reads as a pill. One radius, both shapes.
 */
export function FeatureChip({ icon = 'check', label, className }: FeatureChipProps) {
  if (!label) {
    return (
      <span
        className={cn(
          'inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-gold-text shadow-card',
          className,
        )}
      >
        <Icon name={icon} size={22} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-white py-1.5 pe-4 ps-1.5 shadow-card',
        className,
      )}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold-tint text-gold-text">
        <Icon name={icon} size={16} />
      </span>
      <span className="text-sm font-semibold text-ink">{label}</span>
    </span>
  );
}
