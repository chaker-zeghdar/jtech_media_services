'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon, type AnyIconKey } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

export type SocialFabLink = {
  key: 'instagram' | 'facebook' | 'tiktok';
  url: string;
  label: string;
};

/** A staffed line, rendered as a labelled pill rather than a plain icon circle. */
export type SocialFabPhoneLink = {
  key: string;
  href: string;
  /** Accessible name — includes the number, see the `aria-label` note below. */
  label: string;
  /** Short visible text on the pill: "واتساب", not the full department label. */
  shortLabel: string;
  icon: AnyIconKey;
  /** WhatsApp opens in a new tab; plain `tel:` lines navigate in place. */
  external?: boolean;
};

/**
 * Floating widget — a round trigger pinned to the viewport corner that expands
 * to the shop's three social accounts and its three staffed phone lines.
 *
 * ── Phones joined the socials here ─────────────────────────────────────────
 *
 * This used to be social-only: phone and WhatsApp had their own dedicated
 * affordances (the header's icon buttons, <MobileOrderBar /> on mobile), so
 * repeating them here would have been a third copy of the same two links.
 * <MobileOrderBar /> is gone now at the client's request, and <Header /> hides
 * its own phone/WhatsApp buttons below `sm` — which left mobile with no
 * persistent ordering affordance at all. This widget was the natural place to
 * close that gap (flagged as such in layout.tsx when the bar was removed), so
 * it now renders two visually distinct groups: labelled pills for the phone
 * lines (a bare icon can't carry a phone number), plain icon circles for the
 * socials, phones listed first since calling to order is the higher-intent
 * action of the two.
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
 * delivery, hours — into the client bundle to use a handful of URLs. The
 * server resolves them in layout.tsx and passes them down instead.
 */
export function SocialFab({
  links,
  phones,
}: {
  links: readonly SocialFabLink[];
  phones: readonly SocialFabPhoneLink[];
}) {
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
      /* `dir="ltr"` alongside the physical `right-*` below: the pill row now
         holds variable-width department pills, not uniform circles, so their
         alignment has to stay physically right too, or `items-end` would flip
         to the visual left under the page's `dir="rtl"` and drift away from a
         trigger button that never moves. Forcing ltr here makes "end" reliably
         mean "right" for this one subtree — Arabic pill text still renders
         correctly inside it, the same way `dir="ltr"` + `<bdi>` already isolate
         Latin/numeral runs elsewhere in this codebase. */
      dir="ltr"
      /* <MobileOrderBar /> is gone, so this no longer needs a taller mobile
         offset to clear its 68px bar — one corner offset at every breakpoint. */
      /* `pointer-events-none` on the ROOT, re-enabled on the two things that are
         actually tappable. Without it this widget silently ate taps on the page
         behind it.

         The collapsed stack is `invisible`, not `hidden`, so the open/close
         transition can animate — and `visibility: hidden` keeps an element's
         LAYOUT. So even closed, this column measures 93x392px on a 390x664
         phone: 56px of trigger and 336px of stack nobody can see. A div with no
         background still hit-tests across its whole box, so that invisible
         column was swallowing every tap in the bottom-right quadrant.

         It went unnoticed for so long because it is invisible in both senses
         and because the site is built LTR-first: this widget is pinned
         physically right (see the note above), so in French and English it
         floats over the empty gutter beside the content column. Under Arabic
         the page mirrors and the widget does not, which puts it directly on top
         of the controls — the product page's colour swatches sit at x=256..348
         inside its x=281..374 box, and two of every three were untappable in
         Arabic while all three worked in French and English. */
      className="pointer-events-none fixed bottom-6 right-4 z-fab flex flex-col items-center gap-4 md:right-6"
    >
      {/* Rendered in both states so the links keep their place in the tab order
          only when reachable: `invisible` removes them from it when closed, and
          it is what lets the open/close transition animate.

          Two groups, not six identical circles: phones need a visible number
          and label, socials don't, so phones are labelled pills and socials
          stay bare icon circles — shape alone tells them apart. Phones sit
          above socials, closer to the top of the expanded stack, since calling
          to order is the higher-intent action of the two. */}
      <div
        className={cn(
          'pointer-events-auto flex flex-col items-end gap-4 transition-[opacity,transform] duration-300 ease-brand',
          open ? 'visible opacity-100' : 'invisible translate-y-2 opacity-0',
        )}
      >
        <ul className="flex flex-col items-end gap-2.5">
          {phones.map((phone) => (
            <li key={phone.key}>
              <a
                href={phone.href}
                {...(phone.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                aria-label={phone.label}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white ps-3 pe-4 text-ink shadow-card transition-colors duration-200 hover:bg-gold-tint"
              >
                <Icon name={phone.icon} size={16} />
                <bdi className="text-caption font-semibold">{phone.shortLabel}</bdi>
              </a>
            </li>
          ))}
        </ul>

        <ul className="flex flex-col items-center gap-2.5">
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
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={t('socialWidget')}
        /* Ink disc rather than the header's white one: this floats over white,
           gray-50 and the gold panel in turn, and white-on-white would need a
           ring to survive the first of those. Ink reads on all three. */
        className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-card transition-[background-color,transform] duration-200 ease-brand hover:bg-gray-700 active:scale-95"
      >
        <Icon name={open ? 'close' : 'chat'} size={22} />
      </button>
    </div>
  );
}
