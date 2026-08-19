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
      // No `image` on purpose. The cutout supplied for this slot was a full
      // Xiaomi 15 Ultra marketing plate — the phone plus a baked-in panel of
      // German spec copy and logos — not a product-on-transparent cutout like
      // the other four (1.2% transparent pixels against their 33-59%). In a
      // card that reads "name, tagline, product" at a glance it would look
      // like a foreign ad pasted into the layout, and cropping the panel off
      // would be fragile. Until a plain phone-only cutout exists this falls
      // through to <ProductImage />'s branded empty state, which is the same
      // thing every product without a photo already shows.
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
