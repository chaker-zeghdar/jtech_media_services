import { getLocale, getTranslations } from 'next-intl/server';
import type { Product } from '@/content/schemas';
import { whatsappLink } from '@/content/contact';
import { cn } from '@/lib/cn';
import { pickLocale } from '@/lib/format';
import { priceFrom, primaryVariant } from '@/lib/product';
import { Badge } from './Badge';
import { Icon } from './Icon';
import { Price } from './Price';
import { ProductImage } from './ProductImage';
import { QuickViewTrigger } from './QuickViewTrigger';
import { StockDot } from './StockDot';

type ProductCardProps = {
  product: Product;
  /** Passed through to next/image. Required — see ProductImage. */
  sizes?: string;
  /**
   * Mounts the quick-view island. Only the best-sellers grid enables it; the
   * carousels ship as pure static markup.
   */
  quickView?: boolean;
  className?: string;
};

/**
 * The component that decides whether the site looks real.
 *
 * A **server component**. All of the choreography below is CSS on the card's
 * `group`, so the card needs no JavaScript at all:
 *   bed         gray-50 → gold-tint
 *   light sweep one diagonal white pass over 600ms (globals.css)
 *   product     lifts 6px and rotates −1deg
 *   spec pills  fade in along the bottom of the bed
 *   order       slides up from the card's bottom edge
 *
 * Every reveal is also bound to `group-focus-within`, so a keyboard user gets the
 * same affordances a mouse user does — a hover-only control is an inaccessible
 * control.
 *
 * Only <QuickViewTrigger /> is a client island, and only where quick view is
 * actually offered. Hydrating every card wholesale cost main-thread time for one
 * boolean per card.
 *
 * PHASE 2: `order` deep-links to WhatsApp with the product name prefilled,
 * because there is no cart yet. Swap the <a> for an addToCart handler and
 * nothing else about this component needs to change.
 */
export async function ProductCard({
  product,
  sizes = '(max-width: 639px) 78vw, (max-width: 1023px) 44vw, (max-width: 1439px) 30vw, 300px',
  quickView = false,
  className,
}: ProductCardProps) {
  const locale = await getLocale();
  const t = await getTranslations('product');

  const name = pickLocale(product.name, locale);
  const variant = primaryVariant(product);
  const lowest = priceFrom(product);
  const specPills = product.specs.slice(0, 2);

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-card pb-14',
        className,
      )}
    >
      {/* ---- Image bed --------------------------------------------------- */}
      <div
        className={cn(
          'light-sweep relative isolate aspect-[4/5] overflow-hidden rounded-card bg-gray-50',
          'transition-colors duration-500 ease-brand',
          'group-hover:bg-gold-tint group-focus-within:bg-gold-tint',
        )}
      >
        {product.badges.length > 0 ? (
          <ul className="absolute start-3.5 top-3.5 z-20 flex flex-col items-start gap-1.5">
            {product.badges.map((badge) => (
              <li key={badge}>
                <Badge badge={badge} />
              </li>
            ))}
          </ul>
        ) : null}

        <div
          className={cn(
            'absolute inset-0 z-10 flex items-center justify-center p-8',
            'transition-transform duration-500 ease-brand',
            'group-hover:-translate-y-1.5 group-hover:-rotate-1',
            'group-focus-within:-translate-y-1.5 group-focus-within:-rotate-1',
          )}
        >
          <ProductImage
            src={variant.images[0]}
            name={name}
            width={420}
            height={420}
            sizes={sizes}
            className="drop-shadow-product"
          />
        </div>

        {specPills.length > 0 ? (
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-x-3.5 bottom-3.5 z-20 flex flex-wrap justify-center gap-1.5',
              'opacity-0 transition-opacity duration-500 ease-brand',
              'group-hover:opacity-100 group-focus-within:opacity-100',
            )}
          >
            {specPills.map((spec) => (
              <bdi
                key={spec.key}
                className="num rounded-full bg-white/90 px-2.5 py-1 text-caption text-gray-700"
              >
                {spec.value}
              </bdi>
            ))}
          </div>
        ) : null}

        {quickView ? (
          <QuickViewTrigger
            product={product}
            label={t('quickView')}
            ariaLabel={t('quickViewOpen', { product: name })}
          />
        ) : null}
      </div>

      {/* ---- Info -------------------------------------------------------- */}
      <div className="mt-5 flex flex-1 flex-col items-start gap-2">
        {/* ink/70, not gray-700: where a CornerBlob tints the section bed
            (#F5F5F7 + 8% gold = #F5EFE7), gray-700 measures 4.43:1 at 12px and
            misses AA. This clears 5.8:1 on white, gray and tinted beds alike. */}
        <p className="text-caption uppercase text-ink/70">{product.brand}</p>
        <h3 className="text-base font-semibold leading-snug">{name}</h3>
        <div className="mt-auto pt-2">
          <Price value={lowest} compareAt={lowest === variant.price ? variant.compareAt : null} />
        </div>
        <StockDot status={variant.stock} />
      </div>

      {/* ---- Order: slides up from the card's bottom edge ----------------
          The 56px of pb on the card reserves this strip, so the reveal costs
          no layout shift. */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-20 pt-2',
          'translate-y-full opacity-0 transition-[transform,opacity] duration-300 ease-brand',
          'group-hover:translate-y-0 group-hover:opacity-100',
          'group-focus-within:translate-y-0 group-focus-within:opacity-100',
        )}
      >
        <a
          href={whatsappLink(t('orderMessage', { product: name }))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-gray-700"
        >
          <Icon name="whatsapp" size={16} />
          {t('order')}
          <span className="sr-only">— {name}</span>
        </a>
      </div>
    </article>
  );
}
