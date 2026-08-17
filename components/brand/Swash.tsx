import { cn } from '@/lib/cn';

type SwashProps = {
  /**
   * `gold` reads on white and on ink alike. `ink` is for the gold panel, where
   * gold-on-gold would vanish.
   *
   * A prop rather than a `className` override on purpose: passing `bg-ink`
   * alongside the base `bg-gold` leaves both utilities in the class list, and
   * which one wins depends on their order in the generated stylesheet, not on
   * the order they're written. That's a coin flip, not a decision.
   */
  tone?: 'gold' | 'ink';
  className?: string;
};

/**
 * 56×4px bar, 20px under every section headline. No exceptions.
 *
 * This is the cheapest consistency device in the system: it is what makes a
 * dozen otherwise-plain sections read as one family. <SectionHeader /> renders
 * it automatically so a new section can't accidentally ship without it.
 */
export function Swash({ tone = 'gold', className }: SwashProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'mt-5 block h-1 w-14 rounded-[2px]',
        tone === 'ink' ? 'bg-ink' : 'bg-gold',
        className,
      )}
    />
  );
}
