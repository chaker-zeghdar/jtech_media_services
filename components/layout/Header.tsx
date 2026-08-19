import { getLocale, getTranslations } from 'next-intl/server';
import { Logo } from '@/components/brand/LogoMark';
import { Icon } from '@/components/ui/Icon';
import { categories } from '@/content/categories';
import { settings, telLink, whatsappLink } from '@/content/settings';
import { Link } from '@/i18n/navigation';
import { pickLocale } from '@/lib/format';
import { Container } from './Container';
import { HeaderShell } from './HeaderShell';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileMenu } from './MobileMenu';
import { categoryHref } from './navigation';

/**
 * Global header: brand, the five category entries, and two real contact
 * affordances.
 *
 * STICKY. The categories and the language switcher are controls, and a shop
 * where people compare five phones down a long page needs them reachable without
 * scrolling back to the top. This is now the page's only top chrome: the old
 * announcement bar's phone, WhatsApp and locale switcher all live here, and its
 * delivery/cash-on-delivery promise is stated in the hero's own subhead.
 *
 * Worth recording, since apple.com/store is this project's reference: Apple's own
 * #globalnav is `position: absolute` and scrolls away permanently — the same
 * failure this fixes. What is worth taking from Apple is the visual language, not
 * the scroll behaviour.
 *
 * ── Transparent over the hero ───────────────────────────────────────────────
 *
 * <HeaderShell /> paints this bar transparent while it is sitting on the hero
 * card and solid white once the page scrolls past it. The reference design puts
 * its nav inside the hero card with no bar at all; it also lets that nav scroll
 * away for good, which is the part not worth copying. Transparent-until-scrolled
 * is how the page gets the reference's opening without giving up a reachable nav
 * on a page this long.
 *
 * The shell is the only client code here. This component stays a server
 * component: category names are resolved here and passed down as plain strings,
 * so neither the menu nor the shell ever touches the content layer on the client.
 *
 * ── Contrast over the hero ──────────────────────────────────────────────────
 *
 * The hero gradient is now full `--color-gold` at its top edge, which is exactly
 * where this bar sits. The `text-gray-700` these links use on white measures
 * **2.46:1** there and fails AA outright, so the over-hero state switches them
 * to ink (8.07:1). This is not a stylistic nicety — it is the reason the state
 * has a text colour at all, and it must not be "simplified" back to one colour.
 *
 * ── The right-hand cluster ──────────────────────────────────────────────────
 *
 * The reference fills this slot with search, account, wishlist and bag. None of
 * those exist here — JTECH is a WhatsApp-driven catalog with no accounts, no
 * cart and no site search — so inventing them would put four controls in the
 * header that lead nowhere. It carries the two contact routes the business
 * actually runs on instead. Sparser than the reference, but every icon works.
 *
 * It still does NOT repeat the phone number as text, which stays in the
 * announcement bar.
 */
export async function Header() {
  const locale = await getLocale();
  const t = await getTranslations('a11y');
  const tProduct = await getTranslations('product');

  const items = [...categories]
    .sort((a, b) => a.position - b.position)
    .map((category) => ({
      slug: category.slug,
      name: pickLocale(category.name, locale),
      href: categoryHref(category.slug),
    }));

  /**
   * A white disc on the gold surface, a grey one once the bar itself is white — in
   * both states the glyph is ink, so this only ever changes the disc behind it.
   * White rather than a translucent white on purpose: every colour in this
   * palette is a bare `var()` with no `<alpha-value>` placeholder, so Tailwind
   * silently drops `bg-white/70` and the disc would have come out with no
   * background at all. Solid white also matches the hero's own social chips
   * directly below, which is the effect that was wanted anyway.
   */
  const iconButton =
    'inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors duration-200 ' +
    'bg-gray-50 hover:bg-gray-100 group-data-[over-hero]:bg-white group-data-[over-hero]:hover:bg-gray-50';

  return (
    <HeaderShell>
      {/* Three tracks rather than `justify-between`: the reference centres its
          nav on the page, and centring on the container only looks right if the
          two flanks are forced to equal width. `1fr auto 1fr` does that no
          matter how wide the logo or the cluster get. Under lg the nav is inside
          <MobileMenu />, so the row collapses back to a simple flex. */}
      <Container className="flex h-16 items-center justify-between gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        {/* Gold on the gradient's gold top edge is invisible, not merely
            low-contrast, so over the hero the mark takes the link's own colour
            instead. `markTone="current"` is <Logo />'s API for exactly this —
            DESIGN.md §7 forbids overriding a component's colour through
            `className`, and the state that decides it is client-side, so it
            cannot be a static prop either. The wordmark carries its own ink. */}
        <Link
          href="/"
          aria-label={t('logo')}
          className="shrink-0 justify-self-start text-gold group-data-[over-hero]:text-ink"
        >
          <Logo markTone="current" />
        </Link>

        <nav aria-label={t('primaryNav')} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.slug}>
                <Link
                  href={item.href}
                  className="block whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:text-ink group-data-[over-hero]:text-ink group-data-[over-hero]:hover:bg-white"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2 justify-self-end">
          {/* The two contact routes, as icon buttons. Both are external and both
              already have their own accessible names in `a11y`, so no new
              message keys. */}
          <a
            href={whatsappLink(tProduct('generalMessage'))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('openWhatsapp')}
            className={`hidden sm:inline-flex ${iconButton}`}
          >
            <Icon name="whatsapp" size={17} />
          </a>

          <a
            href={telLink}
            aria-label={t('callPhone', { phone: settings.phone })}
            className={`hidden sm:inline-flex ${iconButton}`}
          >
            <Icon name="phone" size={17} />
          </a>

          {/* Same breakpoint as the category nav above. Under lg the switcher
              lives inside <MobileMenu />, which the sticky header keeps
              reachable. */}
          <LocaleSwitcher className="hidden lg:block" />
          <MobileMenu categories={items} />
        </div>
      </Container>
    </HeaderShell>
  );
}
