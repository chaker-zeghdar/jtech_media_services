import { Link } from '@/i18n/navigation';
import type { Category } from '@/content/schemas';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

type CategoryTileProps = {
  category: Category;
  /** Localized name and tagline, resolved by the caller. */
  name: string;
  tagline: string;
  /**
   * PHASE 2: becomes `/categories/{slug}`. Until those pages exist this points
   * at the range section so the tile is never a dead control.
   */
  href: string;
  className?: string;
};

/**
 * Category browse tile: gold icon chip, name, tagline.
 *
 * The chip is the only gold fill on the tile — the category strip has no brand
 * device of its own, so these chips are what carry the brand through §4 without
 * breaking the one-device-per-section rule.
 */
export function CategoryTile({ category, name, tagline, href, className }: CategoryTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex h-full flex-col gap-4 rounded-card border border-gray-300 bg-white p-6',
        'transition-[transform,border-color,background-color] duration-300 ease-brand',
        'hover:-translate-y-0.5 hover:border-gold hover:bg-gold-tint',
        className,
      )}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-chip bg-gold text-ink">
        <Icon name={category.icon} size={24} />
      </span>

      <span className="flex flex-1 flex-col gap-1.5">
        {/* Name and chevron share a row — a chevron on its own line below the
            tagline reads as an orphaned glyph rather than as an affordance. */}
        <span className="flex items-center justify-between gap-3">
          <span className="text-base font-semibold">{name}</span>
          <Icon
            name="chevron"
            size={15}
            className={cn(
              'shrink-0 text-gold-text rtl:-scale-x-100',
              'transition-transform duration-200 ease-brand',
              'ltr:group-hover:translate-x-[3px] rtl:group-hover:-translate-x-[3px]',
            )}
          />
        </span>
        <span className="text-sm text-gray-700">{tagline}</span>
      </span>
    </Link>
  );
}
