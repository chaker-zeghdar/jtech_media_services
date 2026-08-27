import { getTranslations } from 'next-intl/server';
import type { ProductColour } from '@/content/schemas';
import { cn } from '@/lib/cn';

/** Apple shows five or six then a plain +N. Five keeps the row short on a card. */
const MAX_VISIBLE = 5;

type ColourSwatchesProps = {
  /** Distinct colours across a product's variants — use `productColours()`. */
  colours: ProductColour[];
  className?: string;
};

/**
 * A row of colour dots under a product card's image: "this comes in six colours"
 * answered before the customer clicks anything.
 *
 * **A summary, not a picker.** There is no client-side variant switching on the
 * card grid, so this has no click handler and no state — adding one would be a
 * second mechanism alongside the colour list already inside <QuickView />.
 *
 * Accessibility: the dots themselves are `aria-hidden` (colour is never the only
 * signal — DESIGN.md says so for StockDot and it applies here). The real content
 * is the list: an `aria-label` carrying the count, and one `<li>` per colour with
 * a visually-hidden label in the active locale. Colours past MAX_VISIBLE still
 * get their `<li>` and their name — only the dot is dropped — so the spoken list
 * matches the count in the label instead of stopping short at five.
 *
 * Every `background-color` comes from `variant.colour.hex` in content/products.ts.
 * No colour literal is defined here.
 */
export async function ColourSwatches({ colours, className }: ColourSwatchesProps) {
  // One colour is not a choice, and an empty row is worse than no row.
  if (colours.length < 2) return null;

  const t = await getTranslations('product');
  const overflow = Math.max(0, colours.length - MAX_VISIBLE);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ul
        aria-label={t('colourCount', { count: colours.length })}
        className="flex items-center gap-1.5"
      >
        {colours.map((colour, index) => (
          <li key={colour.slug} className="flex items-center">
            {index < MAX_VISIBLE ? (
              <span
                aria-hidden="true"
                // The hairline is load-bearing: pale colours (white titanium is
                // #F2F1ED) would otherwise vanish into a white card.
                className="block h-3.5 w-3.5 rounded-full border border-gray-300"
                style={{ backgroundColor: colour.hex }}
              />
            ) : null}
            <span className="sr-only">{colour.label}</span>
          </li>
        ))}
      </ul>

      {overflow > 0 ? (
        // Decorative: the count is already in the list's accessible name, and
        // every overflowed colour is still named inside the list above.
        // gray-700 not gray-500 — #86868B is 3.6:1 on white and fails AA at 12px
        // (DESIGN.md § "The gray rule").
        <span aria-hidden="true" className="text-caption text-gray-700">
          <bdi className="num">{t('moreColours', { count: overflow })}</bdi>
        </span>
      ) : null}
    </div>
  );
}
