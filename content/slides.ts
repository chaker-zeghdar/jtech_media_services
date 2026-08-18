/**
 * The client's four marketing posts.
 *
 * Deliberately zod-free and dependency-free, the same pattern as
 * `content/contact.ts`: this is a flat list of paths with no shape worth
 * validating, and keeping it plain means a client component could import it
 * without dragging zod and the product catalogue across the boundary.
 *
 * ONE array, two consumers — <BrandMarquee /> (the full rail) and <Hero /> (the
 * proof strip). A second hardcoded copy is how the two drift apart.
 *
 * `key` indexes the alt text under the `social.slides.*` message namespace, so
 * both consumers describe the same photo with the same words.
 */
export const SLIDES = [
  { key: 's1', src: '/slide/slide-1.jpg' },
  { key: 's2', src: '/slide/slide-2.jpg' },
  { key: 's3', src: '/slide/slide-3.jpg' },
  { key: 's4', src: '/slide/slide-4.jpg' },
] as const;

export type Slide = (typeof SLIDES)[number];

/** All four source files are square at this size. */
export const SLIDE_SOURCE = 1170;
