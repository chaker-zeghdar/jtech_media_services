'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Logo } from '@/components/brand/LogoMark';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
// Client component — see the import note in ProductCard.tsx.
import { CONTACT, telLink, whatsappLink } from '@/content/contact';
import { cn } from '@/lib/cn';
import { LocaleSwitcher } from './LocaleSwitcher';
import { SearchForm } from './SearchForm';
import { SECTION_IDS } from './navigation';
import { Link } from '@/i18n/navigation';

type MobileMenuProps = {
  /** Localized category name + href pairs, resolved by the server parent. */
  categories: { slug: string; name: string; href: string }[];
};

const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * Full-screen navigation panel under 1024px.
 *
 * Animated with CSS transitions rather than Framer Motion on purpose: the menu is
 * the most-tapped control on mobile, and pulling a JS chunk on tap would put a
 * visible stall in front of it on a 4G connection. Framer Motion is reserved for
 * <QuickView />, which is lazy-loaded and can afford it.
 *
 * Closed state uses `visibility: hidden`, which removes the panel from the
 * accessibility tree and makes its links unfocusable while still allowing the
 * fade to transition.
 *
 * ── The drawer is a portal into `document.body` ─────────────────────────────
 *
 * It wasn't one before the search prompts, and it needed to become one: this
 * trigger button lives inside `<Header />`'s own `<header>` element, which is
 * `position: sticky` with an explicit `z-nav` — and ANY positioned element
 * with a real z-index starts a new stacking context. Once that happens, every
 * descendant's z-index (this panel's `z-menu`, 50) is compared only against
 * OTHER THINGS INSIDE THAT CONTEXT; from outside, the whole header paints as
 * one unit at its own z-nav (40). `<SocialFab />` is a SIBLING of `<Header />`
 * at z-fab (46) — 46 beats a header capped at 40, so it was always able to
 * paint over the drawer's lower half regardless of what number `z-menu` held.
 *
 * That was latent until the search box pushed the category list down by
 * roughly a search-input's height. Measured live: four of the five category
 * links — everything but the first — ended up sitting inside SocialFab's
 * fixed footprint, `elementFromPoint` at its trigger button's own coordinates
 * returned the button rather than anything in `#mobile-menu`, and both
 * reported symptoms trace to that one region: a tap there hits SocialFab
 * instead of the link underneath it, and a scroll gesture starting there
 * never reaches the drawer's own scrollable area either.
 *
 * The fix is the one this codebase already reaches for when something needs
 * to escape an ancestor's stacking/overflow context on purpose — see
 * `<QuickView />`'s own `createPortal(..., document.body)`. Rendering the
 * panel as a child of `<body>` instead of `<header>` puts z-menu (50) in the
 * SAME top-level stacking context SocialFab's z-fab (46) is already in, where
 * 50 finally means what it says. The trigger button stays exactly where it
 * was — only the panel itself moved.
 */
export function MobileMenu({ categories }: MobileMenuProps) {
  const t = useTranslations('nav');
  const tA11y = useTranslations('a11y');
  const tProduct = useTranslations('product');

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  /* `typeof document === 'undefined'` as an inline render-time check — what
     the first version of this fix used, copying `<QuickView />`'s guard —
     is NOT safe here and threw a real hydration-mismatch error the moment it
     shipped. `QuickView` gets away with it because it's wrapped in
     `dynamic(..., { ssr: false })` and only ever mounts after a click, so it
     is never part of the server render OR the client's hydration-matching
     first pass — there is nothing to mismatch against. This component is
     neither: it renders unconditionally and needs to be tappable from the
     very first paint, so it genuinely runs during SSR (`document` is
     `undefined`, guard is `true`) and then AGAIN during the client's first
     render, which must reproduce the server's output byte-for-byte to
     hydrate cleanly (`document` now exists, guard flips to `false`) — two
     different outputs for what hydration requires to be one.
     `mounted` starts `false` on both the server and the client's first pass
     (same initial state either way, so nothing to mismatch), and only
     becomes `true` inside this effect, which by definition runs AFTER
     hydration has already reconciled — a plain post-mount update from there,
     not a hydration diff. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, close]);

  const drawer = (
    <div
      id="mobile-menu"
      ref={panelRef}
      className={cn(
        'fixed inset-0 z-menu flex flex-col bg-white transition-[opacity,visibility] duration-300 ease-brand lg:hidden',
        open ? 'visible opacity-100' : 'invisible opacity-0',
      )}
    >
      <div className="hairline-b flex h-16 shrink-0 items-center justify-between px-6">
        <Logo />
        <button
          type="button"
          onClick={close}
          aria-label={tA11y('closeMenu')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-gray-100"
        >
          <Icon name="close" size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        {/* The header's own search icon is a plain link to `/search` — see
            its doc comment. Inside the drawer there's no reason to make the
            customer land on that page just to start typing, so this is the
            real box: submitting it closes the drawer, same as the category
            links below already do. */}
        <SearchForm onSubmitted={close} />

        <nav aria-label={tA11y('primaryNav')} className="mt-8">
          <ul className="flex flex-col gap-1">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={category.href}
                  onClick={close}
                  className="block py-2.5 text-h3 font-semibold transition-colors duration-200 hover:text-gold-text"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={tA11y('sectionNav')} className="hairline-t mt-8 pt-8">
          <ul className="flex flex-col gap-1">
            {SECTION_IDS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={close}
                  className="block py-2 text-base text-gray-700 transition-colors duration-200 hover:text-ink"
                >
                  {t(id)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hairline-t mt-8 flex flex-col gap-4 pt-8">
          <a
            href={telLink}
            className="flex items-center gap-3 text-base font-semibold transition-colors duration-200 hover:text-gold-text"
          >
            <Icon name="phone" size={18} className="text-gold-text" />
            <bdi className="num">{CONTACT.phone}</bdi>
          </a>
          <LocaleSwitcher />
        </div>
      </div>

      <div className="hairline-t shrink-0 p-6">
        <Button
          href={whatsappLink(tProduct('generalMessage'))}
          external
          fullWidth
          onClick={close}
        >
          {t('order')}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={tA11y('openMenu')}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-gray-100 lg:hidden"
      >
        <Icon name="menu" size={22} />
      </button>

      {/* `mounted` — see its own declaration above for why this can't be a
          plain `typeof document` check. The button above still renders
          normally on the server and hydrates instantly either way; only the
          panel itself waits one tick for the browser to exist. */}
      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}
