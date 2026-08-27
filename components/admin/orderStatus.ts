import type { OrderStatus } from '@/content/schemas';

/** Arabic labels for the four statuses. The admin panel is monolingual. */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكّد',
  delivered: 'تم التسليم',
  canceled: 'ملغى',
};

/**
 * Dot colours, reusing `<StockDot />`'s idiom rather than inventing a second
 * status vocabulary: a small coloured disc beside a word, where the colour
 * carries no information the word doesn't already carry. Gold for the one
 * status that means "someone has to act", green for the settled happy end,
 * grey for done-and-dusted, red for cancelled.
 */
export const ORDER_STATUS_DOT: Record<OrderStatus, string> = {
  pending: 'bg-gold',
  confirmed: 'bg-emerald-500',
  delivered: 'bg-gray-500',
  canceled: 'bg-red-500',
};
