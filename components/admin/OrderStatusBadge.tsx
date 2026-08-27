import type { OrderStatus } from '@/content/schemas';
import { ORDER_STATUS_DOT, ORDER_STATUS_LABEL } from './orderStatus';

/**
 * The same dot-plus-label shape `<StockDot />` uses on the storefront. The dot
 * is decorative — the label is the accessible content, so a colour-blind reader
 * loses nothing.
 */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm">
      <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${ORDER_STATUS_DOT[status]}`} />
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
