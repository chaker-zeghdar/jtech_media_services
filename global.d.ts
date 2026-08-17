import type messages from './messages/ar.json';
import type { routing } from './i18n/routing';

/**
 * next-intl type augmentation.
 *
 * `Locale` makes useLocale()/getLocale() return the 'ar' | 'fr' | 'en' union
 * instead of a bare string, so no component needs a cast to read locale-keyed
 * content. `Messages` type-checks every t('…') key against the Arabic catalogue,
 * which is the default locale and therefore the source of truth for key shape —
 * a typo in a message key becomes a build error rather than a "key not found"
 * string rendered to a customer.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
