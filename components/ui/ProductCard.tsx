import { getTranslations } from 'next-intl/server';
import type { Product } from '@/content/schemas';
import { cn } from '@/lib/cn';
import { firstClause, pickLocale } from '@/lib/format';
import type { Locale } from '@/i18n/routing';
import { primaryBadge, priceFrom, primaryVariant, productColours } from '@/lib/product';
import { Badge } from './Badge';
import { ColourSwatches } from './ColourSwatches';
import { PriceFrom } from './Price';
import { ProductDialogTrigger } from './ProductDialogTrigger';
import { ProductImage } from './ProductImage';

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
 * Apple lineup treatment, with one deliberate departure from it.
 *
 * Order is: bed (badge overlaid on it) → swatches → name → one-line tagline →
 * "من X دج" → a filled order button with a small detail affordance beside it.
 *
 * ── The card now carries a filled button, reversing what it shipped with ────
 *
 * This component's original rule was the opposite: "there is no solid button on
 * the card face — Apple's lineup cards use two links, and the filled button is
 * reserved for the featured block and the sticky mobile bar, which is what keeps
 * it meaning something." That was right for a catalogue you could only browse.
 * It stopped being right once checkout existed: ordering meant finding the
 * quieter of two identically-styled text links, opening a dialog, and only then
 * meeting a button — three steps to start a purchase, on a shop whose traffic is
 * almost entirely mobile. Reversed at the client's request, and the reference
 * they sent puts a filled button on every card face.
 *
 * What keeps the filled button meaning something now is scarcity *within* the
 * card rather than across the page: it is the only filled thing on it, and
 * "learn more" was demoted from an equal text link to a 36px icon button beside
 * it. Two links of equal weight asked the reader to choose; a button and an
 * affordance tell them which one is the point.
 *
 * Exactly ONE badge, now overlaid on the image's top-start corner rather than
 * occupying its own reserved row above the name. Stacked badges over a product
 * would read as a rendering fault, which is why the cap stays at one.
 *
 * A **server component**. The hover choreography is CSS on the card's `group`:
 *   bed         gray-50 → gold-tint
 *   light sweep one diagonal white pass over 600ms (globals.css)
 *   product     lifts 6px and rotates −1deg
 *
 * A fourth beat — two spec-value pills fading in along the bottom of the bed —
 * was cut when the card shrank ~12% (lib/rail.ts). At the smaller footprint it
 * landed at the exact moment the bed is already tinting, the product is already
 * lifting and rotating, and the bed itself has less room to hold it; one more
 * thing fading in read as busy rather than premium. The existing three beats
 * are the "the card responds to you" cue; a fourth was competing with them, not
 * adding to them.
 *
 * Only <ProductDialogTrigger /> is a client island, and it is the two text
 * links plus one lazily-mounted dialog behind both of them.
 *
 * PHASE 2: the detail affordance opens the quick view because product detail
 * pages don't exist yet; point it at /products/{slug} when they do.
 *
 * "اطلب الآن" opens that same dialog straight to its checkout view — a real
 * variant/quantity/delivery form with a live total, built on `content/
 * wilayas.ts`'s per-wilaya fees. It replaced the old WhatsApp deep link
 * (`whatsappLink(t('orderMessage', ...))`), which is still what `<Header />`'s
 * and `<MobileMenu />`'s own contact icons use — this is the one CTA on the
 * page that no longer hands off to WhatsApp on click. The checkout form
 * itself submits nothing anywhere yet; see CheckoutView.tsx's PHASE 3 note.
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
            'absolute inset-0 z-10 flex items-center justify-center p-6',
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

        {/* Overlaid on the bed rather than sitting in its own row above the
            name — that row and its `h-6` reserve are where most of this card's
            height reduction came from.

            OUTSIDE the transform wrapper above, deliberately: the product lifts
            and rotates on hover and the badge must not travel with it, or a
            label describing the product starts behaving like part of the
            photograph. `z-20` clears both the product (`z-10`) and the
            `.light-sweep` pseudo-element, which carries no z-index of its own.
            `start-3`, not `left-3` — it mirrors under Arabic for free. */}
        {badge ? (
          <div className="absolute start-3 top-3 z-20">
            <Badge badge={badge} />
          </div>
        ) : null}
      </div>

      {/* ---- Info --------------------------------------------------------
          Order follows apple.com/store's accessory cards: swatches sit directly
          under the image, then the eyebrow tag, then the name. */}
      <div className="mt-4 flex flex-1 flex-col items-start">
        {/* Every variable-height zone in this column reserves its space, so a
            card with no swatches and a one-line name lands its name, tagline and
            price at the same y as the card beside it with six colours and a
            two-line name. Reserved rather than conditional, because a rail is
            read across, not down: one card's missing row shifts everything below
            it out of step with its neighbours.

            <ColourSwatches /> returns null under two colours ("one colour is not
            a choice"), so without a floor here that row simply vanishes. The
            height is the dot row plus its own margin.

            The badge's reserved row used to sit directly below this one. It is
            gone — the badge moved onto the image bed, so there is no longer a
            variable-height zone here to reserve for it. */}
        <div className="mb-2.5 h-4">
          <ColourSwatches colours={colours} />
        </div>

        {/* Clamped and floored like the tagline below. Two lines, not one:
            "لينوفو آيديا باد سليم 3" and "Galaxy Watch Ultra 2" are real
            products and both wrap at this width, so line-clamp-1 would truncate
            live catalogue entries rather than tidy an edge case.

            `text-h3` (22-28px fluid) was sized for the old 290px card; at the
            256px card it read oversized relative to its own frame, so the name
            drops to `text-subhead-sm` — a FIXED 19px rather than another fluid
            step, deliberately: a smaller, calmer card is exactly the case where
            a size that stops growing past a certain viewport reads as more
            controlled than one that keeps scaling with it.

            No `leading-tight` here, unlike the old `text-h3` version — that
            utility sets line-height to Tailwind's 1.25, which under `text-h3`
            was a harmless duplicate of the token's own 1.25 leading but under
            `text-subhead-sm` (which specifies 1.45) would silently overrule it.
            Caught by measuring: with `leading-tight` still attached the
            rendered line box came out at 23.75px (19 x 1.25), not the token's
            own 19 x 1.45 = 27.55px — removing it let the token's real leading
            apply.

            The floor is TWO lines, not one — flooring at one line only reserves
            space for the shorter case, which leaves one- and two-line names out
            of step with each other down the rail.

            Re-measured against THIS layout rather than carried forward: the
            rendered line box is 27.55px, so two lines is 55.10px = 3.4438rem.
            The previous value (3.4375rem = 55px) was rounded down from the same
            measurement, which left a two-line name 0.1px proud of its own floor
            — sub-pixel, but it meant the floor wasn't actually doing its job for
            the case it exists for. The token itself didn't change in this pass;
            only the rounding was wrong. */}
        <h3 className="line-clamp-2 min-h-[3.4438rem] text-subhead-sm font-semibold">
          {name}
        </h3>

        {/* Clamped to two lines AND floored at two lines' height. Both halves
            matter: the clamp stops a long tagline pushing the price row down,
            the floor stops a short one pulling it up. Without the pair, cards in
            the same rail landed their price at different heights purely because
            their descriptions differed in length. Re-measured alongside the name
            above: `text-sm` computes to a 21px line box here, so two lines is
            42px = 2.625rem — exact, and unchanged by this pass. */}
        <p className="mt-2 line-clamp-2 min-h-[2.625rem] max-w-[34ch] text-sm text-gray-700">
          {tagline}
        </p>

        {/* `mt-auto` is the other half of the fix. The column is already
            `flex-1`, so any height the rail's stretch gives this card beyond its
            content collects here instead of trailing under the actions — which
            pins price and CTAs to a shared baseline across the row. */}
        <div className="mt-auto w-full pt-3">
          <PriceFrom value={priceFrom(product)} />
        </div>

        {/* The filled order button and the detail affordance beside it. Both
            open the SAME dialog — see <ProductDialogTrigger />'s own doc comment
            for why they share one client island instead of each managing their
            own. `w-full` because the column is `items-start`, which would
            otherwise shrink this row to its content and leave the button
            floating at the card's inline start. */}
        <div className="mt-3 w-full">
          <ProductDialogTrigger
            product={product}
            learnMoreAriaLabel={t('quickViewOpen', { product: name })}
            orderLabel={t('order')}
            orderAriaLabel={`${t('order')} — ${name}`}
          />
        </div>
      </div>
    </article>
  );
}
