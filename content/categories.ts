import { type Category, categorySchema, parseContent } from './schemas';
import { z } from 'zod';

/** Mirrors table `categories`. */
export const categories: readonly Category[] = parseContent(
  'content/categories.ts',
  z.array(categorySchema).min(1),
  [
    {
      slug: 'iphone',
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
