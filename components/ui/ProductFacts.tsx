'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

type ProductFactsProps = {
  /**
   * The SELECTED variant's capacity, not the product's — passed in rather than
   * derived so `<CheckoutView />` can hand over whatever the customer has
   * currently picked and the badge tracks a colour/capacity change live.
   */
  storage: string | null;
  /**
   * Null for anything that doesn't carry a reading.
   *
   * Deliberately NOT re-checked against the category's `hasBatteryHealth` flag
   * here. The admin form enforces that where the value is WRITTEN — it clears
   * the field on a category switch and sends null unless the flag is on — so a
   * non-null value already means "this category has the concept". Re-deriving
   * it here would mean threading the category into every caller for a rule that
   * is already guaranteed upstream, and would give two places to disagree.
   */
  batteryHealthPercent: number | null;
  className?: string;
};

/**
 * The two at-a-glance facts a second-hand phone actually sells on: how much it
 * holds, and how healthy the battery is.
 *
 * Shared by `<ProductInfo />` (the quick-view detail step) and
 * `<CheckoutView />` (the order form, which is the whole of `/products/[slug]`
 * since the page's separate summary section was removed). They had one copy
 * each of this markup and no reason to ever look different; the second copy
 * went missing entirely when that section was deleted, which is the bug this
 * component exists to make unrepeatable.
 *
 * Renders nothing when a product carries neither — most of the catalogue.
 */
export function ProductFacts({ storage, batteryHealthPercent, className }: ProductFactsProps) {
  const t = useTranslations('product');

  if (!storage && batteryHealthPercent === null) return null;

  return (
    <ul className={cn('flex flex-wrap items-center gap-2', className)}>
      {storage ? (
        <li className="rounded-full border border-gray-300 px-3 py-1.5 text-caption font-medium">
          {t('storage')} <bdi className="num">{storage}</bdi>
        </li>
      ) : null}

      {batteryHealthPercent !== null ? (
        <li className="rounded-full border border-gold bg-gold-tint px-3 py-1.5 text-caption font-medium text-gold-text">
          {/* Plain `%`, matching <Price />'s discount chip, which renders one in
              all three locales. This badge used an Arabic `٪`, so a French page
              read "Santé batterie 100٪" — and the same page showed "−6%" a few
              centimetres away. One convention, whichever it is, beats two. */}
          {t('batteryHealth')} <bdi className="num">{batteryHealthPercent}%</bdi>
        </li>
      ) : null}
    </ul>
  );
}
