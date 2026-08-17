import { CONTACT } from './contact';
import { type Settings, parseContent, settingsSchema } from './schemas';

/**
 * Mirrors the single row of table `settings`.
 *
 * ⚠️ PLACEHOLDER CONTACT DETAILS ⚠️
 * Everything between the markers below is a stand-in until the client confirms.
 * `placeholderContacts` stays `true` while that is the case — flip it to `false`
 * once the real numbers are in, and nothing else needs to change.
 *
 * To swap them: edit this file for the address, hours, socials and delivery
 * figures, and `content/contact.ts` for the phone, WhatsApp and email. Those
 * four live there so client components can build `tel:`/`wa.me` links without
 * pulling zod into the browser bundle; they are spread in below, so this object
 * remains the single validated view of every setting.
 *
 * No component hardcodes a phone number, an address or a social handle.
 */
export const settings: Settings = parseContent('content/settings.ts', settingsSchema, {
  // ── PLACEHOLDER — replace with the client's real details ──────────────────
  ...CONTACT,
  address: {
    ar: 'شارع الاستقلال، وسط المدينة، باتنة 05000',
    fr: "Rue de l'Indépendance, Centre-ville, Batna 05000",
    en: 'Rue de l’Indépendance, Centre-ville, Batna 05000',
  },
  city: { ar: 'باتنة', fr: 'Batna', en: 'Batna' },
  hours: {
    weekdays: {
      ar: 'السبت — الخميس، 09:00 إلى 19:00',
      fr: 'Samedi — Jeudi, 09h00 à 19h00',
      en: 'Saturday — Thursday, 09:00 to 19:00',
    },
    closed: {
      ar: 'الجمعة مغلق',
      fr: 'Fermé le vendredi',
      en: 'Closed on Friday',
    },
  },
  socials: {
    instagram: {
      handle: '@jtech_media_services',
      url: 'https://www.instagram.com/jtech_media_services/',
    },
    facebook: {
      handle: 'jtechmediaservices',
      url: 'https://www.facebook.com/jtechmediaservices',
    },
    tiktok: {
      handle: '@jtech_media_services',
      url: 'https://www.tiktok.com/@jtech_media_services',
    },
  },
  // ── END PLACEHOLDER ──────────────────────────────────────────────────────

  delivery: {
    deskFee: 350,
    homeFee: 600,
    confirmationHours: 24,
    wilayaCount: 58,
  },

  // OpenStreetMap: keyless, script-free, and costs nothing on the perf budget.
  mapEmbedUrl:
    'https://www.openstreetmap.org/export/embed.html?bbox=6.166%2C35.548%2C6.192%2C35.564&layer=mapnik&marker=35.5559%2C6.1790',
  mapLinkUrl: 'https://www.openstreetmap.org/?mlat=35.5559&mlon=6.1790#map=16/35.5559/6.1790',

  placeholderContacts: true,
});

/**
 * Re-exported so server components can keep a single import from `settings`.
 * Client components must import these from `content/contact` directly — see the
 * note at the top of that file.
 */
export { CONTACT, mailLink, telLink, whatsappLink, whatsappNumber } from './contact';
