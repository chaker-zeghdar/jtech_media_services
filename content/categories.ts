import { type Category, categorySchema, parseContent } from './schemas';
import { z } from 'zod';

/** Mirrors table `categories`. */
export const categories: readonly Category[] = parseContent(
  'content/categories.ts',
  z.array(categorySchema).min(1),
  [
    {
      slug: 'iphone',
      image: '/categories/iphone.png',
      // Zoomed just enough to bleed past the card, the way the reference's
      // iPhone card does, without reading larger than the four whole-product
      // cards beside it. Tuned against this artwork, not a general number: the
      // phone occupies 160px of the 281px-wide file.
      //
      // `focusY` is not independent of `scale`. The visible window starts at
      // `focusY x (1 - 1/scale)`, so easing the zoom without raising focusY
      // slides the frame DOWN the phone and cuts the camera module off the top.
      // 7.5% at 1.5x keeps the frame roughly where 5% put it at 2x.
      imageCrop: { scale: 1.5, focusY: '7.5%' },
      icon: 'iphone',
      position: 1,
      name: { ar: 'آيفون', fr: 'iPhone', en: 'iPhone' },
      tagline: {
        ar: 'من 13 حتى 16 برو ماكس، كامل مضمون',
        fr: 'Du 13 au 16 Pro Max, tous garantis',
        en: 'From the 13 to the 16 Pro Max, all under warranty',
      },
    },
    {
      slug: 'samsung',
      image: '/categories/samsung.png',
      icon: 'samsung',
      position: 2,
      name: { ar: 'سامسونغ', fr: 'Samsung', en: 'Samsung' },
      tagline: {
        ar: 'غالاكسي S، الفولد والفليب، والساعات',
        fr: 'Galaxy S, Fold, Flip et montres',
        en: 'Galaxy S, Fold, Flip and watches',
      },
    },
    {
      slug: 'android',
      // Wired on the client's call, after the concern was raised and overruled.
      // Worth keeping the note: unlike the other four this is a full Xiaomi 15
      // Ultra marketing plate rather than a cutout — the phone plus a baked-in
      // panel of German spec copy and logos, 1.2% transparent pixels against
      // their 33-59%. It reads as an ad inside the card rather than a product
      // photo, and the German copy ships to ar/fr/en readers alike. Swapping in
      // a plain phone-only cutout is a one-line change to the path below.
      image: '/categories/android.png',
      icon: 'android',
      position: 3,
      name: { ar: 'أندرويد', fr: 'Android', en: 'Android' },
      tagline: {
        ar: 'شاومي، ريدمي، بوكو وهونور بأسعار معقولة',
        fr: 'Xiaomi, Redmi, Poco et Honor à bon prix',
        en: 'Xiaomi, Redmi, Poco and Honor at fair prices',
      },
    },
    {
      slug: 'pc',
      image: '/categories/pc.png',
      icon: 'laptop',
      position: 4,
      name: { ar: 'حواسيب', fr: 'Ordinateurs', en: 'Computers' },
      tagline: {
        ar: 'للدراسة، للخدمة، وللڨيمينڨ',
        fr: 'Pour les études, le travail et le gaming',
        en: 'For study, work and gaming',
      },
    },
    {
      slug: 'accessories',
      image: '/categories/accessories.png',
      icon: 'headphones',
      position: 5,
      name: { ar: 'أكسسوارات', fr: 'Accessoires', en: 'Accessories' },
      tagline: {
        ar: 'شواحن، إيربودز، كفرات وحماية',
        fr: 'Chargeurs, écouteurs, coques et protections',
        en: 'Chargers, earbuds, cases and protection',
      },
    },
  ],
);

export function getCategory(slug: Category['slug']): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
