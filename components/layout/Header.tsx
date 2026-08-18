import { getLocale, getTranslations } from 'next-intl/server';
import { Logo } from '@/components/brand/LogoMark';
import { categories } from '@/content/categories';
import { Link } from '@/i18n/navigation';
import { pickLocale } from '@/lib/format';
import { Container } from './Container';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileMenu } from './MobileMenu';
import { categoryHref } from './navigation';

/**
 * Global header: brand plus the five category entries.
 *
 * STICKY. The categories and the language switcher are controls, and a shop
 * where people compare five phones down a long page needs them reachable without
 * scrolling back to the top. <AnnouncementBar /> above is delivery/COD/phone
 * facts rather than controls, so it is left to scroll away.
 *
 * Worth recording, since apple.com/store is this project's reference: Apple's own
 * #globalnav is `position: absolute` and scrolls away permanently — the same
 * failure this fixes. What is worth taking from Apple is the visual language, not
 * the scroll behaviour.
 *
 * It still does NOT repeat the phone number, which stays in the announcement bar.
 *
 * A server component; the only client JS it pulls in is <LocaleSwitcher /> and
 * <MobileMenu />, both of which need state. Category names are resolved here and
 * passed down as plain strings so the menu never touches the content layer on the
 * client.
 */
export async function Header() {
  const locale = await getLocale();
  const t = await getTranslations('a11y');

  const items = [...categories]
    .sort((a, b) => a.position - b.position)
    .map((category) => ({
      slug: category.slug,
      name: pickLocale(category.name, locale),
      href: categoryHref(category.slug),
    }));

  return (
    <header className="sticky top-0 z-nav hairline-b bg-white">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label={t('logo')} className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label={t('primaryNav')} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.slug}>
                <a
                  href={item.href}
                  className="block rounded-full px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:text-ink"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {/* Same breakpoint as the category nav above. Under lg the switcher
              lives inside <MobileMenu />, which the sticky header keeps
              reachable. */}
          <LocaleSwitcher className="hidden lg:block" />
          <MobileMenu categories={items} />
        </div>
      </Container>
    </header>
  );
}
