/**
 * Client-safe contact constants.
 *
 * This module is deliberately zod-free and imports nothing, because client
 * components need the shop's number to build `tel:` and `wa.me` links. Importing
 * `content/settings.ts` from the browser would drag zod, the schema definitions
 * and (transitively) the product catalogue into the client bundle — measured at
 * roughly 20 KB of dead weight on the first-load budget.
 *
 * `content/settings.ts` consumes these same literals, so there is still one
 * source of truth: edit here, and the validated settings object picks it up.
 *
 * These are the client's REAL details, taken from their marketing posts — except
 * the email, which is inferred from the domain and is still unconfirmed. See
 * `settings.emailConfirmed`.
 */
export const CONTACT = {
  /** Orders and WhatsApp — the primary number. Human-readable, spaced. */
  phone: '0659 39 13 13',
  /** E.164, for tel: links. */
  phoneE164: '+213659391313',
  /** E.164, for wa.me links. */
  whatsapp: '+213659391313',
  /** ⚠️ UNCONFIRMED — inferred from the domain. Confirm before launch. */
  email: 'contact@jtechmediaservice.com',
} as const;

/** `wa.me` wants the number with no `+` and no spaces. */
export const whatsappNumber = CONTACT.whatsapp.replace(/\D/g, '');

/** Prefilled WhatsApp deep link. `text` should already be locale-appropriate. */
export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const telLink = `tel:${CONTACT.phoneE164}`;
export const mailLink = `mailto:${CONTACT.email}`;

/** Builds a `tel:` href from any department's E.164 number. */
export function telHref(e164: string): string {
  return `tel:${e164}`;
}
