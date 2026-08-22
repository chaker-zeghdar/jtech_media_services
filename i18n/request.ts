import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import arMessages from '../messages/ar.json';
import enMessages from '../messages/en.json';
import frMessages from '../messages/fr.json';
import { routing } from './routing';

const messages = {
  ar: arMessages,
  en: enMessages,
  fr: frMessages,
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: messages[locale],
    // Algeria is UTC+1 year-round. Pinning it keeps opening-hours copy and any
    // future date formatting stable regardless of where the server runs.
    timeZone: 'Africa/Algiers',
  };
});
