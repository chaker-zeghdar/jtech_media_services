import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ContainerProps = {
  /** `shell` is the 1680px page frame; `prose` is the 980px content column. */
  width?: 'shell' | 'prose';
  as?: ElementType;
  children: ReactNode;
  className?: string;
};

export function Container({
  width = 'shell',
  as: Tag = 'div',
  children,
  className,
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-6 sm:px-8',
        width === 'shell' ? 'max-w-shell' : 'max-w-prose',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
