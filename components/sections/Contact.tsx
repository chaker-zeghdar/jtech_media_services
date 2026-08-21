import { getLocale, getTranslations } from 'next-intl/server';
import { GoldOrb } from '@/components/brand/GoldOrb';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { mailLink, ordersDepartment, settings, telHref, whatsappLink } from '@/content/settings';
import { pickLocale } from '@/lib/format';

/**
 * Section — contact. Brand device: none, deliberately. This is the section a
 * customer reads when they've decided; a gold shape competing with a phone number
 * is a shape in the way.
 *
 * The three department numbers are listed separately and labelled, because they
 * are not interchangeable — the branding line does not take repair enquiries.
 * Only the orders line carries the WhatsApp entry.
 */
export async function Contact() {
  const locale = await getLocale();
  const t = await getTranslations('contact');
  const tA11y = await getTranslations('a11y');
  const tProduct = await getTranslations('product');

  const orders = ordersDepartment();

  const socials = [
    {
      key: 'instagram',
      icon: 'instagram',
      label: tA11y('openInstagram'),
      followers: settings.socialProof.instagram,
      ...settings.socials.instagram,
    },
    {
      key: 'facebook',
      icon: 'facebook',
      label: tA11y('openFacebook'),
      followers: settings.socialProof.facebook,
      ...settings.socials.facebook,
    },
    {
      key: 'tiktok',
      icon: 'tiktok',
      label: tA11y('openTiktok'),
      followers: settings.socialProof.tiktok,
      ...settings.socials.tiktok,
    },
  ] as const;

  return (
    <Section
      id="contact"
      background="white"
      /* The page's second (and last) <GoldOrb />. Contact was documented as
         deliberately device-free — "a gold shape competing with a phone number
         is a shape in the way" — and that reasoning held while this section
         FOLLOWED the full-bleed gold delivery panel. That panel is gone, and
         with it the page's one loud gold moment; the closing section now ends a
         long page on plain white.
         `bottom-end` puts it in the corner gutter below the map, which is the
         only part of this section with no text in it. Verified clear of the
         details list, the map caption and the socials. */
      device={<GoldOrb corner="bottom-end" size={340} opacity={0.45} />}
    >
      <Container>
        <SectionHeader id="contact" title={t('title')} subhead={t('subhead')} />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          {/* ---- Details -------------------------------------------------- */}
          <Reveal>
            {/* A <dl> may only contain dt/dd (optionally wrapped in one div), so
                the row icon lives INSIDE the <dt> rather than as a sibling of it.
                `ps-9` (icon 20px + 16px gap) lines the value up under the label,
                and being a logical property it mirrors in RTL for free. */}
            <dl className="flex flex-col divide-y divide-gray-300 border-y border-gray-300">
              <div className="py-5">
                <dt className="flex items-center gap-4 text-caption uppercase text-gray-700">
                  <Icon name="phone" size={20} className="shrink-0 text-gold-text" />
                  {t('departments')}
                </dt>
                <dd className="mt-2 ps-9">
                  <ul className="flex flex-col gap-3">
                    {settings.departments.map((department) => (
                      <li key={department.key} className="flex flex-col gap-0.5">
                        <a
                          href={telHref(department.phoneE164)}
                          aria-label={tA11y('callPhone', { phone: department.phone })}
                          className="text-base font-semibold transition-colors duration-200 hover:text-gold-text"
                        >
                          <bdi className="num">{department.phone}</bdi>
                        </a>
                        <span className="text-caption text-gray-700">
                          {pickLocale(department.label, locale)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>

              <div className="py-5">
                <dt className="flex items-center gap-4 text-caption uppercase text-gray-700">
                  <Icon name="whatsapp" size={20} className="shrink-0 text-gold-text" />
                  {t('whatsapp')}
                </dt>
                <dd className="mt-1 ps-9 text-base font-semibold">
                  <a
                    href={whatsappLink(tProduct('generalMessage'))}
                    target="_blank"
                    rel="noopener noreferrer"
                    // The visible text is the number, so the accessible name has
                    // to contain it — otherwise voice control can't target the
                    // link by what the user can see (WCAG 2.5.3).
                    aria-label={`${tA11y('openWhatsapp')} ${orders.phone}`}
                    className="transition-colors duration-200 hover:text-gold-text"
                  >
                    <bdi className="num">{orders.phone}</bdi>
                  </a>
                </dd>
              </div>

              <div className="py-5">
                <dt className="flex items-center gap-4 text-caption uppercase text-gray-700">
                  <Icon name="mail" size={20} className="shrink-0 text-gold-text" />
                  {t('email')}
                </dt>
                <dd className="mt-1 break-words ps-9 text-base font-semibold">
                  <a
                    href={mailLink}
                    aria-label={tA11y('sendEmail', { email: settings.email })}
                    className="font-latin transition-colors duration-200 hover:text-gold-text"
                    dir="ltr"
                  >
                    {settings.email}
                  </a>
                </dd>
              </div>

              <div className="py-5">
                <dt className="flex items-center gap-4 text-caption uppercase text-gray-700">
                  <Icon name="external" size={20} className="shrink-0 text-gold-text" />
                  {t('website')}
                </dt>
                <dd className="mt-1 break-words ps-9 text-base font-semibold">
                  <a
                    href={settings.website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-latin transition-colors duration-200 hover:text-gold-text"
                    dir="ltr"
                  >
                    {settings.website.label}
                  </a>
                </dd>
              </div>

              <div className="py-5">
                <dt className="flex items-center gap-4 text-caption uppercase text-gray-700">
                  <Icon name="pin" size={20} className="shrink-0 text-gold-text" />
                  {t('address')}
                </dt>
                <dd className="mt-1 ps-9 text-base">{pickLocale(settings.address, locale)}</dd>
              </div>

              <div className="py-5">
                <dt className="flex items-center gap-4 text-caption uppercase text-gray-700">
                  <Icon name="clock" size={20} className="shrink-0 text-gold-text" />
                  {t('hours')}
                </dt>
                <dd className="mt-1 ps-9 text-base">
                  {pickLocale(settings.hours.weekdays, locale)}
                  <span className="mt-1 block text-sm text-gray-700">
                    {pickLocale(settings.hours.closed, locale)}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <h3 className="text-caption uppercase text-gray-700">{t('follow')}</h3>
              <ul
                id="social"
                data-anchor
                aria-label={tA11y('socialLinks')}
                className="mt-4 flex flex-wrap items-center gap-2.5"
              >
                {socials.map((social) => (
                  <li key={social.key}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="inline-flex items-center gap-2.5 rounded-full border border-gray-300 py-2 pe-4 ps-3 text-ink transition-[background-color,border-color] duration-200 hover:border-gold hover:bg-gold-tint"
                    >
                      <Icon name={social.icon} size={18} />
                      {/* Plain text, never an animated counter — see DESIGN.md. */}
                      <bdi className="num text-caption font-semibold">
                        {Math.round(social.followers / 1000)}K+
                      </bdi>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Both notices are removed by flipping the matching flag in
                content/settings.ts once the client confirms. */}
            {!settings.emailConfirmed ? (
              <p className="mt-8 rounded-card border border-gold bg-gold-tint px-4 py-3 text-caption text-gold-text">
                {t('emailNotice')}
              </p>
            ) : null}
          </Reveal>

          {/* ---- Map ------------------------------------------------------ */}
          <Reveal delayMs={120} className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-card border border-gray-300 bg-gray-50">
              <iframe
                src={settings.mapEmbedUrl}
                title={tA11y('mapTitle')}
                // Explicit dimensions + aspect-ratio wrapper: no layout shift when
                // the frame loads, and it never blocks first paint.
                width={800}
                height={520}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block aspect-[8/5] h-auto w-full border-0"
              />
            </div>

            {!settings.mapPinConfirmed ? (
              <p className="text-caption text-gray-700">{t('mapNotice')}</p>
            ) : null}

            <Button variant="link" href={settings.mapLinkUrl} external>
              {t('mapCta')}
            </Button>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
