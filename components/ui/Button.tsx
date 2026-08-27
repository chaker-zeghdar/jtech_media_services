import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

/**
 * Three tiers, and only three:
 *   primary   — ink pill, the single strongest action in a section
 *   secondary — gold pill, ink text
 *   link      — gold text link with a chevron that slides 3px on hover
 */
type Variant = 'primary' | 'secondary' | 'link';

/**
 * Which surface the button sits on. This is what keeps gold legible: `link` on a
 * light surface uses --color-gold-text (#9A6200, ~5:1), while on ink it uses the
 * full --color-gold (~8:1 on #1D1D1F). Gold text on white never happens.
 */
type Surface = 'light' | 'ink' | 'gold';

type ButtonProps = {
  variant?: Variant;
  surface?: Surface;
  size?: 'sm' | 'md';
  /**
   * Internal path (locale-aware Link), in-page hash, or an external/tel/mailto
   * URL (plain anchor). Omit to render a <button>.
   */
  href?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  /** Opens in a new tab and appends the security rel. */
  external?: boolean;
  /** Overrides the accessible name when the visible label isn't enough. */
  ariaLabel?: string;
  fullWidth?: boolean;
  /**
   * `<button>` only. A disabled `<a>` is not a thing the platform has — an
   * anchor with `disabled` is still clickable — so a caller that needs a
   * disabled state must be rendering a button, and passing this alongside
   * `href` is a mistake worth not silently absorbing.
   */
  disabled?: boolean;
  children: ReactNode;
  className?: string;
};

const PILL_BASE =
  'group inline-flex items-center justify-center gap-2 rounded-full font-semibold leading-none ' +
  'transition-[background-color,color,transform] duration-200 ease-brand active:scale-[.98]';

const LINK_BASE =
  'group inline-flex items-center gap-1.5 font-semibold leading-none ' +
  'transition-colors duration-200 ease-brand';

const SIZE: Record<'sm' | 'md', string> = {
  sm: 'px-4 py-2.5 text-sm',
  md: 'px-6 py-3.5 text-base',
};

const PILL_TONE: Record<Variant, Record<Surface, string>> = {
  primary: {
    light: 'bg-ink text-white hover:bg-gray-700',
    ink: 'bg-white text-ink hover:bg-gray-100',
    gold: 'bg-ink text-white hover:bg-gray-700',
  },
  secondary: {
    light: 'bg-gold text-ink hover:bg-gold-light',
    ink: 'bg-gold text-ink hover:bg-gold-light',
    gold: 'bg-white text-ink hover:bg-gold-tint',
  },
  link: {
    light: 'text-gold-text hover:text-ink',
    ink: 'text-gold hover:text-white',
    // Nothing is darker than ink, so the hover cue is an underline rather than
    // a colour change that could only reduce contrast on the gradient.
    gold: 'text-ink hover:underline',
  },
};

export function Button({
  variant = 'primary',
  surface = 'light',
  size = 'md',
  href,
  type = 'button',
  onClick,
  external = false,
  ariaLabel,
  fullWidth = false,
  disabled = false,
  children,
  className,
}: ButtonProps) {
  const isLink = variant === 'link';

  const classes = cn(
    isLink ? LINK_BASE : cn(PILL_BASE, SIZE[size]),
    isLink && (size === 'sm' ? 'text-sm' : 'text-base'),
    PILL_TONE[variant][surface],
    fullWidth && 'w-full',
    disabled && 'pointer-events-none opacity-60',
    className,
  );

  const content = (
    <>
      {children}
      {isLink ? (
        <Icon
          name="chevron"
          size={16}
          // Points inline-end in both directions, and slides 3px toward it on hover.
          className={cn(
            'rtl:-scale-x-100',
            'transition-transform duration-200 ease-brand',
            'ltr:group-hover:translate-x-[3px] rtl:group-hover:-translate-x-[3px]',
          )}
        />
      ) : null}
    </>
  );

  if (href) {
    const isExternalHref =
      external || /^(https?:|tel:|mailto:)/.test(href) || href.startsWith('#');

    if (isExternalHref) {
      return (
        <a
          href={href}
          onClick={onClick}
          aria-label={ariaLabel}
          className={classes}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} onClick={onClick} aria-label={ariaLabel} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={classes}
    >
      {content}
    </button>
  );
}
