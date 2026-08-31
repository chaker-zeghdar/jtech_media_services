import type { Messages } from 'next-intl';

/**
 * The message namespaces that reach the browser.
 *
 * Client components on this page are limited to chrome (nav, locale switcher,
 * carousel, product card, quick view, checkout), and those only need labels,
 * a11y strings, product copy and now checkout copy. Section prose — hero, why,
 * services, delivery, footer — is rendered on the server and never serialised
 * into the RSC payload, which keeps the client message catalogue at roughly a
 * tenth of the full file.
 *
 * `IntlConfig.messages` is typed `DeepPartial<Messages>`, so this narrowing is
 * checked rather than cast: adding a namespace here is safe, and a client
 * component reaching for a namespace that isn't listed fails at build.
 *
 * `checkout` was the one real gap this list had. `<CheckoutView />` and
 * `<OrderConfirmation />` are both `'use client'`, and without this entry
 * `useTranslations('checkout')` silently fell back to raising
 * `MISSING_MESSAGE` at runtime — a build-time TYPE error was never possible
 * here, because this function narrows an object, not a set of keys a caller
 * declares up front. Caught by actually opening the checkout view in a
 * browser and reading the console, not by the type checker.
 *
 * `search` is the same gap, same shape: `<SearchForm />` is `'use client'`
 * too, and without this entry every placeholder and button label rendered as
 * the literal key (`"search.placeholder"`) instead of throwing — `t()` falls
 * back to the key string rather than erroring, which is what made this one
 * easy to miss until it actually rendered in a browser.
 */
export function clientMessages(all: Messages) {
  return {
    common: all.common,
    a11y: all.a11y,
    badges: all.badges,
    stock: all.stock,
    nav: all.nav,
    product: all.product,
    checkout: all.checkout,
    search: all.search,
    locale: all.locale,
  };
}
