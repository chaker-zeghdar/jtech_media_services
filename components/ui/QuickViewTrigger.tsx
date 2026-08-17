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

type QuickViewTriggerProps = {
  product: Product;
  /** Pre-resolved on the server so this island needs no locale lookup. */
  label: string;
  ariaLabel: string;
};

/**
 * The "learn more" link on a product card, and the only interactive part of it.
 *
 * <ProductCard /> is a server component: its markup and its whole hover
 * choreography are static HTML and CSS. This island is a single text link, so a
 * card costs one small hydration boundary rather than a hydrated card tree.
 *
 * Styled to match `Button`'s `link` tier exactly — gold-text on light surfaces
 * (the brand gold is 2.1:1 on white and can never be text) with the chevron
 * sliding 3px toward the inline end on hover.
 */
export function QuickViewTrigger({ product, label, ariaLabel }: QuickViewTriggerProps) {
  const [open, setOpen] = useState(false);
  // Keeps QuickView (and Framer Motion) unmounted until the first open.
  const [mounted, setMounted] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        aria-label={ariaLabel}
        className="group/link inline-flex items-center gap-1.5 text-sm font-semibold leading-none text-gold-text transition-colors duration-200 ease-brand hover:text-ink"
      >
        {label}
        <Icon
          name="chevron"
          size={16}
          className={cn(
            'rtl:-scale-x-100',
            'transition-transform duration-200 ease-brand',
            'ltr:group-hover/link:translate-x-[3px] rtl:group-hover/link:-translate-x-[3px]',
          )}
        />
      </button>

      {mounted ? (
        <QuickView product={product} open={open} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
