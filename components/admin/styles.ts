/**
 * Shared input/control classes for the admin panel.
 *
 * The storefront's `<Field />` and `<Button />` are deliberately not reused
 * here: they call `useTranslations`, and the admin area runs outside
 * `NextIntlClientProvider` (see `app/(admin)/admin/layout.tsx`). Plain strings
 * in a plain module keep that boundary obvious rather than tempting.
 */

export const ADMIN_INPUT =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ' +
  'outline-none transition-colors focus:border-ink focus:ring-1 focus:ring-ink ' +
  'disabled:bg-gray-50 disabled:text-gray-500';

export const ADMIN_LABEL = 'text-sm font-medium';

export const ADMIN_BTN =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ' +
  'transition-colors disabled:opacity-50';

export const ADMIN_BTN_PRIMARY = `${ADMIN_BTN} bg-ink text-white hover:bg-gray-700`;

export const ADMIN_BTN_GHOST = `${ADMIN_BTN} border border-gray-300 hover:border-ink hover:bg-ink hover:text-white`;

export const ADMIN_BTN_DANGER = `${ADMIN_BTN} border border-red-300 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600`;

/** A small "+ label" chip, used by the spec-suggestion row. */
export const ADMIN_CHIP =
  'rounded-full border border-gray-300 px-3 py-1 text-xs font-medium transition-colors ' +
  'hover:border-ink hover:bg-ink hover:text-white';

export const ADMIN_CARD = 'rounded-xl border border-gray-300 bg-white p-5';
