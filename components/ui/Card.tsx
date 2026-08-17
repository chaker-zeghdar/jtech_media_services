import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CardProps = {
  /** `card` is 18px, `tile` is 24px for large feature tiles. */
  radius?: 'card' | 'tile';
  surface?: 'white' | 'gray' | 'ink';
  /** Adds the hairline border. Off for cards that sit on a gray section. */
  bordered?: boolean;
  /** Lifts 2px and tints the border gold on hover. */
  interactive?: boolean;
  as?: ElementType;
  children: ReactNode;
  className?: string;
};

const SURFACE: Record<NonNullable<CardProps['surface']>, string> = {
  white: 'bg-white text-ink',
  gray: 'bg-gray-50 text-ink',
  ink: 'on-ink bg-ink text-white',
};

export function Card({
  radius = 'card',
  surface = 'white',
  bordered = true,
  interactive = false,
  as: Tag = 'div',
  children,
  className,
}: CardProps) {
  return (
    <Tag
      className={cn(
        'relative',
        radius === 'card' ? 'rounded-card' : 'rounded-tile',
        SURFACE[surface],
        bordered && 'border border-gray-300',
        interactive &&
          'transition-[transform,border-color,background-color] duration-300 ease-brand hover:-translate-y-0.5 hover:border-gold',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
