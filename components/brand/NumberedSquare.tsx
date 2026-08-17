import { cn } from '@/lib/cn';

type NumberedSquareProps = {
  /** 1-based step number. Always rendered with Latin digits. */
  value: number;
  className?: string;
};

/** 40×40px gold square, 12px radius, ink numeral at 15px/700. */
export function NumberedSquare({ value, className }: NumberedSquareProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-gold',
        'font-latin text-[15px] font-bold leading-none text-ink',
        className,
      )}
    >
      {value}
    </span>
  );
}
