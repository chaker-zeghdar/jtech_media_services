/**
 * Lives in lib/ rather than beside the layout that first needed it: Next allows
 * only a fixed set of exports from a `layout.tsx` (default, metadata,
 * generateMetadata, …), so exporting a helper from one is a type error. Both
 * the root layout and `/products/[slug]` build absolute URLs from this.
 */
/**
 * Absolute origin for canonical and hreflang tags — Google ignores relative
 * hreflang values, so this has to resolve to a real host.
 *
 * Set NEXT_PUBLIC_SITE_URL once the domain is confirmed. On Vercel preview and
 * production deploys the platform-provided host is used automatically; the
 * literal is only the local-development fallback.
 */
export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    try {
      return new URL(/^https?:\/\//i.test(configured) ? configured : `https://${configured}`);
    } catch {
      // Fall through to the Vercel-provided URL or the production fallback.
    }
  }

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (vercel) {
    try {
      return new URL(/^https?:\/\//i.test(vercel) ? vercel : `https://${vercel}`);
    } catch {
      // Fall through to the production fallback.
    }
  }

  return new URL('https://jtech-dz.com');
}
