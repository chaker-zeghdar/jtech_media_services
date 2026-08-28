import { CONTACT } from './contact';
import { type Settings, parseContent, settingsSchema } from './schemas';

/**
 * Mirrors the single row of table `settings`.
 *
 * These are the client's REAL details, taken from their own marketing posts.
 *
 * To change contact details: edit this file for the address, hours, socials,
 * departments and delivery figures, and `content/contact.ts` for the primary
 * phone and WhatsApp number. Those live there so client components can build
 * `tel:`/`wa.me` links without pulling zod into the browser bundle; they are
 * spread in below, so this object remains the single validated view.
 *
 * No component hardcodes a phone number, an address or a social handle.
 */
export const settings: Settings = parseContent('content/settings.ts', settingsSchema, {
  ...CONTACT,

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
      key: 'repair',
      phone: '0773 34 51 20',
      phoneE164: '+213773345120',
      label: {
        ar: 'خدمة التصليح',
        fr: 'Service Réparation',
        en: 'Repair Service',
      },
    },
    {
      key: 'advertising',
      phone: '0792 00 86 88',
      phoneE164: '+213792008688',
      label: {
        ar: 'سبونسور وتعبئة الرصيد',
        fr: 'Sponsor et Recharge',
        en: 'Sponsoring and e-recharge',
      },
    },
  ],

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
    wilayaCount: 69,
  },

  /**
   * OpenStreetMap: keyless, script-free, no cookie banner.
   *
   * The client sent their real Google Maps pin (an Instagram-wrapped short link
   * resolving to `https://maps.app.goo.gl/kgLmTN8XbFRD7Gnz8`, place id
   * `0x12f4113c29e6bef7:0x1fe94c4cd9122ea5`), whose query string — "Jtech media
   * services, cité frères Lombarkia, en face CHU, Batna" — matches the written
   * `address` above ("opposite the university hospital"). The pin itself encodes
   * a Plus Code (`8F78G5PR+4CV`), decoded with Google's own open-source
   * `openlocationcode` algorithm to 35.535363, 6.191047. The bbox/marker below
   * are centred on that confirmed point, replacing the earlier CHU-district
   * approximation.
   */
  mapEmbedUrl:
    'https://www.openstreetmap.org/export/embed.html?bbox=6.175047%2C35.525363%2C6.207047%2C35.545363&layer=mapnik&marker=35.535363%2C6.191047',
  /**
   * The client's own Google Maps link, stripped of the Instagram redirect and
   * tracking params (utm_*, fbclid, g_st) it arrived wrapped in.
   */
  mapLinkUrl: 'https://maps.app.goo.gl/kgLmTN8XbFRD7Gnz8',
  mapPinConfirmed: true,
});

/**
 * Re-exported so server components can keep a single import from `settings`.
 * Client components must import these from `content/contact` directly — see the
 * note at the top of that file.
 */
export { CONTACT, telHref, telLink, whatsappLink, whatsappNumber } from './contact';

/** The orders line — the only department that takes product enquiries. */
export function ordersDepartment() {
  const [first] = settings.departments;
  if (!first) throw new Error('settings.departments is empty');
  return first;
}
