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
 * The client-side "order received" state `<CheckoutView />` switches to on a
 * valid submit. Reads real, honest as far as it goes — the numbers and details
 * shown are exactly what was entered — but nothing behind it sent anything
 * anywhere; see the PHASE 3 note on `CheckoutView.handleSubmit`.
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

      <dl className="mt-8 w-full max-w-[420px] rounded-card border border-gray-300 p-5 text-start">
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
