import Image from 'next/image';
import type { Category } from '@/content/schemas';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

type CategoryTileProps = {
  category: Category;
  /** Localized name and tagline, resolved by the caller. */
  name: string;
  tagline: string;
  /** Localized "5 products" label — the card's coloured eyebrow. */
  count: string;
  href: string;
  /**
   * `white` is the default and what most of the rail should be. `ink` exists for
   * the odd card whose cutout is a dark product and reads better on black —
   * the reference rail mixes the two rather than alternating them on a rule.
   */
  bed?: 'white' | 'ink';
  /** Painted width per breakpoint, for `next/image`. */
  sizes?: string;
  className?: string;
};

/**
 * Category browse card, built to the apple.com/store "The latest" rail:
 * a coloured eyebrow, a large name, one bold line of detail, and the product
 * itself filling the bottom half of a tall rounded card.
 *
 * ── What that changed from the old tile ─────────────────────────────────────
 *
 * The previous version was a short grid tile — 48px gold icon chip, name and
 * tagline at body size. The reference's card is the opposite shape: the type
 * is the top third and the product is the rest, which only works if the card is
 * tall and sits in a rail rather than a five-across grid.
 *
 * The gold icon chip went with it, and that matters beyond looks: DESIGN.md's
 * per-page budget records this section as carrying no brand device *because*
 * those chips carried the brand. The `count` eyebrow is what replaces them —
 * gold, on every card, in the reference's own eyebrow slot. On white it must be
 * `--color-gold-text` (5.3:1); brand gold would measure ~2:1 and fail.
 *
 * ── The image slot ─────────────────────────────────────────────────────────
 *
 * `category.image` is optional and most categories don't have one yet. Rather
 * than a grey placeholder box, the card falls back to the category's own icon on
 * a gold-tint disc — complete-looking on its own, and replaced the moment a
 * cutout is listed in content/categories.ts. See public/categories/README.md.
 */
export function CategoryTile({
  category,
  name,
  tagline,
  count,
  href,
  bed = 'white',
  sizes,
  className,
}: CategoryTileProps) {
  const onInk = bed === 'ink';

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-tile p-7 sm:p-8',
        // Tall enough that the type block and the product each get their own
        // half, and no taller: the reference's cards are this shape because the
        // product FILLS the lower half, so any slack past it reads as a void
        // rather than as breathing room.
        'min-h-[21rem] sm:min-h-[24rem]',
        'transition-[transform,box-shadow] duration-300 ease-brand',
        'hover:-translate-y-1 hover:shadow-card',
        onInk ? 'on-ink bg-ink text-white' : 'bg-white text-ink',
        className,
      )}
    >
      {/* Gold on both beds, but not the same gold: `--color-gold-text` is the
          only one that clears AA on white, and brand gold is the one that reads
          on ink. See DESIGN.md §1. */}
      <p className={cn('text-eyebrow uppercase', onInk ? 'text-gold' : 'text-gold-text')}>
        {count}
      </p>

      <h3 className="mt-3 text-balance text-h2 font-semibold">{name}</h3>

      <p
        className={cn(
          'mt-2 text-balance text-base font-semibold',
          onInk ? 'text-gray-300' : 'text-gray-700',
        )}
      >
        {tagline}
      </p>

      {/* `mt-auto` pins the product to the bottom whatever the tagline's length,
          so the cards in a rail line up on their product rather than drifting
          with the copy. */}
      <div
        className={cn(
          'relative mt-auto flex h-40 justify-center pt-8 sm:h-48',
          // A cutout sits on the card's baseline the way the reference's
          // products do; the icon fallback is a disc, so it centres instead.
          category.image ? 'items-end' : 'items-center',
        )}
      >
        {category.image ? (
          <Image
            src={category.image}
            alt=""
            width={600}
            height={600}
            sizes={sizes}
            className="h-full w-auto max-w-full object-contain transition-transform duration-500 ease-brand group-hover:scale-[1.04]"
          />
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              'inline-flex h-32 w-32 items-center justify-center rounded-full transition-transform duration-500 ease-brand group-hover:scale-[1.04]',
              // Not `bg-white/10`: this palette maps every colour to a bare
              // var() with no <alpha-value>, so Tailwind drops alpha utilities
              // silently and the disc would come out with no fill at all.
              onInk ? 'bg-gray-700 text-gold' : 'bg-gold-tint text-gold-text',
            )}
          >
            <Icon name={category.icon} size={56} />
          </span>
        )}
      </div>

      {/* The whole card is the control, so this is decoration, not a second
          link — it just gives the hover somewhere to land. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute bottom-6 end-6 inline-flex h-9 w-9 items-center justify-center rounded-full',
          'transition-[background-color,transform] duration-300 ease-brand',
          onInk ? 'bg-gray-700 text-white' : 'bg-gray-50 text-ink',
          'ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5',
        )}
      >
        <Icon name="chevron" size={16} className="rtl:-scale-x-100" />
      </span>
    </Link>
  );
}
