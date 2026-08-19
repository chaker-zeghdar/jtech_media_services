import { z } from 'zod';
import { locales } from '@/i18n/routing';

/**
 * Content schemas.
 *
 * These shapes mirror the Phase 2 Supabase tables one-to-one, so swapping the
 * data source is a change of *where* rows come from, not a refactor:
 *
 *   localizedText   → a `jsonb` column ({ar, fr, en})
 *   Product         → table `products`
 *   ProductVariant  → table `product_variants` (fk product_id), ordered by `position`
 *   Category        → table `categories`
 *   Service         → table `services`
 *   Wilaya          → table `wilayas`
 *   Settings        → table `settings` (single row)
 *
 * Every module in `content/` parses its own literal through the matching schema
 * at import time, so bad content fails the build rather than the page. In Phase 2
 * the same `.parse()` calls sit on the Supabase response instead.
 */

/* -------------------------------------------------------------------------- */
/*  Primitives                                                                */
/* -------------------------------------------------------------------------- */

/** A string that must exist in all three locales. */
export const localizedTextSchema = z.object({
  ar: z.string().min(1),
  fr: z.string().min(1),
  en: z.string().min(1),
});
export type LocalizedText = z.infer<typeof localizedTextSchema>;

/** Prices are DZD integers — never floats, never formatted strings. */
export const priceSchema = z.number().int().nonnegative();

export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase kebab-case');

export const hexColourSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'expected a #RRGGBB hex value');

/** Public path under /public, or null when the client hasn't sent the photo yet. */
export const imagePathSchema = z.string().startsWith('/');

/* -------------------------------------------------------------------------- */
/*  Enums                                                                     */
/* -------------------------------------------------------------------------- */

export const categorySlugSchema = z.enum(['iphone', 'samsung', 'android', 'pc', 'accessories']);
export type CategorySlug = z.infer<typeof categorySlugSchema>;

/** Drives <StockDot /> — the label text itself comes from the messages file. */
export const stockStatusSchema = z.enum(['in-stock', 'low-stock', 'out-of-stock']);
export type StockStatus = z.infer<typeof stockStatusSchema>;

/** Badge keys resolve to copy in messages under `badges.*`. */
export const badgeSchema = z.enum(['new', 'bestseller', 'promo', 'last-units', 'warranty']);
export type Badge = z.infer<typeof badgeSchema>;

/** Icon keys resolve to an inline SVG in components/ui/Icon.tsx. */
export const iconKeySchema = z.enum([
  'iphone',
  'samsung',
  'android',
  'laptop',
  'headphones',
  'wrench',
  'unlock',
  'download',
  'shield',
  'truck',
  'cash',
  'clock',
  'phone',
  'whatsapp',
  'mail',
  'pin',
  'instagram',
  'facebook',
  'tiktok',
  'camera',
  'chip',
  'battery',
  'screen',
]);
export type IconKey = z.infer<typeof iconKeySchema>;

/* -------------------------------------------------------------------------- */
/*  Products                                                                  */
/* -------------------------------------------------------------------------- */

/** A spec row: "الشاشة — 6.3 بوصة". Rendered in QuickView and on detail pages. */
export const productSpecSchema = z.object({
  key: slugSchema,
  label: localizedTextSchema,
  value: z.string().min(1),
});
export type ProductSpec = z.infer<typeof productSpecSchema>;

/**
 * A headline number for the dark featured block — the "48MP · A18 · 12 · 3" row.
 * `value` is rendered at display size, `unit` sits beside it, `label` beneath.
 */
export const productHighlightSchema = z.object({
  value: z.string().min(1),
  unit: z.string().nullable(),
  label: localizedTextSchema,
});
export type ProductHighlight = z.infer<typeof productHighlightSchema>;

export const productColourSchema = z.object({
  slug: slugSchema,
  hex: hexColourSchema,
  label: localizedTextSchema,
});
export type ProductColour = z.infer<typeof productColourSchema>;

export const productVariantSchema = z
  .object({
    id: slugSchema,
    colour: productColourSchema,
    /** "256 GB", "16 GB / 512 GB", or null for accessories with no storage axis. */
    storage: z.string().min(1).nullable(),
    price: priceSchema,
    /** Strike-through reference price. Must exceed `price` when present. */
    compareAt: priceSchema.nullable(),
    stock: stockStatusSchema,
    /**
     * Ordered image paths, first is the card/hero shot. Empty array is a valid
     * state — <ProductImage /> renders the branded empty state instead.
     */
    images: z.array(imagePathSchema),
  })
  .refine((v) => v.compareAt === null || v.compareAt > v.price, {
    message: 'compareAt must be greater than price',
    path: ['compareAt'],
  });
export type ProductVariant = z.infer<typeof productVariantSchema>;

export const productSchema = z.object({
  slug: slugSchema,
  brand: z.string().min(1),
  category: categorySlugSchema,
  badges: z.array(badgeSchema),
  featured: z.boolean(),
  /** Surfaces the product in the "الأكثر مبيعاً" grid. */
  bestseller: z.boolean(),
  name: localizedTextSchema,
  description: localizedTextSchema,
  specs: z.array(productSpecSchema),
  highlights: z.array(productHighlightSchema),
  variants: z.array(productVariantSchema).min(1, 'a product needs at least one variant'),
});
export type Product = z.infer<typeof productSchema>;

/* -------------------------------------------------------------------------- */
/*  Categories                                                                */
/* -------------------------------------------------------------------------- */

