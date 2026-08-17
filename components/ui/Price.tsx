import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { discountPercent, formatInteger } from '@/lib/format';

type PriceProps = {
  /** DZD integer. */
  value: number;
  /** Strike-through reference price, when there is one. */
  compareAt?: number | null;
  size?: 'sm' | 'md' | 'lg';
  surface?: 'light' | 'ink' | 'gold';
  /** Shows a "-12%" chip next to the price. */
  showSaving?: boolean;
  className?: string;
};

const SIZE: Record<NonNullable<PriceProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-h3',
};

/**
 * The two grays swap by surface, and it is not interchangeable:
 *   on white  #6E6E73 (gray-700) = 5.0:1 ✓   #86868B (gray-500) = 3.6:1 ✗
 *   on ink    #86868B (gray-500) = 4.6:1 ✓   #6E6E73 (gray-700) = 3.3:1 ✗
 */
const MUTED: Record<NonNullable<PriceProps['surface']>, string> = {
  light: 'text-gray-700',
  ink: 'text-gray-500',
  gold: 'text-ink/60',
};

/**
 * Renders "289.000 دج" — Latin digits with dot grouping in every locale, the
 * whole price wrapped in <bdi> so the numeral and the currency word can't be
 * split or reordered by the RTL paragraph around them.
 */
export function Price({
  value,
  compareAt = null,
  size = 'md',
  surface = 'light',
  showSaving = false,
  className,
}: PriceProps) {
  const t = useTranslations('common');
  const saving = showSaving ? discountPercent(value, compareAt) : null;

  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-2 gap-y-1', SIZE[size], className)}>
      <bdi className="font-semibold">
        <span className="num">{formatInteger(value)}</span>{' '}
        <span className="text-[0.8em] font-medium">{t('currency')}</span>
      </bdi>

      {compareAt !== null && compareAt > value ? (
        <bdi className={cn('font-normal line-through', MUTED[surface], size === 'lg' && 'text-base')}>
          <span className="num">{formatInteger(compareAt)}</span>{' '}
          <span className="text-[0.85em]">{t('currency')}</span>
        </bdi>
      ) : null}

      {saving !== null ? (
        <bdi className="rounded-full bg-gold-tint px-2 py-0.5 text-caption font-semibold text-gold-text">
          <span className="num">−{saving}</span>%
        </bdi>
      ) : null}
    </span>
  );
}

type PriceFromProps = Omit<PriceProps, 'compareAt' | 'showSaving'>;

/** "من 44.500 دج" — the label prefix works in all three locales. */
export function PriceFrom({ value, size = 'md', surface = 'light', className }: PriceFromProps) {
  const t = useTranslations('common');

  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-2', className)}>
      <span className={cn('text-sm font-normal', MUTED[surface])}>{t('priceFrom')}</span>
      <Price value={value} size={size} surface={surface} />
    </span>
  );
}
