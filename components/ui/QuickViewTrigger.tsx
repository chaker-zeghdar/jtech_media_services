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
 * The only interactive part of a product card, split out as its own island.
 *
 * <ProductCard /> is a server component: its markup, hover choreography and
 * order link are all static HTML and CSS. Keeping the whole card a client
 * component meant React hydrated ~24 full card trees on load for the sake of one
 * boolean each. Now only the cards that actually offer quick view ship JS, and
 * what they ship is a button.
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
          {label}
        </span>
      </button>

      {mounted ? (
        <QuickView product={product} open={open} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
