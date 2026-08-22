'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

export type SocialFabLink = {
  key: 'instagram' | 'facebook' | 'tiktok';
  url: string;
  label: string;
};

/**
 * Floating social widget — a round trigger pinned to the viewport corner that
 * expands to the shop's three accounts.
 *
 * ── Why only socials ───────────────────────────────────────────────────────
 *
 * Phone and WhatsApp are deliberately absent. Both already have prominent,
 * dedicated affordances (the header's icon buttons, <MobileOrderBar /> on
 * mobile), so repeating them here would be a third copy of the same two links.
 * The social accounts are the thing the site had no dedicated control for, and
 * that is the whole job of this widget.
 *
 * ── Physical right, on purpose ─────────────────────────────────────────────
 *
 * `right-*`, not `end-*`. DESIGN.md §7 bans physical left/right project-wide so
 * the layout mirrors under Arabic, and this is the one component that opts out —
 * recorded there as a named exception alongside the hero's display face and
 * GoldOrb's blur. Floating support widgets are a convention users navigate by
 * physical position (Intercom, Crisp, Apple's own), and a control that jumps
 * corners when you switch language is harder to find, not more correct. The
 * exception is exactly this element and must not spread.
 *
 * ── Data comes in as props ─────────────────────────────────────────────────
 *
 * `content/settings.ts` is client-safe (its `parseContent` is pure zod), but
 * importing it here would pull the whole settings object — departments,
 * delivery, hours — into the client bundle to use three URLs. The server
 * resolves them in layout.tsx and passes them down instead.
 */
export function SocialFab({ links }: { links: readonly SocialFabLink[] }) {
  const t = useTranslations('a11y');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
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

  return (
    <div
      ref={rootRef}
      /**
       * `bottom-[84px]` under md clears <MobileOrderBar />'s 68px bar with 16px
       * to spare; from md that bar is gone and this drops to a normal 24px
       * corner offset.
       */
      className="fixed bottom-[84px] right-4 z-fab flex flex-col items-center gap-3 md:bottom-6 md:right-6"
    >
      {/* Rendered in both states so the links keep their place in the tab order
          only when reachable: `invisible` removes them from it when closed, and
          it is what lets the open/close transition animate. */}
      <ul
        className={cn(
          'flex flex-col items-center gap-3 transition-[opacity,transform] duration-300 ease-brand',
          open ? 'visible opacity-100' : 'invisible translate-y-2 opacity-0',
        )}
      >
        {links.map((link) => (
          <li key={link.key}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-card transition-colors duration-200 hover:bg-gold-tint"
            >
              <Icon name={link.key} size={18} />
            </a>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={t('socialWidget')}
        /* Ink disc rather than the header's white one: this floats over white,
           gray-50 and the gold panel in turn, and white-on-white would need a
           ring to survive the first of those. Ink reads on all three. */
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-card transition-[background-color,transform] duration-200 ease-brand hover:bg-gray-700 active:scale-95"
      >
        <Icon name={open ? 'close' : 'chat'} size={22} />
      </button>
    </div>
  );
}
