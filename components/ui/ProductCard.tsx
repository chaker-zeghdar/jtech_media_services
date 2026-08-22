import { getTranslations } from 'next-intl/server';
import type { Product } from '@/content/schemas';
import { whatsappLink } from '@/content/contact';
import { cn } from '@/lib/cn';
import { firstClause, pickLocale } from '@/lib/format';
import type { Locale } from '@/i18n/routing';
import { primaryBadge, priceFrom, primaryVariant, productColours } from '@/lib/product';
import { Badge } from './Badge';
import { Button } from './Button';
import { ColourSwatches } from './ColourSwatches';
import { PriceFrom } from './Price';
import { ProductImage } from './ProductImage';
import { QuickViewTrigger } from './QuickViewTrigger';

type ProductCardProps = {
  product: Product;
  locale: string;
  /** Passed through to next/image. Required — see ProductImage. */
  sizes?: string;
  /**
   * The image bed's resting colour, which must CONTRAST with the section behind
   * it. `gray` is the default (DESIGN.md: bed is #F5F5F7) and is correct on a
   * white section; on a gray-50 section the bed would vanish into the background
   * and the cards would read as images floating with no container, so those
   * sections pass `white`. The hover tint is gold-tint either way.
   */
  bed?: 'gray' | 'white';
  className?: string;
};

/**
 * Apple lineup treatment, not an e-commerce tile.
 *
 * Order is deliberate: bed → badge → name → one-line tagline → "من X دج" → two
 * text links. There is no solid button on the card face — Apple's lineup cards
 * use two links, and the filled button is reserved for the featured block and the
 * sticky mobile bar, which is what keeps it meaning something.
 *
 * Exactly ONE badge, and it sits above the name rather than floating over the
 * image: stacked badges over a product read as a rendering fault.
 *
 * A **server component**. The hover choreography is CSS on the card's `group`:
 *   bed         gray-50 → gold-tint
 *   light sweep one diagonal white pass over 600ms (globals.css)
 *   product     lifts 6px and rotates −1deg
 *   spec pills  fade in along the bottom of the bed
 *
 * Only <QuickViewTrigger /> is a client island, and it is one text link.
 *
 * PHASE 2: "اعرف أكثر" opens the quick view because product detail pages don't
 * exist yet; point it at /products/{slug} when they do. "اطلبها" deep-links to
 * WhatsApp with the product name prefilled because there is no cart yet.
 */
export async function ProductCard({
  product,
  locale,
  sizes = '(max-width: 639px) 78vw, (max-width: 1023px) 44vw, (max-width: 1439px) 30vw, 300px',
  bed = 'gray',
  className,
}: ProductCardProps) {
  const typedLocale = locale as Locale;
  const t = await getTranslations({ locale: typedLocale, namespace: 'product' });

  const name = pickLocale(product.name, typedLocale);
  const tagline = firstClause(pickLocale(product.description, typedLocale));
  const variant = primaryVariant(product);
  const badge = primaryBadge(product);
  const colours = productColours(product);
  const specPills = product.specs.slice(0, 2);

  return (
    <article className={cn('group relative flex h-full w-full flex-col', className)}>
      {/* ---- Image bed --------------------------------------------------- */}
      <div
        className={cn(
          'light-sweep relative isolate aspect-[4/5] overflow-hidden rounded-card shadow-card',
          bed === 'white' ? 'bg-white' : 'bg-gray-50',
          'transition-colors duration-500 ease-brand',
          'group-hover:bg-gold-tint group-focus-within:bg-gold-tint',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 z-10 flex items-center justify-center p-8',
            'transition-transform duration-500 ease-brand',
            'group-hover:-translate-y-1.5 group-hover:-rotate-1',
            'group-focus-within:-translate-y-1.5 group-focus-within:-rotate-1',
          )}
        >
          <ProductImage
            src={variant.images[0]}
            name={name}
            width={420}
            height={420}
            sizes={sizes}
            className="drop-shadow-product"
          />
        </div>

        {specPills.length > 0 ? (
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-x-3.5 bottom-3.5 z-20 flex flex-wrap justify-center gap-1.5',
              'opacity-0 transition-opacity duration-500 ease-brand',
              'group-hover:opacity-100 group-focus-within:opacity-100',
            )}
          >
            {specPills.map((spec) => (
              <bdi
                key={spec.key}
                className="num rounded-full bg-white/90 px-2.5 py-1 text-caption text-gray-700"
              >
                {spec.value}
              </bdi>
            ))}
          </div>
        ) : null}
      </div>

      {/* ---- Info --------------------------------------------------------
          Order follows apple.com/store's accessory cards: swatches sit directly
          under the image, then the eyebrow tag, then the name. */}
      <div className="mt-5 flex flex-1 flex-col items-start">
        {/* Every variable-height zone in this column reserves its space, so a
            card with no swatches and a one-line name lands its name, tagline and
            price at the same y as the card beside it with six colours and a
            two-line name. Reserved rather than conditional, because a rail is
            read across, not down: one card's missing row shifts everything below
            it out of step with its neighbours.

            <ColourSwatches /> returns null under two colours ("one colour is not
            a choice"), so without a floor here that row simply vanishes. The
            height is the dot row plus its own mb-3. */}
        <div className="mb-3 h-4">
          <ColourSwatches colours={colours} />
        </div>

        {/* Same reasoning: only some products carry a badge. */}
        <div className="mb-3 h-6">{badge ? <Badge badge={badge} /> : null}</div>

        {/* Clamped and floored like the tagline below. Two lines, not one:
            "لينوفو آيديا باد سليم 3" and "Galaxy Watch Ultra 2" are real
            products and both wrap at this width, so line-clamp-1 would truncate
            live catalogue entries rather than tidy an edge case.

            The floor is TWO lines (4.375rem = 2 x the measured 35px line box),
            not one. Flooring at one line only reserves space for the shorter
            case, which left one- and two-line names 26px out of step with each
            other down the rail — measured, not assumed. */}
        <h3 className="line-clamp-2 min-h-[4.375rem] text-h3 font-semibold leading-tight">
          {name}
        </h3>

        {/* Clamped to two lines AND floored at two lines' height. Both halves
            matter: the clamp stops a long tagline pushing the price row down,
            the floor stops a short one pulling it up. Without the pair, cards in
            the same rail landed their price at different heights purely because
            their descriptions differed in length. 2.625rem = 2 x the measured 21px line box
            line-height `text-sm` computes to here. */}
        <p className="mt-2 line-clamp-2 min-h-[2.625rem] max-w-[34ch] text-sm text-gray-700">
          {tagline}
        </p>

        {/* `mt-auto` is the other half of the fix. The column is already
            `flex-1`, so any height the rail's stretch gives this card beyond its
            content collects here instead of trailing under the links — which
            pins price and CTAs to a shared baseline across the row. */}
        <div className="mt-auto pt-4">
          <PriceFrom value={priceFrom(product)} />
        </div>

        {/* Two text links, never a solid button — see the note above. */}
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <QuickViewTrigger
            product={product}
            label={t('learnMore')}
            ariaLabel={t('quickViewOpen', { product: name })}
          />
          <Button
            variant="link"
            size="sm"
            href={whatsappLink(t('orderMessage', { product: name }))}
            external
            ariaLabel={`${t('order')} — ${name}`}
          >
            {t('order')}
          </Button>
        </div>
      </div>
    </article>
  );
}
