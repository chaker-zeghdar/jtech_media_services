'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Product } from '@/content/schemas';
// Client component — see the import note in ProductCard.tsx.
import { whatsappLink } from '@/content/contact';
import { pickLocale } from '@/lib/format';
import { primaryVariant, productColours } from '@/lib/product';
import { cn } from '@/lib/cn';
import { Button } from './Button';
import { Icon } from './Icon';
import { Price } from './Price';
import { ProductImage } from './ProductImage';
import { StockDot } from './StockDot';

type QuickViewProps = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Product quick-view dialog.
 *
 * This is the one place Framer Motion earns its weight: it only mounts on click,
 * so it is loaded through next/dynamic from <ProductCard /> and contributes
 * nothing to first-load JS. The always-on motion primitives in components/motion
 * are CSS for exactly that reason.
 *
 * Implements the full dialog contract by hand — no headless library: labelled by
 * the product name, focus moved in on open and restored on close, Tab cycled
 * inside, Escape and backdrop both close, and the page behind is scroll-locked
 * and hidden from assistive tech via aria-hidden on the portal sibling.
 */
export function QuickView({ product, open, onClose }: QuickViewProps) {
  const locale = useLocale();
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const reduce = useReducedMotion();

  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  const name = pickLocale(product.name, locale);
  const variant = primaryVariant(product);
  const colours = productColours(product);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => element.offsetParent !== null,
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    restoreFocusTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    // Move focus to the dialog itself; the close button is its first stop.
    const frame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
      restoreFocusTo.current?.focus();
    };
  }, [open, handleKeyDown]);

  if (typeof document === 'undefined') return null;

  const duration = reduce ? 0 : 0.26;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-modal flex items-end justify-center sm:items-center">
          <motion.div
            aria-hidden="true"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            className="absolute inset-0 bg-ink/45"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration, ease: [0.28, 0.11, 0.32, 1] }}
            className={cn(
              'relative z-10 max-h-[92dvh] w-full max-w-[880px] overflow-y-auto bg-white shadow-modal',
              'rounded-t-tile sm:rounded-tile',
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={tCommon('close')}
              className="absolute end-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-ink transition-colors duration-200 hover:bg-gray-100"
            >
              <Icon name="close" size={18} />
            </button>

            <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-2 md:gap-12">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-card bg-gray-50">
                <ProductImage
                  src={variant.images[0]}
                  name={name}
                  width={520}
                  height={520}
                  sizes="(max-width: 767px) 88vw, 400px"
                  className="drop-shadow-product"
                />
              </div>

              <div className="flex flex-col">
                <p className="text-caption uppercase text-gray-500">{product.brand}</p>
                <h2 id={titleId} className="mt-2 text-h2 font-semibold">
                  {name}
                </h2>

                <p className="mt-4 text-base text-gray-700">
                  {pickLocale(product.description, locale)}
                </p>

                <div className="mt-6">
                  <Price
                    value={variant.price}
                    compareAt={variant.compareAt}
                    size="lg"
                    showSaving
                  />
                  <StockDot status={variant.stock} className="mt-3" />
                </div>

                {colours.length > 1 ? (
                  <div className="mt-7">
                    <h3 className="text-caption uppercase text-gray-500">{t('colours')}</h3>
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
                    <h3 className="text-caption uppercase text-gray-500">{t('specs')}</h3>
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
                  <Button
                    href={whatsappLink(t('orderMessage', { product: name }))}
                    external
                    fullWidth
                  >
                    {t('order')}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
