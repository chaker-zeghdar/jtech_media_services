import { getLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { mailLink, settings, telLink, whatsappLink } from '@/content/settings';
import { pickLocale } from '@/lib/format';

/**
 * Section 11 — contact. Brand device: none, deliberately. This is the section a
 * customer reads when they've decided; a gold shape competing with a phone number
 * is a shape in the way.
 */
export async function Contact() {
  const locale = await getLocale();
  const t = await getTranslations('contact');
  const tA11y = await getTranslations('a11y');
  const tProduct = await getTranslations('product');

  const socials = [
    {
      key: 'instagram',
      icon: 'instagram',
      label: tA11y('openInstagram'),
      ...settings.socials.instagram,
    },
    {
      key: 'facebook',
      icon: 'facebook',
      label: tA11y('openFacebook'),
      ...settings.socials.facebook,
    },
    { key: 'tiktok', icon: 'tiktok', label: tA11y('openTiktok'), ...settings.socials.tiktok },
  ] as const;

  return (
    <Section id="contact" background="white">
      <Container>
        <SectionHeader id="contact" title={t('title')} subhead={t('subhead')} />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          {/* ---- Details -------------------------------------------------- */}
          <Reveal>
            <dl className="flex flex-col divide-y divide-gray-300 border-y border-gray-300">
              <div className="flex items-start gap-4 py-5">
                <Icon name="phone" size={20} className="mt-0.5 text-gold-text" />
                <div className="min-w-0 flex-1">
                  <dt className="text-caption uppercase text-gray-500">{t('phone')}</dt>
                  <dd className="mt-1 text-base font-semibold">
                    <a
                      href={telLink}
                      aria-label={tA11y('callPhone', { phone: settings.phone })}
                      className="transition-colors duration-200 hover:text-gold-text"
                    >
                      <bdi className="num">{settings.phone}</bdi>
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-4 py-5">
                <Icon name="whatsapp" size={20} className="mt-0.5 text-gold-text" />
                <div className="min-w-0 flex-1">
                  <dt className="text-caption uppercase text-gray-500">{t('whatsapp')}</dt>
                  <dd className="mt-1 text-base font-semibold">
                    <a
                      href={whatsappLink(tProduct('generalMessage'))}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={tA11y('openWhatsapp')}
                      className="transition-colors duration-200 hover:text-gold-text"
                    >
                      <bdi className="num">{settings.phone}</bdi>
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-4 py-5">
                <Icon name="mail" size={20} className="mt-0.5 text-gold-text" />
                <div className="min-w-0 flex-1">
                  <dt className="text-caption uppercase text-gray-500">{t('email')}</dt>
                  <dd className="mt-1 break-words text-base font-semibold">
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
              </div>

              <div className="flex items-start gap-4 py-5">
                <Icon name="pin" size={20} className="mt-0.5 text-gold-text" />
                <div className="min-w-0 flex-1">
                  <dt className="text-caption uppercase text-gray-500">{t('address')}</dt>
                  <dd className="mt-1 text-base">{pickLocale(settings.address, locale)}</dd>
                </div>
              </div>

              <div className="flex items-start gap-4 py-5">
                <Icon name="clock" size={20} className="mt-0.5 text-gold-text" />
                <div className="min-w-0 flex-1">
                  <dt className="text-caption uppercase text-gray-500">{t('hours')}</dt>
                  <dd className="mt-1 text-base">
                    {pickLocale(settings.hours.weekdays, locale)}
                    <span className="mt-1 block text-sm text-gray-500">
                      {pickLocale(settings.hours.closed, locale)}
                    </span>
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-8">
              <h3 className="text-caption uppercase text-gray-500">{t('follow')}</h3>
              <ul aria-label={tA11y('socialLinks')} className="mt-4 flex items-center gap-2.5">
                {socials.map((social) => (
                  <li key={social.key}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-ink transition-[background-color,border-color] duration-200 hover:border-gold hover:bg-gold-tint"
                    >
                      <Icon name={social.icon} size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Removed once settings.placeholderContacts flips to false. */}
            {settings.placeholderContacts ? (
              <p className="mt-8 rounded-card border border-gold bg-gold-tint px-4 py-3 text-caption text-gold-text">
                {t('placeholderNotice')}
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

            <Button variant="link" href={settings.mapLinkUrl} external>
              {t('mapCta')}
            </Button>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
