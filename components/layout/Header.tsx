import { getLocale, getTranslations } from 'next-intl/server';
import { Logo } from '@/components/brand/LogoMark';
import { categories } from '@/content/categories';
import { Link } from '@/i18n/navigation';
import { pickLocale } from '@/lib/format';
import { Container } from './Container';
import { MobileMenu } from './MobileMenu';
import { categoryHref } from './navigation';

/**
 * Global header: brand plus the five category entries.
 *
 * Deliberately does NOT repeat the phone number or the locale switcher — both
 * live in the <AnnouncementBar /> directly above, and showing them twice on
 * desktop reads as a bug rather than as emphasis.
 *
 * A server component; the only client JS it pulls in is <MobileMenu />, which
 * needs state. Category names are resolved here and passed down as plain strings
 * so the menu never touches the content layer on the client.
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
    <header className="hairline-b bg-white">
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

        <MobileMenu categories={items} />
      </Container>
    </header>
  );
}
