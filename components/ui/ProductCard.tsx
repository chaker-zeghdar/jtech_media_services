'use client';

import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Product } from '@/content/schemas';
// Client component: import from content/contact and lib/product, never from
// content/products or content/settings — those carry zod and the catalogue.
import { whatsappLink } from '@/content/contact';
import { cn } from '@/lib/cn';
import { pickLocale } from '@/lib/format';
import { priceFrom, primaryVariant } from '@/lib/product';
import { Badge } from './Badge';
import { Icon } from './Icon';
import { Price } from './Price';
import { ProductImage } from './ProductImage';
import { StockDot } from './StockDot';

/**
 * Loaded on first quick-view click only. This is what keeps Framer Motion out of
 * the initial bundle while still using it for the interaction it's good at.
 */
const QuickView = dynamic(() => import('./QuickView').then((module) => module.QuickView), {
  ssr: false,
});

type ProductCardProps = {
  product: Product;
  /** Passed through to next/image. Required — see ProductImage. */
  sizes?: string;
  /** Enables the quick-view dialog. Off inside carousels where drag conflicts. */
  quickView?: boolean;
  className?: string;
};

/**
 * The component that decides whether the site looks real.
 *
 * Hover choreography, all on the card's `group`:
 *   bed         gray-50 → gold-tint
 *   light sweep one diagonal white pass over 600ms (CSS, globals.css)
 *   product     lifts 6px and rotates −1deg
 *   spec pills  fade in along the bottom of the bed
 *   order       slides up from the card's bottom edge
 *
 * Every reveal is also bound to `group-focus-within`, so a keyboard user gets the
 * same affordances a mouse user does — a hover-only control is an inaccessible
 * control.
 *
 * PHASE 2: `order` currently deep-links to WhatsApp with the product name
 * prefilled, because there is no cart yet. Swap the <a> for an addToCart handler
 * and nothing else about this component needs to change.
 */
export function ProductCard({
  product,
  sizes = '(max-width: 639px) 78vw, (max-width: 1023px) 44vw, (max-width: 1439px) 30vw, 300px',
  quickView = true,
  className,
}: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations('product');
  const [dialogOpen, setDialogOpen] = useState(false);
  // Keeps QuickView (and Framer Motion) unmounted until the first open.
  const [dialogMounted, setDialogMounted] = useState(false);

  const name = pickLocale(product.name, locale);
  const variant = primaryVariant(product);
  const lowest = priceFrom(product);
  const specPills = product.specs.slice(0, 2);

  const openDialog = () => {
    setDialogMounted(true);
    setDialogOpen(true);
  };

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-card pb-14',
        className,
      )}
    >
      {/* ---- Image bed --------------------------------------------------- */}
      <div
        className={cn(
          'light-sweep relative isolate aspect-[4/5] overflow-hidden rounded-card bg-gray-50',
          'transition-colors duration-500 ease-brand',
          'group-hover:bg-gold-tint group-focus-within:bg-gold-tint',
        )}
      >
        {product.badges.length > 0 ? (
          <ul className="absolute start-3.5 top-3.5 z-20 flex flex-col items-start gap-1.5">
            {product.badges.map((badge) => (
              <li key={badge}>
                <Badge badge={badge} />
              </li>
            ))}
          </ul>
        ) : null}

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
          <ul
            aria-hidden="true"
            className={cn(
              'absolute inset-x-3.5 bottom-3.5 z-20 flex flex-wrap justify-center gap-1.5',
              'opacity-0 transition-opacity duration-500 ease-brand',
              'group-hover:opacity-100 group-focus-within:opacity-100',
            )}
          >
            {specPills.map((spec) => (
              <li
                key={spec.key}
                className="rounded-full bg-white/85 px-2.5 py-1 text-caption text-gray-700 backdrop-blur-[2px]"
              >
                <bdi className="num">{spec.value}</bdi>
              </li>
            ))}
          </ul>
        ) : null}

        {quickView ? (
          <button
            type="button"
            onClick={openDialog}
            aria-label={t('quickViewOpen', { product: name })}
            className="absolute inset-0 z-30 flex items-start justify-end p-3.5"
          >
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full bg-ink/90 px-3.5 py-2 text-pill text-white',
                'opacity-0 transition-opacity duration-300 ease-brand',
                'group-hover:opacity-100 group-focus-within:opacity-100',
              )}
            >
              <Icon name="camera" size={14} />
              {t('quickView')}
            </span>
          </button>
        ) : null}
      </div>

      {/* ---- Info -------------------------------------------------------- */}
      <div className="mt-5 flex flex-1 flex-col items-start gap-2">
        <p className="text-caption uppercase text-gray-500">{product.brand}</p>
        <h3 className="text-base font-semibold leading-snug">{name}</h3>
        <div className="mt-auto pt-2">
          <Price
            value={lowest}
            compareAt={lowest === variant.price ? variant.compareAt : null}
          />
        </div>
        <StockDot status={variant.stock} />
      </div>

      {/* ---- Order: slides up from the card's bottom edge ----------------
          The 56px of pb on the card reserves this strip, so the reveal costs
          no layout shift. */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-20 pt-2',
          'translate-y-full opacity-0 transition-[transform,opacity] duration-300 ease-brand',
          'group-hover:translate-y-0 group-hover:opacity-100',
          'group-focus-within:translate-y-0 group-focus-within:opacity-100',
        )}
      >
        <a
          href={whatsappLink(t('orderMessage', { product: name }))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-gray-700"
        >
          <Icon name="whatsapp" size={16} />
          {t('order')}
          <span className="sr-only">— {name}</span>
        </a>
      </div>

      {dialogMounted ? (
        <QuickView product={product} open={dialogOpen} onClose={() => setDialogOpen(false)} />
      ) : null}
    </article>
  );
}
