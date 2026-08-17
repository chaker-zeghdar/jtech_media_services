import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const CONTROL =
  'w-full rounded-card border border-gray-300 bg-white px-4 py-3 text-base text-ink ' +
  'placeholder:text-gray-700 transition-[border-color,box-shadow] duration-200 ease-brand ' +
  'hover:border-gray-500 focus:border-ink focus:outline-none ' +
  'aria-[invalid=true]:border-amber';

type FieldShellProps = {
  id: string;
  label: string;
  /** Rendered under the control and wired up via aria-describedby. */
  hint?: string;
  /** Rendered under the control, announced politely, and sets aria-invalid. */
  error?: string;
  required?: boolean;
  children: (props: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': boolean | undefined;
    required: boolean;
    className: string;
  }) => ReactNode;
  className?: string;
};

/**
 * Label + control + hint/error, with the aria wiring done once.
 *
 * Render-prop rather than a wrapper around <input> so the same accessibility
 * plumbing serves inputs, selects and textareas without three near-identical
 * components. Phase 2's order form and wilaya picker build on this.
 */
export function Field({
  id,
  label,
  hint,
  error,
  required = false,
  children,
  className,
}: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {required ? (
          <span aria-hidden="true" className="ms-1 text-amber">
            *
          </span>
        ) : null}
      </label>

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        required,
        className: CONTROL,
      })}

      {hint ? (
        <p id={hintId} className="text-caption text-gray-700">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-caption font-medium text-amber">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Shared control classes, for callers that build their own control markup. */
export const fieldControlClassName = CONTROL;
