import { useTranslations } from 'next-intl';
import { Pill } from '@/components/brand/Pill';
import type { Badge as BadgeKey } from '@/content/schemas';

type BadgeProps = {
  badge: BadgeKey;
  className?: string;
};

/** Badge key → Pill variant. Gold reads as an offer, ink as a status. */
const VARIANT: Record<BadgeKey, 'ink' | 'gold'> = {
  new: 'gold',
  promo: 'gold',
  bestseller: 'ink',
  'last-units': 'ink',
  warranty: 'ink',
};

const LABEL_KEY: Record<BadgeKey, 'new' | 'bestseller' | 'promo' | 'lastUnits' | 'warranty'> = {
  new: 'new',
  bestseller: 'bestseller',
  promo: 'promo',
  'last-units': 'lastUnits',
  warranty: 'warranty',
};

export function Badge({ badge, className }: BadgeProps) {
  const t = useTranslations('badges');

  return (
    <Pill variant={VARIANT[badge]} className={className}>
      {t(LABEL_KEY[badge])}
    </Pill>
  );
}
