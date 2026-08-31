'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { Product } from '@/content/schemas';
import { Button } from './Button';
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
  /**
   * Pre-resolved on the server so this island needs no locale lookup. The
   * detail trigger is icon-only, so this label is its ONLY accessible name —
   * it is not a redundant description of visible text.
   */
  learnMoreAriaLabel: string;
  orderLabel: string;
  orderAriaLabel: string;
};

/**
 * Matches `<Carousel />`'s arrow buttons rather than inventing a fourth circular
 * treatment: same 36px disc, same gray-300 border, same invert-to-ink hover.
 */
const DETAIL_CLASS =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-700 ' +
  'transition-[background-color,border-color,color] duration-200 ease-brand ' +
  'hover:border-ink hover:bg-ink hover:text-white ' +
  /* The whole card opens quick view, not just this 36px disc.
  
     A stretched pseudo-element rather than an onClick on the card: <ProductCard />
     is a server component whose markup and entire hover choreography are static
     HTML and CSS, and putting a handler on it would hydrate the whole card tree
     to win a click this ::after gets for free. It also keeps the accessibility
     tree honest — one real, focusable, labelled button, instead of a clickable
     <div> wrapping the very buttons it would swallow.
  
     `inset-0` resolves against `<article className="group relative">`, the
     nearest positioned ancestor, since nothing between here and it is
     positioned. Coming last in DOM order, it paints over the image bed without
     needing a z-index of its own.
  
     Nothing to stopPropagation: the order button sits ABOVE this layer rather
     than inside it, so a click there never reaches it — there is no bubbling to
     intercept, and no way for one click to fire both. */
  "after:absolute after:inset-0 after:content-['']";

/**
 * The card's filled order button, the small detail affordance beside it, and the
 * single `<QuickView />` dialog behind both.
 *
 * Both used to be identically-styled text links. They are now a primary and a
 * secondary: a filled `<Button />` for ordering, and a 36px icon button for the
 * detail view — see `<ProductCard />`'s doc comment for why that hierarchy
 * changed. The `expand` glyph is the one already drawn for "open larger", which
 * is exactly what this does.
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
      {/* Order first in the DOM, so Tab reaches the primary action before the
          secondary one. It is also first visually in both scripts — the row is
          laid out with logical properties, so it mirrors under Arabic. */}
      <div className="flex w-full items-center gap-2">
        {/* `relative z-10` lifts this above the quick-view overlay described in
            DETAIL_CLASS, which covers the rest of the card. That stacking IS
            the separation: the overlay never receives this button's clicks, so
            ordering stays a single, unambiguous action with no handler
            juggling. Its own hit area is exactly what it was. */}
        <Button
          type="button"
          onClick={() => openAt('checkout')}
          ariaLabel={orderAriaLabel}
          size="sm"
          className="relative z-10 flex-1"
        >
          {orderLabel}
        </Button>

        <button
          type="button"
          onClick={() => openAt('detail')}
          aria-label={learnMoreAriaLabel}
          className={DETAIL_CLASS}
        >
          <Icon name="expand" size={16} />
        </button>
      </div>

      {mounted ? (
        <QuickView product={product} open={open} initialView={initialView} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
