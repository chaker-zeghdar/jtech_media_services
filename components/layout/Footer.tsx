import { getLocale, getTranslations } from 'next-intl/server';
import { Halftone } from '@/components/brand/Halftone';
import { Logo } from '@/components/brand/LogoMark';
import { Icon } from '@/components/ui/Icon';
import { getCategories } from '@/lib/queries/categories';
import { services } from '@/content/services';
import { settings, telLink, whatsappLink } from '@/content/settings';
import { pickLocale } from '@/lib/format';
import { Container } from './Container';
import { Link } from '@/i18n/navigation';
import { categoryHref } from './navigation';

/**
 * Four columns plus a legal row, on the ink surface with a Halftone at .2 — the
 * footer's one brand device.
 *
 * PHASE 2: the three legal labels in the bottom row render as plain text because
 * /legal/terms, /legal/privacy and /legal/returns don't exist yet. A link to a
 * The category column now points at the real /categories/<slug> pages, through
 * next-intl's <Link> so the locale prefix survives.
 */
export async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations('footer');
  const tA11y = await getTranslations('a11y');
  const tContact = await getTranslations('contact');
  const tProduct = await getTranslations('product');

  const year = new Date().getFullYear();
  const categories = await getCategories();

  const helpLinks = [
    /* Still points at #contact, and that is now the honest target rather than a
       redirect: the delivery block and its per-wilaya fee table were removed
       from the page, so "delivery" means "ask us" — which is what Contact is.
       If a dedicated /delivery page is ever built, this is the one line that
       needs to change. */
    { key: 'delivery', href: '#contact' },
    { key: 'warranty', href: '#why' },
    { key: 'faq', href: '#services' },
    { key: 'why', href: '#why' },
  ] as const;

  const socials = [
    { key: 'instagram', icon: 'instagram', label: tA11y('openInstagram'), ...settings.socials.instagram },
    { key: 'facebook', icon: 'facebook', label: tA11y('openFacebook'), ...settings.socials.facebook },
    { key: 'tiktok', icon: 'tiktok', label: tA11y('openTiktok'), ...settings.socials.tiktok },
  ] as const;

  return (
    <footer className="on-ink relative overflow-hidden bg-ink text-white">
      <Halftone corner="top-end" size={200} opacity={0.2} />

      <Container className="relative z-10 py-section-sm md:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))] lg:gap-10">
          {/* Brand ------------------------------------------------------- */}
          <div className="max-w-[38ch]">
            <Logo tone="white" />
            <p className="mt-5 text-sm leading-relaxed text-gray-300">{t('about')}</p>
          </div>

          {/* Shop -------------------------------------------------------- */}
          <nav aria-labelledby="footer-shop">
            <h2 id="footer-shop" className="text-caption uppercase text-gold">
              {t('shopTitle')}
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {[...categories]
                .sort((a, b) => a.position - b.position)
                .map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={categoryHref(category.slug)}
                      className="text-sm text-gray-300 transition-colors duration-200 hover:text-white"
                    >
                      {pickLocale(category.name, locale)}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          {/* Services ---------------------------------------------------- */}
          <nav aria-labelledby="footer-services">
            <h2 id="footer-services" className="text-caption uppercase text-gold">
              {t('servicesTitle')}
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {[...services]
                .sort((a, b) => a.position - b.position)
                .map((service) => (
                  <li key={service.slug}>
                    <a
                      href="#services"
                      className="text-sm text-gray-300 transition-colors duration-200 hover:text-white"
                    >
                      {pickLocale(service.name, locale)}
                    </a>
                  </li>
                ))}
            </ul>
          </nav>

          {/* Help -------------------------------------------------------- */}
          <nav aria-labelledby="footer-help">
            <h2 id="footer-help" className="text-caption uppercase text-gold">
              {t('helpTitle')}
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {helpLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors duration-200 hover:text-white"
                  >
                    {t(`links.${link.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact ----------------------------------------------------- */}
          <div>
            <h2 id="footer-contact" className="text-caption uppercase text-gold">
              {t('contactTitle')}
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-gray-300">
              <li>
                <a
                  href={telLink}
                  aria-label={tA11y('callPhone', { phone: settings.phone })}
                  className="transition-colors duration-200 hover:text-white"
                >
                  <bdi className="num">{settings.phone}</bdi>
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink(tProduct('generalMessage'))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-white"
                >
                  {tContact('whatsapp')}
                </a>
              </li>
              <li className="text-gray-500">{pickLocale(settings.address, locale)}</li>
              <li className="text-gray-500">{pickLocale(settings.hours.weekdays, locale)}</li>
            </ul>

            <ul aria-label={tA11y('socialLinks')} className="mt-5 flex items-center gap-2">
              {socials.map((social) => (
                <li key={social.key}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-gray-300 transition-colors duration-200 hover:border-gold hover:text-gold"
                  >
                    <Icon name={social.icon} size={17} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal row ---------------------------------------------------- */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-8 text-caption text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>
            <bdi className="num">© {year}</bdi> JTECH Media Services. {t('rights')}
          </p>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <li>{t('legal.terms')}</li>
            <li>{t('legal.privacy')}</li>
            <li>{t('legal.returns')}</li>
          </ul>

          <p>{t('madeIn')}</p>
        </div>
      </Container>
    </footer>
  );
}
