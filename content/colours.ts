/**
 * The colour presets the admin picks from, and the lookup that repairs old rows.
 *
 * ── Why presets rather than a hex input ────────────────────────────────────
 *
 * `colour_hex` is real, persisted, and rendered: `<ColourSwatches />`, the
 * product page, the featured spotlight and — most importantly — the checkout's
 * colour picker all paint it, and in checkout the dot is the control a customer
 * clicks to choose a variant. So it cannot simply be dropped.
 *
 * What it could not survive was being a SECOND free input beside the name. The
 * two were independent, the form defaulted to `#000000`, and "never touched it"
 * was indistinguishable from "chose black" — which is exactly how a variant
 * ended up labelled `white` and painted `#000000` on a live product.
 *
 * Picking a preset sets the name and the hex together, in one click, from one
 * source. They cannot drift because the admin never states them separately.
 *
 * Hexes are muted and product-like rather than pure CSS colours: a real "white"
 * phone is `#F5F5F0`, not `#FFFFFF`, and a pure-white dot vanishes into a white
 * card (which is why `<ColourSwatches />` carries a hairline border).
 */

export type ColourPreset = {
  /** Stable key. Also the `colour_slug` written for the variant. */
  slug: string;
  /** What the admin sees and what the storefront shows. Arabic — the shop's own language. */
  label: string;
  hex: string;
  /** Spellings matched when repairing existing rows. Lowercased, trimmed. */
  aliases: readonly string[];
};

export const COLOUR_PRESETS: readonly ColourPreset[] = [
  { slug: 'black', label: 'أسود', hex: '#1C1C1E', aliases: ['أسود', 'اسود', 'noir', 'black'] },
  { slug: 'white', label: 'أبيض', hex: '#F5F5F0', aliases: ['أبيض', 'ابيض', 'blanc', 'white'] },
  { slug: 'gold', label: 'ذهبي', hex: '#D4AF8C', aliases: ['ذهبي', 'or', 'doré', 'dore', 'gold'] },
  { slug: 'silver', label: 'فضي', hex: '#E3E4E5', aliases: ['فضي', 'argent', 'silver'] },
  { slug: 'blue', label: 'أزرق', hex: '#3F5773', aliases: ['أزرق', 'ازرق', 'bleu', 'blue'] },
  { slug: 'green', label: 'أخضر', hex: '#4A5D4E', aliases: ['أخضر', 'اخضر', 'vert', 'green'] },
  { slug: 'titanium', label: 'تيتانيوم', hex: '#8A8A86', aliases: ['تيتانيوم', 'titane', 'titanium'] },
  { slug: 'purple', label: 'بنفسجي', hex: '#D9C4D9', aliases: ['بنفسجي', 'violet', 'purple'] },
  { slug: 'red', label: 'أحمر', hex: '#A91E2C', aliases: ['أحمر', 'احمر', 'rouge', 'red'] },
  { slug: 'pink', label: 'وردي', hex: '#F4C6CE', aliases: ['وردي', 'rose', 'pink'] },
] as const;

/** Shown for a custom colour name we don't recognise. Deliberately neutral. */
export const FALLBACK_COLOUR_HEX = '#B8B8B8';

/**
 * A colour name → its preset, matched case-insensitively and trimmed across
 * Arabic, French and English spellings. Null when nothing matches, which is the
 * signal that a row needs a human to look at it rather than a guessed colour.
 */
export function findColourPreset(name: string): ColourPreset | null {
  const needle = name.trim().toLowerCase();
  if (!needle) return null;
  return (
    COLOUR_PRESETS.find(
      (preset) =>
        preset.slug === needle || preset.aliases.some((alias) => alias.toLowerCase() === needle),
    ) ?? null
  );
}

/** The hex to paint for a colour name — the preset's, or the neutral fallback. */
export function colourHexFor(name: string): string {
  return findColourPreset(name)?.hex ?? FALLBACK_COLOUR_HEX;
}
