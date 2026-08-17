import type { ElementType } from 'react';
import { cn } from '@/lib/cn';

type StaggerTextProps = {
  /** Plain string — split on whitespace so it works for AR, FR and EN alike. */
  text: string;
  /** Needed when the headline is the labelling target of a landmark. */
  id?: string;
  as?: ElementType;
  /** Per-word delay. Spec is 40ms. */
  stepMs?: number;
  /** Delay before the first word. */
  delayMs?: number;
  className?: string;
};

/**
 * Headline words rise with a 40ms stagger.
 *
 * A server component driven entirely by CSS animation — no hooks, no
 * `'use client'`, no observer. This is only ever used on the hero headline, which
 * is the LCP element, so it must paint without waiting for hydration.
 *
 * The sentence stays intact for assistive tech and text selection: each word gets
 * an inline-block span, but the separating space is kept OUTSIDE the span so words
 * don't run together when read or copied. Word order is untouched, so RTL shaping
 * and bidi resolution are unaffected.
 */
export function StaggerText({
  text,
  id,
  as: Tag = 'span',
  stepMs = 40,
  delayMs = 0,
  className,
}: StaggerTextProps) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <Tag id={id} className={cn(className)}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span
            className="enter-word"
            style={{ ['--word-delay' as string]: `${delayMs + index * stepMs}ms` }}
          >
            {word}
          </span>
          {index < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  );
}
