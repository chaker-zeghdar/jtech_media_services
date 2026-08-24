'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { Product } from '@/content/schemas';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

/**
 * Loaded on first click only. This is what keeps Framer Motion out of the
 * initial bundle while still using it for the interaction it's good at.
 */
const QuickView = dynamic(() => import('./QuickView').then((module) => module.QuickView), {
  ssr: false,
});

type ProductDialogTriggerProps = {
  product: Product;
  /** Pre-resolved on the server so this island needs no locale lookup. */
  learnMoreLabel: string;
  learnMoreAriaLabel: string;
  orderLabel: string;
  orderAriaLabel: string;
};

const LINK_CLASS =
  'group/link inline-flex items-center gap-1.5 text-sm font-semibold leading-none text-gold-text transition-colors duration-200 ease-brand hover:text-ink';

const CHEVRON_CLASS = cn(
  'rtl:-scale-x-100',
  'transition-transform duration-200 ease-brand',
  'ltr:group-hover/link:translate-x-[3px] rtl:group-hover/link:-translate-x-[3px]',
);

/**
 * The card's two text links — "learn more" and "order" — and the single
 * `<QuickView />` dialog behind both of them.
 *
 * Was `QuickViewTrigger`, one button and one dialog mount for "learn more"
 * only; "order" was a plain `<Button href={whatsappLink(...)}>` living
 * separately in `<ProductCard />`. The checkout pass needed "order" to open
 * the SAME dialog, straight to its checkout view, so the two triggers were
 * merged into this one client island: one `open`/`view` state, one mounted
 * `<QuickView />`, two buttons that set `initialView` differently before
 * opening it. Two thin buttons over one shared dialog component, not two
 * dialog implementations.
 *
 * `<ProductCard />` is a server component: its markup and its whole hover
 * choreography are static HTML and CSS. This island is the two links plus
 * the lazy dialog, so a card costs one small hydration boundary rather than a
 * hydrated card tree.
 */
export function ProductDialogTrigger({
  product,
  learnMoreLabel,
  learnMoreAriaLabel,
  orderLabel,
  orderAriaLabel,
}: ProductDialogTriggerProps) {
  const [open, setOpen] = useState(false);
  // Keeps QuickView (and Framer Motion) unmounted until the first open.
  const [mounted, setMounted] = useState(false);
  const [initialView, setInitialView] = useState<'detail' | 'checkout'>('detail');

  const openAt = (view: 'detail' | 'checkout') => {
    setMounted(true);
    setInitialView(view);
    setOpen(true);
  };

  return (
    <>
      <button type="button" onClick={() => openAt('detail')} aria-label={learnMoreAriaLabel} className={LINK_CLASS}>
        {learnMoreLabel}
        <Icon name="chevron" size={16} className={CHEVRON_CLASS} />
      </button>

      <button type="button" onClick={() => openAt('checkout')} aria-label={orderAriaLabel} className={LINK_CLASS}>
        {orderLabel}
        <Icon name="chevron" size={16} className={CHEVRON_CLASS} />
      </button>

      {mounted ? (
        <QuickView product={product} open={open} initialView={initialView} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