export const categorySchema = z.object({
  slug: categorySlugSchema,
  name: localizedTextSchema,
  tagline: localizedTextSchema,
  icon: iconKeySchema,
  /**
   * Transparent-background cutout for the browse card, e.g.
   * `/categories/iphone.png`. Optional: without it the card falls back to the
   * `icon` above on a gold-tint bed, so a missing asset is a softer visual
   * rather than a hole. See public/categories/README.md.
   */
  image: z.string().startsWith('/').optional(),
  /**
   * Optional Apple-style crop for the browse card: zoom into the product so it
   * bleeds past the card's sides and bottom instead of sitting whole inside it.
   *
   * `scale` is the zoom factor, `focusY` the point the zoom happens about as a
   * percentage down the ARTWORK — a cutout with the product's interesting end at
   * the top wants a small value. Same two knobs, and the same reasoning, as the
   * hero's detail crop. Omit it and the cutout renders whole.
   */
  imageCrop: z
    .object({ scale: z.number().positive(), focusY: z.string() })
    .optional(),
  /** Display order in the category strip. */
  position: z.number().int().positive(),
});
export type Category = z.infer<typeof categorySchema>;

/* -------------------------------------------------------------------------- */
/*  Services                                                                  */
/* -------------------------------------------------------------------------- */

export const serviceSchema = z.object({
  slug: slugSchema,
  icon: iconKeySchema,
  name: localizedTextSchema,
  description: localizedTextSchema,
  /** DZD integer, rendered as "من X دج". */
  priceFrom: priceSchema,
  duration: localizedTextSchema,
  position: z.number().int().positive(),
});
export type Service = z.infer<typeof serviceSchema>;

/* -------------------------------------------------------------------------- */
/*  Wilayas                                                                   */
/* -------------------------------------------------------------------------- */

export const wilayaSchema = z.object({
  /** Official wilaya number, 1–58. */
  code: z.number().int().min(1).max(58),
  nameAr: z.string().min(1),
  nameFr: z.string().min(1),
  /** Door-to-door delivery fee, DZD. */
  homeFee: priceSchema,
  /** Pickup-desk (stopdesk) fee, DZD. */
  deskFee: priceSchema,
});
export type Wilaya = z.infer<typeof wilayaSchema>;

/* -------------------------------------------------------------------------- */
/*  Settings                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A staffed line. The client runs three, and they are **not** interchangeable —
 * calling the ads line about a phone repair reaches the wrong person.
 */
export const departmentSchema = z.object({
  key: slugSchema,
  label: localizedTextSchema,
  /** Human-readable, spaced for legibility: "0659 39 13 13". */
  phone: z.string().min(1),
  phoneE164: z.string().regex(/^\+\d{8,15}$/),
});
export type Department = z.infer<typeof departmentSchema>;

export const settingsSchema = z.object({
  /** Human-readable, spaced for legibility: "0659 39 13 13". */
  phone: z.string().min(1),
  /** E.164, used in tel: and wa.me links. */
  phoneE164: z.string().regex(/^\+\d{8,15}$/),
  whatsapp: z.string().regex(/^\+\d{8,15}$/),
  email: z.string().email(),
  /** False while the email is inferred rather than confirmed by the client. */
  emailConfirmed: z.boolean(),
  /** The three staffed lines, ordered. The first is the orders/WhatsApp line. */
  departments: z.array(departmentSchema).min(1),
  /** The client's existing site, linked from the footer. */
  website: z.object({ label: z.string().min(1), url: z.string().url() }),
  /** Years trading. Quoted as a plain fact in copy — never an animated counter. */
  yearsExperience: z.number().int().positive(),
  /**
   * Follower and customer counts, quoted as plain text.
   * DESIGN.md bans animated counters; these are facts, not a scoreboard.
   */
  socialProof: z.object({
    facebook: z.number().int().positive(),
    instagram: z.number().int().positive(),
    tiktok: z.number().int().positive(),
    buyers: z.number().int().positive(),
  }),
  address: localizedTextSchema,
  city: localizedTextSchema,
  hours: z.object({
    weekdays: localizedTextSchema,
    closed: localizedTextSchema,
  }),
  socials: z.object({
    instagram: z.object({ handle: z.string().min(1), url: z.string().url() }),
    facebook: z.object({ handle: z.string().min(1), url: z.string().url() }),
    tiktok: z.object({ handle: z.string().min(1), url: z.string().url() }),
  }),
  delivery: z.object({
    deskFee: priceSchema,
    homeFee: priceSchema,
    confirmationHours: z.number().int().positive(),
    wilayaCount: z.number().int().positive(),
  }),
  /** OpenStreetMap embed — no API key, no third-party script, no cookie banner. */
  mapEmbedUrl: z.string().url(),
  mapLinkUrl: z.string().url(),
  /**
   * False while the map marker is an approximation. The written address is
   * confirmed; the lat/long behind the pin is not, and a confidently wrong pin
   * sends customers to the wrong street.
   */
  mapPinConfirmed: z.boolean(),
});
export type Settings = z.infer<typeof settingsSchema>;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Locale keys, re-exported so content modules don't reach into i18n directly. */
export const contentLocales = locales;

/**
 * Parses a content literal and prefixes any schema error with the module name,
 * so a bad price in products.ts says so instead of dumping a bare zod trace.
 */
export function parseContent<S extends z.ZodTypeAny>(
  label: string,
  schema: S,
  value: unknown,
): z.infer<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid content in ${label}:\n${JSON.stringify(result.error.format(), null, 2)}`);
  }
  return result.data;
}
