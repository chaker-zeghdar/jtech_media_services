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
  className,
}: ProductImageProps) {
  const t = useTranslations('a11y');

  if (!src) {
    return (
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center',
          className,
        )}
        role="img"
        aria-label={t('imagePending', { product: name })}
      >
        <LogoMark size={28} className="text-ink opacity-[0.12]" />
        <span className="max-w-[18ch] text-caption font-medium text-gray-500">{name}</span>
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
      className={cn('h-full w-full object-contain', className)}
    />
  );
}
