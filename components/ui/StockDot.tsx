import { useTranslations } from 'next-intl';
import type { StockStatus } from '@/content/schemas';
import { cn } from '@/lib/cn';

type StockDotProps = {
  status: StockStatus;
  surface?: 'light' | 'ink';
  className?: string;
};

const DOT: Record<StockStatus, string> = {
  'in-stock': 'bg-green',
  'low-stock': 'bg-gold',
  'out-of-stock': 'bg-gray-300',
};

const LABEL_KEY: Record<StockStatus, 'inStock' | 'lowStock' | 'outOfStock'> = {
  'in-stock': 'inStock',
  'low-stock': 'lowStock',
  'out-of-stock': 'outOfStock',
};

/**
 * Dot + label. The dot is decorative: the state is always carried by the text
 * beside it, so colour is never the only signal (WCAG 1.4.1).
 *
 * On light surfaces low-stock uses --color-amber for the label rather than gold,
 * which would fail contrast at 12px.
 */
export function StockDot({ status, surface = 'light', className }: StockDotProps) {
  const t = useTranslations('stock');

  const labelTone =
    surface === 'ink'
      ? 'text-gray-300'
      : status === 'in-stock'
        ? 'text-gray-700'
        : status === 'low-stock'
          ? 'text-amber'
          : 'text-gray-500';

  return (
    <span className={cn('inline-flex items-center gap-2 text-caption', labelTone, className)}>
      <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', DOT[status])} />
      {t(LABEL_KEY[status])}
    </span>
  );
}
