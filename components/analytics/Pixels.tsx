'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { META_PIXEL_ID, TIKTOK_PIXEL_ID, trackPageView } from '@/lib/pixels';

/**
 * The TikTok and Meta base pixels, plus the `PageView` this app would otherwise
 * only report once per hard load.
 *
 * Was `<TikTokPixel />`. The two vendors need the same script tag treatment and
 * the same route-change handling, so they share one component and — crucially —
 * ONE pathname effect rather than two that could drift apart.
 *
 * ── Why a PageView effect at all ────────────────────────────────────────────
 *
 * Each snippet reports its own page as it runs, and `next/script` executes a
 * given `id` once per document. In the App Router the storefront layout is not
 * torn down between routes, so every client-side navigation after the first — a
 * header link, a product card, the locale switcher — would go uncounted. This
 * effect covers those, for both vendors at once.
 *
 * It deliberately SKIPS its own first run: on the initial load the snippets have
 * already reported that page, and firing again here would count every landing
 * twice. `useRef` rather than comparing pathnames, because a real navigation
 * back to the same path is a real second view.
 *
 * ── Storefront only ─────────────────────────────────────────────────────────
 *
 * Rendered from `app/(storefront)/[locale]/layout.tsx`. The admin panel has its
 * own root layout and deliberately does not get this: the shop's staff editing
 * products are not an audience to measure, and their sessions would pollute the
 * numbers the ad accounts optimise against.
 *
 * Each vendor is independent — one configured and the other not is a normal,
 * fully-working state.
 */
export function Pixels() {
  const pathname = usePathname();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    return trackPageView();
  }, [pathname]);

  return (
    <>
      {TIKTOK_PIXEL_ID ? (
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
      ) : null}

      {META_PIXEL_ID ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {/* Meta's own snippet, same treatment as TikTok's above. */}
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', ${JSON.stringify(META_PIXEL_ID)});
              fbq('track', 'PageView');
            `}
          </Script>

          {/* Meta's no-JavaScript fallback. This is a client component, but
              client components are still server-RENDERED, so the tag is in the
              initial HTML — which is the only place it could ever do its job. */}
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element --
                next/image is the one thing that cannot work here: this is the
                NO-JavaScript fallback, and <Image /> renders markup that needs
                JavaScript to resolve. A 1x1 beacon also has no LCP or bandwidth
                to optimise, which is what the rule is guarding. */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${encodeURIComponent(META_PIXEL_ID)}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      ) : null}
    </>
  );
}
