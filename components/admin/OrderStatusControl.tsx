'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { setOrderStatus } from '@/app/(admin)/admin/actions';
import type { OrderStatus } from '@/content/schemas';
import { ORDER_STATUS_LABEL } from './orderStatus';
import { ADMIN_INPUT, ADMIN_LABEL } from './styles';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'delivered', 'canceled'];

export function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  /* Optimistic local value so the select doesn't snap back to the server value
     for the duration of the round trip. Reverted if the write fails. */
  const [value, setValue] = useState<OrderStatus>(status);

  function change(next: OrderStatus) {
    const previous = value;
    setValue(next);
    setError(null);

    startTransition(async () => {
      try {
        await setOrderStatus(orderId, next);
        router.refresh();
      } catch (err) {
        setValue(previous);
        setError(err instanceof Error ? err.message : 'تعذّر تحديث الحالة');
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="order-status" className={ADMIN_LABEL}>
        الحالة
      </label>
      <select
        id="order-status"
        value={value}
        disabled={pending}
        onChange={(event) => change(event.target.value as OrderStatus)}
        className={ADMIN_INPUT}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {error ? (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
