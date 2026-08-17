import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    // Algeria is UTC+1 year-round. Pinning it keeps opening-hours copy and any
    // future date formatting stable regardless of where the server runs.
    timeZone: 'Africa/Algiers',
  };
});
