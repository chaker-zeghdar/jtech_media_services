'use client';

import { useTranslations } from 'next-intl';
import type { ConfirmedOrder } from './CheckoutView';
import { Icon } from './Icon';
import { Price } from './Price';

type OrderConfirmationProps = {
  order: ConfirmedOrder;
  titleId: string;
};

/**
 * The "order received" state `<CheckoutView />` switches to once the order has
 * actually been written.
 *
 * The numbers here are the SERVER's, not the browser's: `submitOrder`
 * recomputes the unit price and the delivery fee from the database and returns
 * them, and `<CheckoutView />` puts those into this snapshot. So the total
 * shown is the total recorded, not the total the page had guessed.
 *
 * Single column rather than the two-column grid the other two views use: a
 * confirmation is one message, not a form beside a summary, and forcing it
 * into that grid would leave an empty second column.
 */
export function OrderConfirmation({ order, titleId }: OrderConfirmationProps) {
  const t = useTranslations('checkout');

  return (
    <div className="col-span-full flex flex-col items-center py-4 text-center">
      <span
        aria-hidden="true"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold-tint text-gold-text"
      >
        <Icon name="check" size={28} />
      </span>

      <h2 id={titleId} className="mt-5 text-h2 font-semibold">
        {t('confirmedTitle')}
      </h2>
      <p className="mt-2 max-w-[46ch] text-base text-gray-700">{t('confirmedBody')}</p>

      {/* The real database id, shortened. A customer quoting an order over
          WhatsApp needs something they can actually read back, and eight hex
          characters are both unambiguous at this volume and short enough to
          say out loud — the full uuid is neither. Uppercased and `num`-classed
          so it reads as a reference code rather than as prose. */}
      <p className="mt-6 text-caption uppercase text-gray-700">
        {t('orderRef')}{' '}
        <bdi className="num font-semibold text-ink">{order.orderId.slice(0, 8).toUpperCase()}</bdi>
      </p>

      <dl className="mt-4 w-full max-w-[420px] rounded-card border border-gray-300 p-5 text-start">
        <h3 className="text-caption uppercase text-gray-700">{t('summaryTitle')}</h3>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <dt className="text-sm text-gray-700">
              {order.productName}
              <span className="block text-caption text-gray-500">
                {order.variantLabel}
                {' × '}
                <bdi className="num">{order.quantity}</bdi>
              </span>
            </dt>
          </div>

          <div className="flex items-baseline justify-between gap-4 border-t border-gray-300 pt-3">
            <dt className="text-sm text-gray-700">{t('deliveryFeeLabel')}</dt>
            <dd className="text-sm font-medium">
              <Price value={order.deliveryFee} size="sm" />
            </dd>
          </div>

          <div className="flex items-baseline justify-between gap-4 border-t border-gray-300 pt-3">
            <dt className="text-base font-semibold">{t('totalLabel')}</dt>
            <dd>
              <Price value={order.total} size="md" />
            </dd>
          </div>

          <div className="flex flex-col gap-1 border-t border-gray-300 pt-3 text-sm text-gray-700">
            <p>{order.wilayaLabel}</p>
            <p>{order.name}</p>
            <p>
              <bdi>{order.phone}</bdi>
            </p>
            {order.address ? <p>{order.address}</p> : null}
          </div>
        </div>
      </dl>
    </div>
  );
}
