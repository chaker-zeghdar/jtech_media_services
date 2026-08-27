'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Product } from '@/content/schemas';
import { pickLocale } from '@/lib/format';
import { primaryVariant, productColours } from '@/lib/product';
import { Button } from './Button';
import { Price } from './Price';
import { ProductGallery } from './ProductGallery';
import { StockDot } from './StockDot';

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
 * The original `<QuickView />` content, unchanged in substance and extracted
 * only so the dialog can switch between this, `<CheckoutView />` and
 * `<OrderConfirmation />` without one file growing a three-way conditional
 * around unrelated concerns.
 *
 * The one real change: the order button no longer deep-links to WhatsApp. It
 * calls `onOrder`, which flips `<QuickView />`'s internal view state to
 * `'checkout'` — the dialog stays open and switches content in place, which is
 * both the more premium feel (one continuous panel, not a stack of popups) and
 * what checkout is now built to do instead of handing off to WhatsApp.
 */
export function ProductDetailView({ product, titleId, onOrder }: ProductDetailViewProps) {
  const locale = useLocale();
  const t = useTranslations('product');

  const name = pickLocale(product.name, locale);
  const variant = primaryVariant(product);
  const colours = productColours(product);

  return (
    <>
      {/* Every photo on the variant, not just the first. <ProductGallery />
          collapses to a single static frame when there is one photo or none,
          which is still most of the catalogue. */}
      <ProductGallery images={variant.images} name={name} />

      <div className="flex flex-col">
        <p className="text-caption uppercase text-ink/70">{product.brand}</p>
        <h2 id={titleId} className="mt-2 text-h2 font-semibold">
          {name}
        </h2>

        <p className="mt-4 text-base text-gray-700">{pickLocale(product.description, locale)}</p>

        <div className="mt-6">
          <Price value={variant.price} compareAt={variant.compareAt} size="lg" showSaving />
          <StockDot status={variant.stock} className="mt-3" />
        </div>

        {colours.length > 1 ? (
          <div className="mt-7">
            <h3 className="text-caption uppercase text-gray-700">{t('colours')}</h3>
            <ul className="mt-3 flex flex-wrap gap-2.5">
              {colours.map((colour) => (
                <li key={colour.slug}>
                  <span
                    title={pickLocale(colour.label, locale)}
                    className="block h-7 w-7 rounded-full border border-gray-300"
                    style={{ backgroundColor: colour.hex }}
                  >
                    <span className="sr-only">{pickLocale(colour.label, locale)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {product.specs.length > 0 ? (
          <div className="mt-7">
            <h3 className="text-caption uppercase text-gray-700">{t('specs')}</h3>
            <dl className="mt-3 divide-y divide-gray-300 border-t border-gray-300">
              {product.specs.map((spec) => (
                <div key={spec.key} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-sm text-gray-700">{pickLocale(spec.label, locale)}</dt>
                  <dd className="text-sm font-medium">
                    <bdi className="num">{spec.value}</bdi>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <div className="mt-8">
          <Button type="button" onClick={onOrder} fullWidth>
            {t('order')}
          </Button>
        </div>
      </div>
    </>
  );
}
