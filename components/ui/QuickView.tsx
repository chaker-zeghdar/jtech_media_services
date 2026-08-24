'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Product } from '@/content/schemas';
import { cn } from '@/lib/cn';
import { type ConfirmedOrder, CheckoutView } from './CheckoutView';
import { Icon } from './Icon';
import { OrderConfirmation } from './OrderConfirmation';
import { ProductDetailView } from './ProductDetailView';

type View = 'detail' | 'checkout' | 'confirmed';

type QuickViewProps = {
  product: Product;
  open: boolean;
  onClose: () => void;
  /**
   * Which view a fresh open lands on. `<ProductDialogTrigger />` passes
   * `'checkout'` for the card's own order button (skip the detail view —
   * someone clicking "order" already knows what they want) and `'detail'`
   * for "learn more". Re-applied every time `open` transitions to true, so
   * reopening the same mounted dialog from the other trigger doesn't leave
   * it on whatever view it was last closed on.
   */
  initialView?: View;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Product quick-view dialog — and, since the checkout pass, also the
 * single-product buy-now flow. One dialog, three interchangeable views:
 *
 *   'detail'    the original quick view — photo, price, colours, specs
 *   'checkout'  variant/quantity/delivery form + live order summary
 *   'confirmed' the post-submit recap; see CheckoutView's own PHASE 3 note
 *
 * They share this file's dialog shell (portal, focus trap, Escape, backdrop,
 * scroll lock) rather than being three separate dialogs, which is both the
 * more premium feel — one continuous panel, not a stack of popups — and the
 * reason `<ProductCard />`'s "order" button and its own "اعرف أكثر" → "order"
 * button switch views in place instead of closing and reopening.
 *
 * This is the one place Framer Motion earns its weight: it only mounts on
 * click, so it is loaded through next/dynamic from <ProductDialogTrigger />
 * and contributes nothing to first-load JS. The always-on motion primitives
 * in components/motion are CSS for exactly that reason.
 *
 * Implements the full dialog contract by hand — no headless library:
 * labelled by whichever view's own heading is currently showing (see the
 * `titleId` note below), focus moved in on open and restored on close, Tab
 * cycled inside, Escape and backdrop both close, and the page behind is
 * scroll-locked and hidden from assistive tech via aria-hidden on the portal
 * sibling.
 */
export function QuickView({ product, open, onClose, initialView = 'detail' }: QuickViewProps) {
  const tCommon = useTranslations('common');
  const reduce = useReducedMotion();

  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  const [view, setView] = useState<View>(initialView);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

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

  // A fresh open always starts at the view its trigger asked for, and always
  // drops any order left over from a previous visit — reopening the dialog
  // must never show a stale confirmation from an earlier session.
  useEffect(() => {
    if (open) {
      setView(initialView);
      setConfirmedOrder(null);
    }
  }, [open, initialView]);

  // Switching views WITHIN an already-open dialog (detail's own order button,
  // or a successful checkout submit) needs its own focus move: the element
  // that was focused a moment ago may no longer exist in the new view, and an
  // unfocused body is a silently lost place for a screen reader user. Every
  // view renders its own heading at `titleId`, so that's always a safe,
  // present target. `tabIndex={-1}` is what makes a heading programmatically
  // focusable without joining the normal Tab order.
  //
  // Guarded to skip the INITIAL open: that moment already belongs to the
  // effect above, which sends focus to the dialog's first focusable control
  // (the close button) rather than its heading, and the two would otherwise
  // both fire on mount and fight over where focus lands. `wasOpen` is what
  // tells the difference between "just opened" and "already open, view
  // changed" without changing what a fresh open does.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && wasOpen.current) {
      dialogRef.current?.scrollTo({ top: 0 });
      const heading = document.getElementById(titleId);
      heading?.setAttribute('tabindex', '-1');
      heading?.focus();
    }
    wasOpen.current = open;
  }, [view, open, titleId]);

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

            {view === 'confirmed' && confirmedOrder ? (
              <div className="p-6 sm:p-10">
                <OrderConfirmation order={confirmedOrder} titleId={titleId} />
              </div>
            ) : (
              <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-2 md:gap-12">
                {view === 'detail' ? (
                  <ProductDetailView
                    product={product}
                    titleId={titleId}
                    onOrder={() => setView('checkout')}
                  />
                ) : (
                  <CheckoutView
                    product={product}
                    titleId={titleId}
                    onSubmit={(order) => {
                      setConfirmedOrder(order);
                      setView('confirmed');
                    }}
                  />
                )}
              </div>
            )}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
