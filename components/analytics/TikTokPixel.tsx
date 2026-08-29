'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { TIKTOK_PIXEL_ID, pageViewTikTok } from '@/lib/tiktok';

/**
 * The TikTok base pixel, plus the `PageView` this app would otherwise only
 * report once per hard load.
 *
 * ── Why a PageView effect at all ────────────────────────────────────────────
 *
 * The snippet's own `ttq.page()` runs exactly when the snippet runs, and
 * `next/script` executes a given `id` once per document. In the App Router the
 * storefront layout is not torn down between routes, so every client-side
 * navigation after the first — a header link, a product card, the locale
 * switcher — would go uncounted. This effect covers those.
 *
 * It deliberately SKIPS its own first run: on the initial load the snippet has
 * already reported that page, and firing again here would count every landing
 * twice. `useRef` rather than comparing pathnames, because a real navigation
 * back to the same path is a real second view.
 *
 * ── Storefront only ─────────────────────────────────────────────────────────
 *
 * Rendered from `app/(storefront)/[locale]/layout.tsx`. The admin panel has its
 * own root layout and deliberately does not get this: the shop's staff editing
 * products are not an audience to measure, and their sessions would pollute the
 * numbers the ad account optimises against.
 */
export function TikTokPixel() {
  const pathname = usePathname();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    return pageViewTikTok();
  }, [pathname]);

  // No id configured — render nothing rather than a script that loads an empty
  // pixel. Local development and any un-configured deploy behave exactly as
  // they did before this file existed.
  if (!TIKTOK_PIXEL_ID) return null;

  return (
    <Script id="tiktok-pixel" strategy="afterInteractive">
      {/* TikTok's own snippet, verbatim apart from the id, which goes in via
          JSON.stringify so the value can never break out of the string
          literal. */}
      {`
        !function (w, d, t) {
          w.TiktokAnalyticsObject = t;
          var ttq = w[t] = w[t] || [];
          ttq.methods = ["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
          ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } };
          for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
          ttq.load = function (e, n) {
            var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
            ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i;
            ttq._t = ttq._t || {}; ttq._t[e] = +new Date;
            ttq._o = ttq._o || {}; ttq._o[e] = n || {};
            var o = document.createElement("script");
            o.type = "text/javascript"; o.async = !0; o.src = i + "?sdkid=" + e + "&lib=" + t;
            var a = document.getElementsByTagName("script")[0];
            a.parentNode.insertBefore(o, a);
          };
          ttq.load(${JSON.stringify(TIKTOK_PIXEL_ID)});
          ttq.page();
        }(window, document, 'ttq');
      `}
    </Script>
  );
}
