import { IBM_Plex_Sans_Arabic } from 'next/font/google';

/**
 * Shared with `app/(storefront)/[locale]/layout.tsx` and the admin root layout,
 * so the font is instantiated exactly once and both areas resolve the same
 * `--font-plex-arabic` variable.
 *
 * The admin panel was rendering in the browser's system UI face because its
 * `<html>` carried no `className`, so `--font-plex-arabic` was never defined
 * there and `--font-stack-arabic` in globals.css fell straight through to its
 * `-apple-system, …, sans-serif` tail. Two `next/font` instantiations of the
 * same family would each emit their own preload and their own CSS variable, so
 * this exists to keep it one.
 *
 * Arabic subset only, matching the storefront: Latin runs in this panel —
 * slugs, hex codes, prices — resolve through `--font-stack-latin`, which puts
 * the system face ahead of any webfont.
 */
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-plex-arabic',
});
