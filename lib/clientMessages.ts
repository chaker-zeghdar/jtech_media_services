import type { Messages } from 'next-intl';

/**
 * The message namespaces that reach the browser.
 *
 * Client components on this page are limited to chrome (nav, locale switcher,
 * carousel, product card, quick view), and those only need labels, a11y strings
 * and product copy. Section prose — hero, why, services, delivery, footer — is
 * rendered on the server and never serialised into the RSC payload, which keeps
 * the client message catalogue at roughly a tenth of the full file.
 *
 * `IntlConfig.messages` is typed `DeepPartial<Messages>`, so this narrowing is
 * checked rather than cast: adding a namespace here is safe, and a client
 * component reaching for a namespace that isn't listed fails at build.
 */
export function clientMessages(all: Messages) {
  return {
    common: all.common,
    a11y: all.a11y,
    badges: all.badges,
    stock: all.stock,
    nav: all.nav,
    product: all.product,
    locale: all.locale,
  };
}
