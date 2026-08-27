'use client';

import { useState } from 'react';
import type { Product } from '@/content/schemas';
import { CheckoutView, type ConfirmedOrder } from './CheckoutView';
import { OrderConfirmation } from './OrderConfirmation';

/**
 * The order section of `/products/[slug]` — the checkout form, and the
 * confirmation that replaces it once an order goes through.
 *
 * This exists because `<CheckoutView />` takes an `onSubmit` CALLBACK, and a
 * function cannot be passed from a server component to a client one. The page
 * is a server component, so something client-side has to own that callback and
 * the state it writes to. `<QuickView />` plays this role for the dialog; this
 * is the same job without the dialog shell — no portal, no focus trap, no
 * `aria-modal`, because the form is simply the next section down the page.
 *
 * Swapping the form for the confirmation in place, rather than navigating to a
 * separate thank-you route, keeps the order id and the summary on screen
 * without a second page load — and means a refresh can't re-submit anything.
 */
export function ProductPageOrder({ product, slug }: { product: Product; slug: string }) {
  const [confirmed, setConfirmed] = useState<ConfirmedOrder | null>(null);

  if (confirmed) return <OrderConfirmation order={confirmed} titleId="order-form-title" />;

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <CheckoutView
        product={product}
        titleId="order-form-title"
        onSubmit={setConfirmed}
        /* Attribution: an order placed here is traceable to the page the ad
           pointed at. The dialog passes nothing and records null. */
        landingSlug={slug}
      />
    </div>
  );
}
