import type { Category } from '@/content/schemas';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';
import { ProductImage } from './ProductImage';

type CategoryTileProps = {
  category: Category;
  /** Localized name and tagline, resolved by the caller. */
  name: string;
  tagline: string;
  href: string;
  /**
   * The card's face. `<Categories />` alternates these by index across the rail
   * rather than picking per category, so adding a sixth category keeps the
   * rhythm without anyone editing a list.
   */
  bed?: 'gradient' | 'gray';
  /** Painted width per breakpoint, for `next/image`. */
  sizes: string;
  className?: string;
};

/**
 * Category browse card, built to the apple.com/store "The latest" rail: a large
 * name, one line of detail, and the product itself filling the lower half of a
 * tall rounded card.
 *
 * ── Three things, and nothing else ──────────────────────────────────────────
 *
 * Name, tagline, product. An earlier revision also carried a gold "5 منتجات"
 * count eyebrow above the name; it is gone, and with it the last piece of copy
 * on the card that wasn't about the category itself.
 *
 * That eyebrow was load-bearing in a way worth recording, because DESIGN.md's
 * per-page budget lists this section as carrying no named brand device: the gold
 * had to live *somewhere*, and for one revision it lived there. It now lives in
 * the alternating gradient faces below, which is a stronger carrier than a line
 * of small caps ever was. The budget entry was updated to match — the two must
 * not drift apart again.
 *
 * ── The two faces ───────────────────────────────────────────────────────────
 *
 * `gradient` is `--gradient-category-card`, the same gold descent the hero uses,
 * spread for a card's height. Every word on it is solid ink: gray-700 measures
 * 2.46:1 against the gold end and fails outright, the same trap the hero header
 * hit. `gray` is flat `--color-gray-50`, where gray-700 is fine for the tagline.
 *
 * ── No photo yet ────────────────────────────────────────────────────────────
 *
 * <ProductImage /> handles that branch, exactly as it does for every product on
 * the page: the JTECH mark at 12% over the bed, with the name beneath. It
 * replaced a gold-tint disc holding the category's icon glyph, which was louder
 * than the real photos it stood in for — an empty state should be quieter than
 * the thing it is waiting for, not brighter.
 */
export function CategoryTile({
  category,
  name,
  tagline,
  href,
  bed = 'gradient',
  sizes,
  className,
}: CategoryTileProps) {
  const onGradient = bed === 'gradient';

  return (
    <Link
      href={href}
      style={onGradient ? { background: 'var(--gradient-category-card)' } : undefined}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-tile p-7 text-ink sm:p-8',
        // Tall enough that the type block and the product each get their own
        // half, and no taller: the reference's cards are this shape because the
        // product FILLS the lower half, so any slack past it reads as a void.
        'min-h-[21rem] sm:min-h-[24rem]',
        'transition-[transform,box-shadow] duration-300 ease-brand',
        'hover:-translate-y-1 hover:shadow-card',
        !onGradient && 'bg-gray-50',
        className,
      )}
    >
      <h3 className="text-balance text-h2 font-semibold">{name}</h3>

      <p
        className={cn(
          'mt-2 text-balance text-base font-semibold',
          // Ink on the gradient is not a style choice — see the note above.
          onGradient ? 'text-ink' : 'text-gray-700',
        )}
      >
        {tagline}
      </p>

      {/* `mt-auto` pins the product to the bottom whatever the tagline's length,
          so the cards in a rail line up on their product rather than drifting
          with the copy. */}
      <div className="relative mt-auto h-40 pt-8 sm:h-48">
        <ProductImage
          src={category.image}
          name={name}
          width={600}
          height={600}
          sizes={sizes}
          className="transition-transform duration-500 ease-brand group-hover:scale-[1.04]"
        />
      </div>

      {/* The whole card is the control, so this is decoration, not a second
          link — it just gives the hover somewhere to land. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute bottom-6 end-6 inline-flex h-9 w-9 items-center justify-center rounded-full',
          'bg-white text-ink transition-transform duration-300 ease-brand',
          'ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5',
        )}
      >
        <Icon name="chevron" size={16} className="rtl:-scale-x-100" />
      </span>
    </Link>
  );
}
