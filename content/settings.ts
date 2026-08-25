import { CONTACT } from './contact';
import { type Settings, parseContent, settingsSchema } from './schemas';

/**
 * Mirrors the single row of table `settings`.
 *
 * These are the client's REAL details, taken from their own marketing posts.
 * Two items remain unconfirmed and are flagged in the data rather than assumed:
 *
 *   emailConfirmed  — the address is inferred from the domain, not stated.
 *   mapPinConfirmed — the written address is confirmed, the lat/long is not.
 *                     See the note above `mapEmbedUrl`.
 *
 * To change contact details: edit this file for the address, hours, socials,
 * departments and delivery figures, and `content/contact.ts` for the primary
 * phone, WhatsApp and email. Those four live there so client components can build
 * `tel:`/`wa.me` links without pulling zod into the browser bundle; they are
 * spread in below, so this object remains the single validated view.
 *
 * No component hardcodes a phone number, an address or a social handle.
 */
export const settings: Settings = parseContent('content/settings.ts', settingsSchema, {
  ...CONTACT,
  emailConfirmed: false,

  /**
   * Three staffed lines, and they are NOT interchangeable — the orders line is
   * the only one that takes product enquiries, and it's the only one on WhatsApp.
   * Ordered: the first entry is the primary/orders line and matches CONTACT.
   */
  departments: [
    {
      key: 'orders',
      phone: '0659 39 13 13',
      phoneE164: '+213659391313',
      label: {
        ar: 'الطلبات وواتساب',
        fr: 'Commandes et WhatsApp',
        en: 'Orders and WhatsApp',
      },
    },
    {
      key: 'branding',
      phone: '0782 76 30 40',
      phoneE164: '+213782763040',
      label: {
        ar: 'الهوية البصرية، المواقع والتطبيقات',
        fr: 'Branding, sites web et applications',
        en: 'Branding, web and app services',
      },
    },
    {
      key: 'advertising',
      phone: '0792 00 86 88',
      phoneE164: '+213792008688',
      label: {
        ar: 'الإعلانات الممولة والتعبئة الإلكترونية',
        fr: 'Publicité et recharge électronique',
        en: 'Advertising and e-recharge',
      },
    },
  ],

  website: {
    label: 'www.jtechmediaservice.com',
    url: 'https://www.jtechmediaservice.com',
  },

  foundedYear: 2013,

  socialProof: {
    facebook: 50000,
    instagram: 160000,
    tiktok: 56000,
    buyers: 5000,
  },

  address: {
    ar: 'باتنة، مقابل المستشفى الجامعي، الطريق المؤدي إلى الأمن الحضري العاشر',
    fr: 'Batna, face au CHU, route menant à la 10e sûreté urbaine',
    en: 'Batna, opposite the university hospital, on the road to the 10th urban security post',
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

  delivery: {
    deskFee: 350,
    homeFee: 600,
    confirmationHours: 24,
    wilayaCount: 58,
  },

  /**
   * OpenStreetMap: keyless, script-free, no cookie banner.
   *
   * ⚠️ The bounding box and marker below are centred on the university-hospital
   * district of Batna, which is where the written address puts the shop — but the
   * exact coordinates were NOT supplied and are an approximation. `mapPinConfirmed`
   * is false until the client sends a pin or the shop is located on the map.
   *
   * Because of that, `mapLinkUrl` deliberately opens a SEARCH for the landmark
   * rather than a fixed lat/long: a search lands the customer at the right place
   * even while the embedded marker is approximate.
   */
  mapEmbedUrl:
    'https://www.openstreetmap.org/export/embed.html?bbox=6.1596%2C35.5386%2C6.1916%2C35.5586&layer=mapnik&marker=35.5486%2C6.1756',
  mapLinkUrl: 'https://www.openstreetmap.org/search?query=CHU%20Batna',
  mapPinConfirmed: false,
});

/**
 * Re-exported so server components can keep a single import from `settings`.
 * Client components must import these from `content/contact` directly — see the
 * note at the top of that file.
 */
export { CONTACT, mailLink, telHref, telLink, whatsappLink, whatsappNumber } from './contact';

/** The orders line — the only department that takes product enquiries. */
export function ordersDepartment() {
  const [first] = settings.departments;
  if (!first) throw new Error('settings.departments is empty');
  return first;
}
