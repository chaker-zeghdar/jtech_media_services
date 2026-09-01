import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { LogoMark } from '@/components/brand/LogoMark';
import { cn } from '@/lib/cn';

type ProductImageProps = {
  /** First entry of `variant.images`, or undefined when no photo exists yet. */
  src: string | undefined;
  /** Localized product name — used for real alt text and for the empty state. */
  name: string;
  /** Intrinsic box. Always supplied so nothing on the page can shift (CLS = 0). */
  width: number;
  height: number;
  /** Explicit `sizes` is mandatory: without it next/image ships the widest source. */
  sizes: string;
  /** True on the hero image only. */
  priority?: boolean;
  /**
   * `contain` (the default) fits the whole frame inside the box and gives the
   * leftover back as empty space — right for a cutout floating on a bed, and
   * for any slot whose shape the photo can't be assumed to match.
   *
   * `cover` fills the box and crops the overflow instead. Needed wherever the
   * bed has a fixed shape and the catalogue does not: a 3:4 phone photo in
   * <ProductCard />'s 4:5 bed fits to height under `contain` and hands the
   * leftover width back as a visible border of bare bed.
   *
   * A PROP rather than an `object-cover` passed through `className`: `cn` is a
   * plain joiner, not tailwind-merge, so that route emits `object-contain
   * object-cover` together and leaves the winner to stylesheet order — which
   * happens to be `cover` today and is not something this component should be
   * betting on.
   */
  fit?: 'contain' | 'cover';
  className?: string;
};

/**
 * Renders the real photo when one exists, and a *branded* empty state when it
 * doesn't — the JTECH mark at 28px / .12 opacity over the gray image bed, with
 * the product name beneath.
 *
 * This exists because the alternative (a bare gray or black rectangle, or a
 * file-upload placeholder) makes the entire page read as broken. Every product
 * in content/products.ts currently has `images: []`, so this path is what the
 * homepage shows until the client's cutouts arrive. See README § "Adding
 * product photos".
 */
export function ProductImage({
  src,
  name,
  width,
  height,
  sizes,
  priority = false,
  fit = 'contain',
  className,
}: ProductImageProps) {
  const t = useTranslations('a11y');

  if (!src) {
    // No drop-shadow here. `filter: drop-shadow()` on a flat box is pure paint
    // cost with nothing to cast a shadow from — it's for the cutout, so it lives
    // on the <Image> branch only. Callers pass it via `className` and it is
    // deliberately ignored in this branch.
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center"
        role="img"
        aria-label={t('imagePending', { product: name })}
      >
        <LogoMark height={26} tone="current" className="text-ink opacity-[0.12]" />
        <span className="max-w-[18ch] text-caption font-medium text-gray-700">{name}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      // Non-hero images stay lazy; the hero opts in via `priority`.
      loading={priority ? undefined : 'lazy'}
      className={cn(
        'h-full w-full',
        fit === 'cover' ? 'object-cover' : 'object-contain',
        className,
      )}
    />
  );
}
