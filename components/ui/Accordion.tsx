import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

/** Which surface the accordion sits on — decides hairline and hover colours. */
type Tone = 'light' | 'gold';

type AccordionProps = {
  tone?: Tone;
  children: ReactNode;
  className?: string;
};

const RULE: Record<Tone, string> = {
  light: 'divide-gray-300 border-gray-300',
  gold: 'divide-ink/20 border-ink/20',
};

/** A stack of <AccordionItem />s separated by hairlines. */
export function Accordion({ tone = 'light', children, className }: AccordionProps) {
  return <div className={cn('divide-y border-y', RULE[tone], className)}>{children}</div>;
}

type AccordionItemProps = {
  /** ReactNode so callers can wrap numerals in <bdi> — see <Delivery />. */
  title: ReactNode;
  /** Small inline-end value shown on the closed row, e.g. a count or a price. */
  meta?: ReactNode;
  tone?: Tone;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

const SUMMARY: Record<Tone, string> = {
  light: 'hover:text-gold-text',
  gold: 'hover:underline',
};

const META: Record<Tone, string> = {
  light: 'text-gray-700',
  gold: 'text-ink',
};

const BODY: Record<Tone, string> = {
  light: 'text-gray-700',
  gold: 'text-ink',
};

/**
 * Built on native <details>/<summary>.
 *
 * That gives keyboard operation, the correct expanded/collapsed announcement and
 * find-in-page expansion for free, with zero JavaScript — which is why this isn't
 * a client component. The chevron rotation comes from Tailwind's `open:` variant
 * rather than from state.
 */
export function AccordionItem({
  title,
  meta,
  tone = 'light',
  defaultOpen = false,
  children,
  className,
}: AccordionItemProps) {
  return (
    <details open={defaultOpen} className={cn('group', className)}>
      <summary
        className={cn(
          'flex cursor-pointer list-none items-center gap-4 py-4 text-base font-semibold',
          'transition-colors duration-200',
          SUMMARY[tone],
          // Hides the default disclosure triangle in Safari and Chrome.
          '[&::-webkit-details-marker]:hidden',
        )}
      >
        <span className="flex-1">{title}</span>
        {meta ? (
          <span className={cn('shrink-0 text-sm font-normal', META[tone])}>{meta}</span>
        ) : null}
        <Icon
          name="chevron"
          size={18}
          className={cn(
            'shrink-0 rotate-90 opacity-60 transition-transform duration-300 ease-brand',
            'group-open:-rotate-90',
          )}
        />
      </summary>
      <div className={cn('pb-5 text-base', BODY[tone])}>{children}</div>
    </details>
  );
}
