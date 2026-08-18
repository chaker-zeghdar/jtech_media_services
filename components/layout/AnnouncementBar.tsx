import { useTranslations } from 'next-intl';
import { settings, telLink } from '@/content/settings';
import { Icon } from '@/components/ui/Icon';
import { Container } from './Container';

/**
 * The three facts that decide whether an Algerian visitor keeps reading: we ship
 * to your wilaya, you pay on arrival, and here's a number you can call.
 *
 * Deliberately NOT sticky, and deliberately no longer carrying the locale
 * switcher — that moved to the sticky <Header />. These are facts, not controls,
 * so scrolling them away costs nothing; scrolling the language switcher away cost
 * the reader the only way to change language.
 */
export function AnnouncementBar() {
  const t = useTranslations('announcement');

  return (
    <div className="on-ink bg-ink text-white">
      <Container className="flex h-[34px] items-center justify-between gap-4">
        <ul className="flex items-center gap-3 overflow-hidden text-caption text-gray-300 sm:gap-5">
          <li className="flex shrink-0 items-center gap-1.5">
            <Icon name="truck" size={14} className="text-gold" />
            <span className="whitespace-nowrap">{t('delivery')}</span>
          </li>
          <li aria-hidden="true" className="hidden h-3 w-px shrink-0 bg-white/20 sm:block" />
          <li className="hidden shrink-0 items-center gap-1.5 sm:flex">
            <Icon name="cash" size={14} className="text-gold" />
            <span className="whitespace-nowrap">{t('cod')}</span>
          </li>
          <li aria-hidden="true" className="hidden h-3 w-px shrink-0 bg-white/20 md:block" />
          <li className="hidden shrink-0 md:block">
            {/* No aria-label: the visible text already reads "call us <number>",
                and an aria-label that omits the visible words would make the link
                untargetable by voice control (WCAG 2.5.3). */}
            <a
              href={telLink}
              className="flex items-center gap-1.5 transition-colors duration-200 hover:text-white"
            >
              <Icon name="phone" size={14} className="text-gold" />
              <span className="whitespace-nowrap">{t('call')}</span>
              <bdi className="num">{settings.phone}</bdi>
            </a>
          </li>
        </ul>
      </Container>
    </div>
  );
}
