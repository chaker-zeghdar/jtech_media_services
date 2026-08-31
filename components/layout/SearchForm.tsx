'use client';

import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/Icon';
import { Price } from '@/components/ui/Price';
import { ProductImage } from '@/components/ui/ProductImage';
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

type SearchResult = { slug: string; name: string; price: number; image: string | null };

/** After the last keystroke, not per keystroke — a request-per-letter is
 *  wasted work for a query that keeps changing. Short enough that the
 *  customer never notices a lag once they stop typing. */
const DEBOUNCE_MS = 280;

/**
 * The one search box: a live type-ahead, used in two places — `/search`'s own
 * page and `<MobileMenu />`'s drawer (the header's own icon is still a plain
 * link; see its doc comment for why that stayed a link rather than an inline
 * expanding input).
 *
 * ── Live results, not a click-through ───────────────────────────────────────
 *
 * This used to be a plain `<form>`: type, then submit navigates to `/search`.
 * That is still what Enter and the magnifying-glass button do — kept as the
 * "see all results" action, and as what a slow-to-hydrate client still gets
 * from a real `<form>` — but it is no longer the primary path. As the
 * customer types, a debounced `fetch('/api/search?q=…')` fills a dropdown
 * under the input with the same product search `/search` itself runs,
 * capped at a handful of rows; picking one is a real `<Link>` straight to the
 * product page, no intermediate results page required.
 *
 * ── Closing it correctly ─────────────────────────────────────────────────
 *
 * Closing on the input's own `onBlur` is the standard way to get this wrong:
 * focus moves to whatever is clicked BEFORE the click itself fires, so a
 * dropdown that closes on blur unmounts a result's `<Link>` out from under
 * the click that was meant to follow it. This closes on an outside
 * pointerdown instead — checked against a ref around the whole form+panel —
 * which only fires for a genuine tap/click elsewhere, never for one inside
 * the panel itself.
 *
 * `open` is its own state rather than derived from `focused && value`,
 * because closing has more triggers than blur: Escape, an outside tap,
 * selecting a result, or the query going back to empty. Re-deriving all of
 * that from two booleans on every keystroke is more ways for one of them to
 * be forgotten than just tracking the one thing that actually matters —
 * whether the panel is open.
 */
export function SearchForm({ defaultValue = '', autoFocus = false, onSubmitted, className }: SearchFormProps) {
  const t = useTranslations('search');
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [total, setTotal] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  /* Guards against an out-of-order response the same way the checkout's own
     daira fetch does (see CheckoutView.tsx): typing "x", "xo", "xon" fires
     three requests, and network timing does not promise they land in that
     order. Without this, a slower reply for "x" landing after "xon"'s would
     overwrite three correct results with the wrong ones. */
  const requestIdRef = useRef(0);

  /* Not a static "site-search": `<MobileMenu />`'s drawer stays mounted in the
     DOM at every width (closed is `invisible`/`opacity-0`, not unmounted), so
     its copy of this form and the `/search` page's own are BOTH in the
     document at once on that page — a static id collided, which broke
     `<label htmlFor>` (both labels pointed at whichever input the browser
     picked first) and any test or extension selecting by id. */
  const inputId = useId();

  useEffect(() => {
    const term = value.trim();

    if (!term) {
      setOpen(false);
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const requestId = ++requestIdRef.current;

    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`)
        .then((res) => (res.ok ? res.json() : { results: [], total: 0 }))
        .then((body: { results?: SearchResult[]; total?: number }) => {
          if (requestId !== requestIdRef.current) return; // superseded — drop it
          setResults(body.results ?? []);
          setTotal(body.total ?? 0);
          setLoading(false);
          setOpen(true);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setResults([]);
          setTotal(0);
          setLoading(false);
          setOpen(true);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function goToResults(term: string) {
    setOpen(false);
    router.push(term ? { pathname: '/search', query: { q: term } } : { pathname: '/search' });
    onSubmitted?.();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    goToResults(value.trim());
  }

  const showEmpty = open && !loading && results !== null && results.length === 0;
  const showResults = open && results !== null && results.length > 0;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form role="search" onSubmit={handleSubmit} className="flex items-center gap-2">
        <label htmlFor={inputId} className="sr-only">
          {t('placeholder')}
        </label>
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => {
            if (value.trim() && results !== null) setOpen(true);
          }}
          placeholder={t('placeholder')}
          // Search queries are as likely to be a Latin brand name as an Arabic
          // phrase — same reasoning as the admin's own free-text name fields.
          dir="auto"
          autoFocus={autoFocus}
          autoComplete="off"
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

      {/* `z-modal`: this floats over the sticky header (`z-nav`) and the chat
          bubble (`z-fab`) wherever it's rendered on the page, exactly like a
          modal has to. It never needs to clear `z-menu` — inside the mobile
          drawer this panel is a DESCENDANT of the drawer, so it already stacks
          within the drawer's own context with no conflict to resolve.

          `aria-live="polite"` on the one region that actually changes text, so
          a screen reader announces "loading" and then the result count without
          re-announcing the whole panel structure on every keystroke. */}
      {open && (loading || showResults || showEmpty) ? (
        <div
          className="absolute inset-x-0 top-full z-modal mt-2 max-h-[70vh] overflow-y-auto rounded-card border border-gray-300 bg-white shadow-card"
          aria-live="polite"
        >
          {loading && results === null ? (
            <p className="px-4 py-4 text-sm text-gray-700">{t('loading')}</p>
          ) : showEmpty ? (
            <p dir="auto" className="px-4 py-4 text-sm text-gray-700">
              {t('noResults', { query: value.trim() })}
            </p>
          ) : results && results.length > 0 ? (
            <>
              <ul className="divide-y divide-gray-300">
                {results.map((result) => (
                  <li key={result.slug}>
                    <Link
                      href={`/products/${result.slug}`}
                      onClick={() => {
                        setOpen(false);
                        onSubmitted?.();
                      }}
                      className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-gray-50"
                    >
                      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                        <ProductImage
                          src={result.image ?? undefined}
                          name={result.name}
                          width={48}
                          height={48}
                          sizes="48px"
                        />
                      </span>
                      <span dir="auto" className="min-w-0 flex-1 truncate text-sm font-medium">
                        {result.name}
                      </span>
                      <Price value={result.price} size="sm" className="shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>

              {/* "See all results" — what Enter and the button already do,
                  surfaced here too since it's the one place a customer is
                  actually looking while the panel is open. */}
              <button
                type="button"
                onClick={() => goToResults(value.trim())}
                className="block w-full border-t border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gold-text transition-colors duration-150 hover:bg-gray-50 hover:text-ink"
              >
                {t('viewAll', { count: total })}
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
