import type { ReactNode } from 'react';
import { Swash } from '@/components/brand/Swash';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';

type SectionHeaderProps = {
  /** The owning Section's id — becomes `${id}-title` so the landmark is named. */
  id: string;
  eyebrow?: string;
  title: string;
  subhead?: string;
  /** Right-hand slot on desktop, e.g. a "view all" link. */
  action?: ReactNode;
  align?: 'start' | 'center';
  surface?: 'light' | 'ink' | 'gold';
  className?: string;
};

const SUBHEAD_TONE: Record<NonNullable<SectionHeaderProps['surface']>, string> = {
  light: 'text-gray-700',
  ink: 'text-gray-300',
  gold: 'text-ink',
};

const EYEBROW_TONE: Record<NonNullable<SectionHeaderProps['surface']>, string> = {
  light: 'text-gray-700',
  ink: 'text-gold',
  gold: 'text-ink',
};

/**
 * Every section headline in the system goes through here, which is how the Swash
 * ends up under all of them without exception — it isn't optional and there's no
 * prop to turn it off.
 */
export function SectionHeader({
  id,
  eyebrow,
  title,
  subhead,
  action,
  align = 'start',
  surface = 'light',
  className,
}: SectionHeaderProps) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'flex flex-col gap-8 md:flex-row md:items-end md:justify-between',
        centered && 'md:flex-col md:items-center',
        className,
      )}
    >
      <Reveal className={cn('max-w-prose', centered && 'text-center')}>
        {eyebrow ? (
          <p className={cn('mb-4 text-eyebrow uppercase', EYEBROW_TONE[surface])}>{eyebrow}</p>
        ) : null}

        <h2 id={`${id}-title`} className="text-balance text-section font-semibold">
          {title}
        </h2>

        {/* 56×4px gold bar, 20px under the headline. Non-negotiable. */}
        <Swash className={cn(centered && 'mx-auto')} />

        {subhead ? (
          <p className={cn('mt-6 max-w-[60ch] text-subhead', SUBHEAD_TONE[surface])}>{subhead}</p>
        ) : null}
      </Reveal>

      {action ? <Reveal delayMs={80} className="shrink-0">{action}</Reveal> : null}
    </div>
  );
}
