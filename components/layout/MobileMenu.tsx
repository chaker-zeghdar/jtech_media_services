'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/brand/LogoMark';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
// Client component — see the import note in ProductCard.tsx.
import { CONTACT, telLink, whatsappLink } from '@/content/contact';
import { cn } from '@/lib/cn';
import { LocaleSwitcher } from './LocaleSwitcher';
import { SECTION_IDS } from './navigation';

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
 */
export function MobileMenu({ categories }: MobileMenuProps) {
  const t = useTranslations('nav');
  const tA11y = useTranslations('a11y');
  const tProduct = useTranslations('product');

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

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
          <nav aria-label={tA11y('primaryNav')}>
            <ul className="flex flex-col gap-1">
              {categories.map((category) => (
                <li key={category.slug}>
                  <a
                    href={category.href}
                    onClick={close}
                    className="block py-2.5 text-h3 font-semibold transition-colors duration-200 hover:text-gold-text"
                  >
                    {category.name}
                  </a>
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
    </>
  );
}
