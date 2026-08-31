'use client';

import { useEffect } from 'react';
import { trackViewContent } from '@/lib/pixels';

/**
 * Reports a `ViewContent` — to every configured pixel — for the product page it
 * is rendered on.
 *
 * Was `<TikTokViewContent />`; renamed because it is no longer about one vendor.
 * Renders nothing. It exists because `/products/[slug]` is a server component
 * and a pixel call has to happen in the browser — this is the smallest possible
 * client boundary around that one fact.
 *
 * Takes primitives rather than the whole `Product`: only three fields are used,
 * and handing a server component's full product object across the boundary
 * would serialise every variant, spec and image URL into the RSC payload for
 * nothing. It also makes the dependency array honest — a `Product` object is a
 * fresh reference on every render and would re-fire this on each one, where
 * these three re-fire it exactly when the product genuinely changes (which is
 * what should happen on a client-side navigation from one product to another).
 */
export function ProductViewContent({
  slug,
  name,
  price,
}: {
  slug: string;
  name: string;
  price: number;
}) {
  useEffect(() => {
    // Returns the combined cancel function, so navigating away before a pixel
    // has loaded doesn't report a view of a page already left.
    return trackViewContent({ slug, name, value: price });
  }, [slug, name, price]);

  return null;
}
