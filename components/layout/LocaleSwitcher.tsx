'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { localeLabels, locales } from '@/i18n/routing';
import { cn } from '@/lib/cn';

type LocaleSwitcherProps = {
  /** `ink` for the announcement bar, `light` for the white header. */
  tone?: 'light' | 'ink';
  className?: string;
};

/**
 * Three plain links rather than a dropdown: no JS state, no popover, and every
 * locale is one tap away — which matters more on a phone than tidiness does.
 *
 * `usePathname()` comes from i18n/navigation and returns the path WITHOUT the
 * locale prefix, so passing the same value with a different `locale` produces
 * the correct `as-needed` URL (`/` for ar, `/fr` and `/en` for the others).
 */
export function LocaleSwitcher({ tone = 'light', className }: LocaleSwitcherProps) {
  const active = useLocale();
  const pathname = usePathname();
  const t = useTranslations('a11y');

  return (
    <nav aria-label={t('localeSwitcher')} className={className}>
      <ul className="flex items-center gap-1">
        {locales.map((locale) => {
          const current = locale === active;

          return (
            <li key={locale}>
              <Link
                href={pathname}
                locale={locale}
                lang={locale}
                hrefLang={locale}
                aria-current={current ? 'true' : undefined}
                className={cn(
                  'font-latin block rounded-full px-2.5 py-1 text-caption uppercase transition-colors duration-200',
                  current
                    ? tone === 'ink'
                      ? 'bg-white/15 text-white'
                      : 'bg-gray-100 text-ink'
                    : tone === 'ink'
                      ? 'text-gray-300 hover:text-white'
                      : // gray-700 measures 2.46:1 on the hero gradient's gold
                        // top edge, where this sits while the header is
                        // transparent. Ink measures 8.07:1.
                        'text-gray-700 hover:text-ink group-data-[over-hero]:text-ink',
                )}
              >
                {locale}
                {/* The full language name is appended rather than replacing the
                    visible code via aria-label: an accessible name that doesn't
                    contain the visible text breaks voice control (WCAG 2.5.3). */}
                <span className="sr-only"> {localeLabels[locale]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
