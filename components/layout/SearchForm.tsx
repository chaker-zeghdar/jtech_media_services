'use client';

import { type FormEvent, useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Icon } from '@/components/ui/Icon';
import { fieldControlClassName } from '@/components/ui/Field';
import { cn } from '@/lib/cn';

type SearchFormProps = {
  /** The query already in the URL, e.g. reopening `/search?q=neck` with the
   *  typed word still in the box rather than a blank one. */
  defaultValue?: string;
  autoFocus?: boolean;
  /** `<MobileMenu />` closes the drawer once a search is actually submitted —
   *  same as its category links do — so the query doesn't land under an open
   *  panel. Nothing else needs this. */
  onSubmitted?: () => void;
  className?: string;
};

/**
 * The one search box, used in two places: the `/search` page itself, and
 * `<MobileMenu />`'s drawer (the header's own icon is a plain link — see its
 * doc comment for why).
 *
 * A real `role="search"` `<form>`, not an input wired to `onKeyDown`: Enter
 * submits it for free, and it degrades to something a browser can still act on
 * if JS is slow to hydrate. Navigation goes through `useRouter` rather than a
 * native GET action because the target route is locale-prefixed — `next-intl`'s
 * router is what applies that prefix (`/fr/search`, bare `/search` for the
 * default locale), the same way every `<Link>` on this site already does.
 */
export function SearchForm({ defaultValue = '', autoFocus = false, onSubmitted, className }: SearchFormProps) {
  const t = useTranslations('search');
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  /* Not a static "site-search": `<MobileMenu />`'s drawer stays mounted in the
     DOM at every width (closed is `invisible`/`opacity-0`, not unmounted), so
     its copy of this form and the `/search` page's own are BOTH in the
     document at once on that page — a static id collided, which broke
     `<label htmlFor>` (both labels pointed at whichever input the browser
     picked first) and any test or extension selecting by id. */
  const inputId = useId();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const term = value.trim();
    router.push(term ? { pathname: '/search', query: { q: term } } : { pathname: '/search' });
    onSubmitted?.();
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={cn('flex items-center gap-2', className)}>
      <label htmlFor={inputId} className="sr-only">
        {t('placeholder')}
      </label>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t('placeholder')}
        // Search queries are as likely to be a Latin brand name as an Arabic
        // phrase — same reasoning as the admin's own free-text name fields.
        dir="auto"
        autoFocus={autoFocus}
        className={fieldControlClassName}
      />
      <button
        type="submit"
        aria-label={t('submit')}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors duration-200 hover:bg-gray-700"
      >
        <Icon name="search" size={18} />
      </button>
    </form>
  );
}
