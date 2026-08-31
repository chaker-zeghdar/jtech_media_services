/**
 * The ad pixels — TikTok and Meta — behind one set of calls.
 *
 * Was `lib/tiktok.ts`. Meta needs the same three events at the same three
 * moments, and the honest way to say that is one `trackPurchase()` that knows
 * which vendors care, not two parallel stacks a caller has to remember to call
 * in pairs. A fourth event, or a third pixel, is an edit here rather than an
 * edit here and a matching one somewhere else that is easy to skip — which is
 * exactly how <ProductFacts /> and the product gallery each went missing from
 * one of their two surfaces earlier in this phase.
 *
 * Every call is a no-op for a vendor whose id is unset, independently: TikTok
 * configured and Meta not is a normal, fully-working state.
 */

/** TikTok's global is an ARRAY with methods hung off it. See `<Pixels />`. */
type TiktokQueue = {
  page: () => void;
  track: (event: string, params?: Record<string, unknown>) => void;
};

/**
 * Meta's is a FUNCTION — `fbq('track', 'Purchase', {…})` — not an object, so it
 * cannot share TikTok's shape. Typed loosely on purpose: `init` takes an id,
 * `track` takes an event plus params, and a union that spelled both out would
 * be more ceremony than a two-call surface earns.
 */
type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    ttq?: TiktokQueue;
    fbq?: Fbq;
  }
}

/**
 * Unset is the normal local-dev state and the normal state for a vendor the
 * client hasn't signed up with. Nothing renders, nothing queues, nothing warns.
 *
 * `NEXT_PUBLIC_` because these run in the browser. Next inlines them at BUILD
 * time, so setting one in Vercel takes a redeploy, not just a restart.
 */
export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? '';
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '';

/** Every price in this store is dinars, and it deals in nothing else. */
export const PIXEL_CURRENCY = 'DZD';

const RETRY_MS = 200;
const GIVE_UP_MS = 5_000;
const NOOP = () => {};

/**
 * Runs `fire` once `isReady()` says the vendor's global exists, or gives up.
 *
 * `strategy="afterInteractive"` injects the base snippets around hydration, and
 * a component's mount effect can land on either side of that — which is exactly
 * the case that matters, because `ViewContent` fires from a mount effect on the
 * page ads point at. Optional chaining alone would turn that race into a
 * silently missing conversion signal, so this retries on a short interval up to
 * `GIVE_UP_MS`.
 *
 * Note this waits for the STUB, not for the vendor's real SDK: both snippets
 * define a queueing stub synchronously, so a call made before the network
 * request finishes is queued and drained later rather than lost.
 *
 * Returns a cancel function so an effect can drop a pending retry on unmount —
 * without it, navigating away from a product page inside the retry window would
 * still report a view of the page the visitor had already left.
 */
function whenReady(isReady: () => boolean, fire: () => void): () => void {
  if (typeof window === 'undefined') return NOOP;

  let timer: number | undefined;
  const deadline = Date.now() + GIVE_UP_MS;

  const attempt = () => {
    if (isReady()) {
      fire();
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

function tiktok(fire: (ttq: TiktokQueue) => void): () => void {
  if (!TIKTOK_PIXEL_ID) return NOOP;
  return whenReady(
    () => Boolean(window.ttq),
    () => fire(window.ttq!),
  );
}

function meta(fire: (fbq: Fbq) => void): () => void {
  if (!META_PIXEL_ID) return NOOP;
  return whenReady(
    () => Boolean(window.fbq),
    () => fire(window.fbq!),
  );
}

/** One cancel function for however many vendors were actually armed. */
function cancelAll(...cancels: (() => void)[]): () => void {
  return () => {
    for (const cancel of cancels) cancel();
  };
}

/**
 * The product identity every event carries.
 *
 * It is the SLUG, not a database id, for two reasons. The prosaic one is that
 * `Product` (content/schemas.ts) has no `id` field — the catalogue was static
 * until Phase 4 and never needed one, which is the same reason `submitOrder`
 * derives the product from its variant rather than being handed an id.
 *
 * The load-bearing one is that the id has to be IDENTICAL across `ViewContent`
 * and `Purchase` or neither platform can match a view to the purchase it
 * produced. A variant id would not be: `ViewContent` fires for the primary
 * variant, and the customer can switch colour or capacity before ordering, so
 * the two events would carry different ids for the same funnel. The slug is one
 * product, one id, whatever the visitor picks — and it is what
 * `orders.landing_slug` records, so the platforms' reporting and the admin's
 * own attribution line up.
 *
 * Meta wants `content_ids` as an ARRAY where TikTok wants a single
 * `content_id`; the VALUE is the same either way, which is what matters, and
 * matching Meta's convention here is what a Dynamic Ads catalogue feed will
 * expect later.
 */
type ProductEvent = {
  slug: string;
  name: string;
  /** Always the server's number for `Purchase`; the listed price for a view. */
  value: number;
  quantity?: number;
};

export function trackPageView(): () => void {
  return cancelAll(
    tiktok((ttq) => ttq.page()),
    meta((fbq) => fbq('track', 'PageView')),
  );
}

export function trackViewContent({ slug, name, value }: ProductEvent): () => void {
  return cancelAll(
    tiktok((ttq) =>
      ttq.track('ViewContent', {
        content_id: slug,
        content_type: 'product',
        content_name: name,
        value,
        currency: PIXEL_CURRENCY,
      }),
    ),
    meta((fbq) =>
      fbq('track', 'ViewContent', {
        content_ids: [slug],
        content_type: 'product',
        content_name: name,
        value,
        currency: PIXEL_CURRENCY,
      }),
    ),
  );
}

export function trackPurchase({ slug, name, value, quantity }: ProductEvent): () => void {
  return cancelAll(
    tiktok((ttq) =>
      ttq.track('Purchase', {
        content_id: slug,
        content_type: 'product',
        content_name: name,
        quantity,
        value,
        currency: PIXEL_CURRENCY,
      }),
    ),
    meta((fbq) =>
      fbq('track', 'Purchase', {
        content_ids: [slug],
        content_type: 'product',
        content_name: name,
        quantity,
        value,
        currency: PIXEL_CURRENCY,
      }),
    ),
  );
}
