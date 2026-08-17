import type { LocalizedText } from '@/content/schemas';
import type { Locale } from '@/i18n/routing';

/**
 * Groups an integer with dots and Latin digits: 289000 → "289.000".
 *
 * Written by hand rather than via Intl.NumberFormat on purpose. `ar-DZ` would
 * otherwise render Arabic-Indic digits and a different separator, and the brief
 * requires prices to look identical in all three locales.
 */
export function formatInteger(value: number): string {
  const sign = value < 0 ? '-' : '';
  const digits = Math.abs(Math.trunc(value)).toString();
  let grouped = '';
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) grouped += '.';
    grouped += digits[i];
  }
  return `${sign}${grouped}`;
}

/** Reads the field for the active locale out of a localized content value. */
export function pickLocale(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

/**
 * The first clause of a description, for the one-line tagline on a product card.
 *
 * Splits on sentence enders only — never on a comma, because Arabic uses `،`
 * mid-phrase and cutting there ("التيتانيوم") strands a fragment rather than a
 * clause. Falls back to a word-boundary truncation when the first sentence is
 * still too long for a card.
 */
export function firstClause(text: string, maxChars = 72): string {
  const end = text.search(/[.!?؟]/u);
  const clause = (end > 8 ? text.slice(0, end) : text).trim();
  if (clause.length <= maxChars) return clause;

  const slice = clause.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(' ');
  return `${(lastSpace > 20 ? slice.slice(0, lastSpace) : slice).trim()}…`;
}

/**
 * Percentage saved against a compare-at price, rounded down so the claim is
 * never overstated. Returns null when there's no discount to show.
 */
export function discountPercent(price: number, compareAt: number | null): number | null {
  if (compareAt === null || compareAt <= price) return null;
  const percent = Math.floor(((compareAt - price) / compareAt) * 100);
  return percent > 0 ? percent : null;
}
