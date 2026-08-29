'use client';

import { useEffect } from 'react';
import { TIKTOK_CURRENCY, tiktokContent, trackTikTok } from '@/lib/tiktok';

/**
 * Reports a `ViewContent` for the product page it is rendered on.
 *
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
export function TikTokViewContent({
  slug,
  name,
  price,
}: {
  slug: string;
  name: string;
  price: number;
}) {
  useEffect(() => {
    // Returns `withPixel`'s cancel function, so navigating away before the
    // pixel has loaded doesn't report a view of a page already left.
    return trackTikTok('ViewContent', {
      ...tiktokContent({ slug, name }),
      value: price,
      currency: TIKTOK_CURRENCY,
    });
  }, [slug, name, price]);

  return null;
}
