/**
 * Single import surface for the *static* content layer.
 *
 * Products and categories are no longer here — they moved to Supabase and are
 * read through `lib/queries/products.ts` and `lib/queries/categories.ts`. They
 * are deliberately NOT re-exported from this barrel: doing so would pull the
 * Supabase client into everything that touches `@/content`, including the
 * modules that exist precisely to stay client-safe.
 *
 * What remains here is content that is genuinely static — shapes, services,
 * shop settings and the wilaya fee table — plus the schemas, which still
 * validate the Supabase rows on the way in.
 */
export * from './schemas';
export * from './services';
export * from './settings';
export * from './wilayas';
