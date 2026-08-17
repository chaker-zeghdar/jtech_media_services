import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { settings, telLink, whatsappLink } from '@/content/settings';

/**
 * Fixed bottom action bar under 768px — order on WhatsApp, or call.
 *
 * Most of this traffic is a phone in someone's hand, and the two things they want
 * are always one tap away rather than a scroll back to the header. The page shell
 * reserves 68px of bottom padding below 768px so this never covers the footer.
 */
export function MobileOrderBar() {
  const t = useTranslations('nav');
  const tA11y = useTranslations('a11y');
  const tProduct = useTranslations('product');

  return (
    <div className="fixed inset-x-0 bottom-0 z-bar border-t border-gray-300 bg-white/95 backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <a
          href={whatsappLink(tProduct('generalMessage'))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
        >
          <Icon name="whatsapp" size={17} />
          {t('order')}
        </a>

        <a
          href={telLink}
          aria-label={tA11y('callPhone', { phone: settings.phone })}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-ink"
        >
          <Icon name="phone" size={19} />
        </a>
      </div>
    </div>
  );
}
