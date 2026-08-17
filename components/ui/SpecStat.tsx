import { cn } from '@/lib/cn';

type SpecStatProps = {
  /** The display numeral: "48", "A18", "3". */
  value: string;
  /** Sits beside the numeral at a smaller size: "MP", "Pro". */
  unit?: string | null;
  label: string;
  size?: 'md' | 'lg';
  surface?: 'light' | 'ink';
  className?: string;
};

/**
 * A headline spec numeral — the "48MP · A18 · 12 · 3" row on the dark featured
 * block.
 *
 * The numeral always renders in the Latin face with tabular figures so the four
 * stats align on a baseline grid across all three locales.
 */
export function SpecStat({
  value,
  unit,
  label,
  size = 'lg',
  surface = 'ink',
  className,
}: SpecStatProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p
        className={cn(
          'num flex items-baseline gap-1.5 font-semibold',
          size === 'lg' ? 'text-numeral' : 'text-numeral-sm',
          surface === 'ink' ? 'text-white' : 'text-ink',
        )}
      >
        <bdi>{value}</bdi>
        {unit ? (
          <bdi className={cn('text-[0.34em] font-semibold', surface === 'ink' ? 'text-gold' : 'text-gold-text')}>
            {unit}
          </bdi>
        ) : null}
      </p>
      <p className={cn('text-caption', surface === 'ink' ? 'text-gray-300' : 'text-gray-700')}>
        {label}
      </p>
    </div>
  );
}
