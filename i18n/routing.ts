import { defineRouting } from 'next-intl/routing';

export const locales = ['ar', 'fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar';

/** Writing direction per locale — consumed by the root layout's <html dir>. */
export const localeDirections: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  fr: 'ltr',
  en: 'ltr',
};

/** Label shown in the language switcher, always written in its own language. */
export const localeLabels: Record<Locale, string> = {
  ar: 'العربية',
  fr: 'Français',
  en: 'English',
};

/** BCP-47 tags for <html lang> and Intl formatting. */
export const localeTags: Record<Locale, string> = {
  ar: 'ar-DZ',
  fr: 'fr-DZ',
  en: 'en',
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Arabic is served from `/` with no prefix; `/fr` and `/en` are prefixed.
  localePrefix: 'as-needed',
  // The client's audience is Algerian; don't let a French browser in Paris
  // silently redirect away from the Arabic default.
  localeDetection: false,
});
