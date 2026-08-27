'use client';

import { useTranslations } from 'next-intl';
import type { Product } from '@/content/schemas';
import { primaryVariant } from '@/lib/product';
import { Button } from './Button';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';

type ProductDetailViewProps = {
  product: Product;
  /**
   * Rendered on this view's own heading, so `<QuickView />`'s
   * `aria-labelledby` keeps resolving to real, visible text no matter which
   * of the three views is currently showing — see the note in QuickView.tsx.
   */
  titleId: string;
  /** Switches the dialog to the checkout view, in place — see QuickView.tsx. */
  onOrder: () => void;
};

/**
 * The quick-view dialog's product detail: gallery on one side, written detail
 * on the other.
 *
 * The written column moved to `<ProductInfo />`, shared verbatim with
 * `/products/[slug]`. What stays here is what is specific to the dialog — the
 * two-column split `<QuickView />`'s grid expects, and an order button that
 * flips the dialog's own view state rather than navigating anywhere. The
 * landing page passes a scroll link into the same slot.
 */
export function ProductDetailView({ product, titleId, onOrder }: ProductDetailViewProps) {
  const t = useTranslations('product');
  const variant = primaryVariant(product);

  return (
    <>
      {/* Every photo on the variant, not just the first. <ProductGallery />
          collapses to a single static frame when there is one photo or none,
          which is still most of the catalogue. */}
      <ProductGallery images={variant.images} name={product.name} />

      <ProductInfo
        product={product}
        titleId={titleId}
        action={
          <Button type="button" onClick={onOrder} fullWidth>
            {t('order')}
          </Button>
        }
      />
    </>
  );
}
