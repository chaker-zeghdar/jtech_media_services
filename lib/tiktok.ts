/**
 * The TikTok Pixel — the one module that knows how to talk to `window.ttq`.
 *
 * Every call goes through here rather than touching `window.ttq` at the call
 * sites, for two reasons that both showed up while wiring this:
 *
 *  1. The pixel loads asynchronously, so a naked `window.ttq?.track(…)` in a
 *     mount effect silently drops the event when the effect wins the race.
 *     `withPixel` waits it out instead of guessing (see below).
 *  2. `ViewContent` and `Purchase` have to agree on `content_id` or TikTok
 *     cannot tie a view to the order it produced. One `tiktokContent()` helper
 *     makes that agreement structural instead of a convention two files
 *     remember to follow.
 */

/**
 * What the base snippet actually leaves on `window`.
 *
 * Before the remote SDK arrives this is a plain ARRAY that the snippet's
 * `setAndDefer` has hung `page`/`track`/… onto: each call pushes its arguments
 * onto the array, and `events.js` drains the backlog once it loads. So a call
 * made "too early" is queued rather than lost — the only genuinely unsafe
 * moment is before the inline snippet has run at all.
 */
type TiktokQueue = {
  page: () => void;
  track: (event: string, params?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    ttq?: TiktokQueue;
  }
}

/**
 * Empty in local development, and in any deploy where the client hasn't
 * supplied an id yet. Everything in this module is a no-op when it is empty and
 * `<TikTokPixel />` renders nothing at all, so an unset id costs nothing and
 * warns about nothing — there is no "half-installed" state to reason about.
 *
 * `NEXT_PUBLIC_` because the pixel runs in the browser. Next inlines these at
 * BUILD time, so setting it in Vercel takes a redeploy, not just a restart.
 */
export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? '';

/** Every price in this store is dinars, and it deals in nothing else. */
export const TIKTOK_CURRENCY = 'DZD';

const RETRY_MS = 200;
const GIVE_UP_MS = 5_000;

/**
 * Runs `fn` against the pixel as soon as it exists, or gives up quietly.
 *
 * `strategy="afterInteractive"` injects the base snippet around hydration, and
 * a component's mount effect can land on either side of that — which is exactly
 * the case that matters, because the product page's `ViewContent` fires from a
 * mount effect and is the event ads are optimised against. Optional chaining
 * alone would turn that race into a silently missing conversion signal, so this
 * retries on a short interval up to `GIVE_UP_MS` instead.
 *
 * Returns a cancel function so an effect can stop a pending retry on unmount —
 * without it, navigating away from a product page inside the retry window would
 * still report a view of the page the visitor had already left.
 */
function withPixel(fn: (ttq: TiktokQueue) => void): () => void {
  const noop = () => {};
  if (!TIKTOK_PIXEL_ID || typeof window === 'undefined') return noop;

  let timer: number | undefined;
  const deadline = Date.now() + GIVE_UP_MS;

  const attempt = () => {
    if (window.ttq) {
      fn(window.ttq);
      return;
    }
    if (Date.now() >= deadline) return;
    timer = window.setTimeout(attempt, RETRY_MS);
  };

  attempt();

  return () => {
    if (timer !== undefined) window.clearTimeout(timer);
  };
}

/** Fires a standard TikTok event. Returns a cancel function — see `withPixel`. */
export function trackTikTok(event: string, params: Record<string, unknown>): () => void {
  return withPixel((ttq) => ttq.track(event, params));
}

/** Fires a `PageView`. Returns a cancel function — see `withPixel`. */
export function pageViewTikTok(): () => void {
  return withPixel((ttq) => ttq.page());
}

/**
 * The product identity shared by `ViewContent` and `Purchase`.
 *
 * `content_id` is the SLUG, not a database id, for two reasons. The prosaic one
 * is that `Product` (content/schemas.ts) has no `id` field — the catalogue was
 * static until Phase 4 and never needed one, which is the same reason
 * `submitOrder` derives the product from its variant rather than being handed
 * an id.
 *
 * The load-bearing one is that the id has to be IDENTICAL across both events or
 * TikTok cannot match a view to the purchase it produced. A variant id would
 * not be: `ViewContent` fires for `primaryVariant()` on page load, and the
 * customer can switch colour or capacity before ordering, so the two events
 * would carry different ids for the same funnel. The slug is one product, one
 * id, whatever the visitor picks — and it is also what `orders.landing_slug`
 * records, so TikTok's reporting and the admin's own attribution line up.
 */
export function tiktokContent(product: { slug: string; name: string }) {
  return {
    content_id: product.slug,
    content_type: 'product',
    content_name: product.name,
  };
}
