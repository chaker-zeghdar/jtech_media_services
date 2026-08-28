'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { Product } from '@/content/schemas';
import { primaryVariant, productColours } from '@/lib/product';
import { Price } from './Price';
import { StockDot } from './StockDot';

type ProductInfoProps = {
  product: Product;
  /** Rendered on the heading, so a caller can point `aria-labelledby` at it. */
  titleId: string;
  /**
   * `h1` on the product page, which owns the document outline; `h2` inside
   * `<QuickView />`, where the dialog is a section of a page that already has
   * an h1. Same visual size either way — this is about document structure, not
   * type scale, which is exactly the case a hardcoded tag gets wrong.
   */
  headingLevel?: 'h1' | 'h2';
  /**
   * The call to action. Deliberately a slot rather than a prop pair: the dialog
   * switches its own view in place, the product page scrolls to a form further
   * down the same document, and a `variant`/`onClick` prop covering both would
   * be an abstraction over two things that only look alike.
   */
  action: ReactNode;
};

/**
 * The product's written detail — brand, name, description, price, stock,
 * colours, specs.
 *
 * Shared by `<ProductDetailView />` (the quick-view dialog) and
 * `/products/[slug]` (the ad landing page), which had identical columns here
 * and differ only in their heading level and their call to action. The gallery
 * is NOT part of this: the two surfaces lay it out differently — a dialog
 * column versus a page-width grid — so it stays with each caller.
 *
 * Still a client component, as it was inside the dialog. The landing page is a
 * server component that renders this; the hydration cost is a few static
 * elements, and the alternative (threading every translated label in as a prop)
 * buys nothing on a page that already mounts the checkout island below it.
 */
export function ProductInfo({
  product,
  titleId,
  headingLevel = 'h2',
  action,
}: ProductInfoProps) {
  const t = useTranslations('product');

  const name = product.name;
  const variant = primaryVariant(product);
  const colours = productColours(product);
  const Heading = headingLevel;

  /**
   * Shown when the product actually carries a reading — which the admin form
   * only ever lets happen for a category with battery health enabled: it clears
   * the field on a category switch and sends null unless the flag is on. So the
   * storefront and the dashboard cannot disagree about whether a badge belongs,
   * because the condition is enforced where the value is WRITTEN rather than
   * re-derived here from a flag this component would have to be handed.
   */
  const batteryHealth = product.batteryHealthPercent;

  return (
    <div className="flex flex-col">
      <p className="text-caption uppercase text-ink/70">{product.brand}</p>
      <Heading id={titleId} className="mt-2 text-h2 font-semibold">
        {name}
      </Heading>

      {product.description ? (
        <p className="mt-4 text-base text-gray-700">{product.description}</p>
      ) : null}

      <div className="mt-6">
        <Price value={variant.price} compareAt={variant.compareAt} size="lg" showSaving />
        <StockDot status={variant.stock} className="mt-3" />
      </div>

      {/* At-a-glance facts, beside the price where the buying decision is made.
          Both were captured in the admin and shown nowhere a customer looks:
          capacity only appeared inside the checkout summary line, AFTER someone
          had already scrolled down and committed to ordering, and battery health
          appeared nowhere at all. */}
      {variant.storage || batteryHealth !== null ? (
        <ul className="mt-4 flex flex-wrap items-center gap-2">
          {variant.storage ? (
            <li className="rounded-full border border-gray-300 px-3 py-1.5 text-caption font-medium">
              {t('storage')} <bdi className="num">{variant.storage}</bdi>
            </li>
          ) : null}

          {batteryHealth !== null ? (
            <li className="rounded-full border border-gold bg-gold-tint px-3 py-1.5 text-caption font-medium text-gold-text">
              {t('batteryHealth')} <bdi className="num">{batteryHealth}٪</bdi>
            </li>
          ) : null}
        </ul>
      ) : null}

      {colours.length > 1 ? (
        <div className="mt-7">
          <h3 className="text-caption uppercase text-gray-700">{t('colours')}</h3>
          <ul className="mt-3 flex flex-wrap gap-2.5">
            {colours.map((colour) => (
              <li key={colour.slug}>
                <span
                  title={colour.label}
                  className="block h-7 w-7 rounded-full border border-gray-300"
                  style={{ backgroundColor: colour.hex }}
                >
                  <span className="sr-only">{colour.label}</span>
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
                <dt className="text-sm text-gray-700">{spec.label}</dt>
                <dd className="text-sm font-medium">
                  <bdi className="num">{spec.value}</bdi>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <div className="mt-8">{action}</div>
    </div>
  );
}
