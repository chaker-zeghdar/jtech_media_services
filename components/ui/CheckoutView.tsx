'use client';

import { type FormEvent, useEffect, useMemo, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { submitOrder } from '@/app/(storefront)/actions';
import type { Product, ProductVariant } from '@/content/schemas';
import { pickWilayaName } from '@/lib/format';
import { TIKTOK_CURRENCY, tiktokContent, trackTikTok } from '@/lib/tiktok';
import { primaryVariant, productColours, resolveVariant, variantsForColour } from '@/lib/product';
import { wilayas } from '@/content/wilayas';
import { cn } from '@/lib/cn';
import { Button } from './Button';
import { Field } from './Field';
import { Price } from './Price';
import { ProductImage } from './ProductImage';

type DeliveryMethod = 'desk' | 'home';

/**
 * A snapshot of what was actually submitted, handed up to `<QuickView />` so
 * it can render `<OrderConfirmation />` after this component unmounts. Kept
 * as a plain value rather than a live reference to this component's state,
 * because once the view switches away this component IS gone — the
 * confirmation has nothing else to read from.
 */
export type ConfirmedOrder = {
  /** The database's own id for this order — a real reference a customer or the
   *  shop can quote, rather than a snapshot of what was typed. */
  orderId: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: DeliveryMethod;
  wilayaLabel: string;
  name: string;
  phone: string;
  address: string | null;
};

type CheckoutViewProps = {
  product: Product;
  titleId: string;
  onSubmit: (order: ConfirmedOrder) => void;
  /**
   * Where this order was placed from, recorded on `orders.landing_slug`.
   *
   * Null in the quick-view dialog, which can be opened from anywhere on the
   * site and so attributes to nothing in particular. Set to the product's slug
   * on `/products/[slug]`, which is the URL an ad points at — that column is
   * the only way to tell an order that came from a campaign apart from one
   * placed while browsing.
   */
  landingSlug?: string | null;
};

/**
 * A plausible Algerian mobile number: 05/06/07 followed by eight digits — ten
 * digits total, spaces allowed (the shop's own number is displayed
 * "0659 39 13 13"). Nothing in this codebase validated a CUSTOMER's phone
 * number before this — `content/contact.ts`/`content/schemas.ts` validate the
 * business's own numbers in E.164, a different shape entirely — so this is a
 * new, deliberately simple pattern, not a reuse of an existing one.
 */
function isPlausiblePhone(value: string): boolean {
  return /^0[5-7]\d{8}$/.test(value.replace(/\s+/g, ''));
}

type Errors = Partial<Record<'name' | 'phone' | 'wilaya' | 'address' | 'submit', string>>;

type Daira = { id: number; name: string; name_ascii: string };

/**
 * The order form + live summary, switched in by `<QuickView />` when its view
 * is `'checkout'`. See QuickView.tsx for why this lives inside the same
 * dialog rather than a second one.
 *
 * ── This is UI only ─────────────────────────────────────────────────────────
 *
 * `handleSubmit` below does exactly two things: validate, and hand a snapshot
 * of the form to `onSubmit`. It does not call `whatsappLink()`, does not
 * `fetch()`, does not write anywhere. Wiring a real backend is PHASE 3 — the
 * one place that changes when it exists is `handleSubmit`'s success branch,
 * which is marked below.
 *
 * ── Real, selectable swatches, for the first time ───────────────────────────
 *
 * DESIGN.md documents `<ColourSwatches />` (the card) and the detail view's
 * own colour dots as summaries with "no state and no click handler" — correct
 * there, because neither view has anywhere for a selection to go. This is the
 * first surface on the site where picking a colour actually does something,
 * which is why it's built here rather than by giving one of those a click
 * handler. See the note added to DESIGN.md.
 *
 * ── Colour and storage are not an independent grid ─────────────────────────
 *
 * A variant is one SKU the shop stocks — "black, 256GB" is only a real option
 * if that row exists in content/products.ts. Choosing a colour narrows the
 * storage picker to what that colour actually comes in (`variantsForColour`),
 * rather than offering a combination nobody sells.
 */
export function CheckoutView({
  product,
  titleId,
  onSubmit,
  landingSlug = null,
}: CheckoutViewProps) {
  const locale = useLocale();
  const t = useTranslations('checkout');
  const tProduct = useTranslations('product');

  const name = product.name;
  const colours = productColours(product);
  const initial = primaryVariant(product);

  const [colourSlug, setColourSlug] = useState(initial.colour.slug);
  const [storage, setStorage] = useState<string | null>(initial.storage);
  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('desk');
  const [wilayaCode, setWilayaCode] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [dairaId, setDairaId] = useState<number | null>(null);
  const [dairas, setDairas] = useState<Daira[] | null>(null);
  /** Honeypot. Never shown, never focusable — see the field at the end of the form. */
  const [website, setWebsite] = useState('');
  const [pending, startTransition] = useTransition();

  const storageOptions = useMemo(
    () => [...new Set(variantsForColour(product, colourSlug).map((v) => v.storage))],
    [product, colourSlug],
  );

  const variant: ProductVariant = resolveVariant(product, colourSlug, storage);
  const wilaya = wilayaCode !== null ? wilayas.find((w) => w.code === wilayaCode) : undefined;
  const deliveryFee = wilaya ? (deliveryMethod === 'home' ? wilaya.homeFee : wilaya.deskFee) : 0;
  const subtotal = variant.price * quantity;
  const total = subtotal + deliveryFee;

  /**
   * Dairas are fetched per wilaya rather than bundled: there are 548 of them,
   * and a customer sees at most one wilaya's worth. Fetched through a tiny
   * public route handler because this is a client component inside a lazily
   * mounted dialog, so it has no server render in which to read them.
   *
   * `ignore` guards the out-of-order response: switching wilaya twice quickly
   * can land the first reply after the second, which would show the wrong
   * wilaya's dairas.
   */
  useEffect(() => {
    if (wilayaCode === null) {
      setDairas(null);
      return;
    }

    let ignore = false;
    setDairas(null);

    fetch(`/api/dairas?wilaya=${wilayaCode}`)
      .then((res) => (res.ok ? res.json() : { dairas: [] }))
      .then((body: { dairas?: Daira[] }) => {
        if (!ignore) setDairas(body.dairas ?? []);
      })
      .catch(() => {
        // A failed lookup must not block the order — the daira is optional.
        if (!ignore) setDairas([]);
      });

    return () => {
      ignore = true;
    };
  }, [wilayaCode]);

  function selectColour(nextSlug: string) {
    setColourSlug(nextSlug);
    // The old storage choice may not exist for the new colour — re-derive it
    // rather than leaving a stale value `resolveVariant` would silently
    // discard anyway.
    const [firstStorage] = [...new Set(variantsForColour(product, nextSlug).map((v) => v.storage))];
    setStorage(firstStorage ?? null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const nextErrors: Errors = {};
    if (customerName.trim().length === 0) nextErrors.name = t('nameError');
    if (!isPlausiblePhone(phone)) nextErrors.phone = t('phoneError');
    if (!wilaya) nextErrors.wilaya = t('wilayaError');
    if (deliveryMethod === 'home' && address.trim().length === 0) nextErrors.address = t('addressError');

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // `wilaya` is narrowed non-null by the check above, but TypeScript can't
    // see that through `nextErrors` — the local const restates it.
    const confirmedWilaya = wilaya!;

    const variantLabel = [variant.colour.label, variant.storage]
      .filter(Boolean)
      .join(' — ');

    /**
     * The real submit. `submitOrder` re-looks-up the price and the delivery fee
     * server-side and returns ITS numbers, which is what the confirmation
     * shows — not the ones computed in this component. In the normal case they
     * are identical; when they are not, the server is right.
     *
     * `onSubmit` (which switches <QuickView /> to the confirmation) only runs
     * after the insert succeeds, so a failed order can never render as a
     * successful one.
     */
    startTransition(async () => {
      const result = await submitOrder({
        variantId: variant.id,
        quantity,
        deliveryMethod,
        wilayaCode: confirmedWilaya.code,
        dairaId,
        customerName: customerName.trim(),
        customerPhone: phone.replace(/\s+/g, ''),
        address: deliveryMethod === 'home' ? address.trim() : null,
        landingSlug,
        website,
      });

      if (!result.ok) {
        const message =
          result.error === 'unavailable'
            ? t('submitUnavailable')
            : result.error === 'invalid'
              ? t('submitInvalid')
              : t('submitFailed');
        setErrors({ submit: message });
        return;
      }

      /**
       * The conversion, reported from the ONE branch where the row actually
       * landed in `orders` — not from an effect in the confirmation view, which
       * re-runs on re-render and would count the same order more than once.
       *
       * Every number here is the server's. `result.total` and `result.quantity`
       * are what was recorded; the component's own `total` and `quantity` are
       * only what the browser believed, and this checkout has been built around
       * not trusting those since the price-integrity work in Phase 4.
       *
       * Fires for the dialog as well as `/products/[slug]` — both render this
       * component, and an order is an order wherever it was placed.
       */
      trackTikTok('Purchase', {
        ...tiktokContent(product),
        quantity: result.quantity,
        value: result.total,
        currency: TIKTOK_CURRENCY,
      });

      onSubmit({
        orderId: result.orderId,
        productName: name,
        variantLabel,
        quantity,
        unitPrice: result.unitPrice,
        deliveryFee: result.deliveryFee,
        total: result.total,
        deliveryMethod,
        wilayaLabel: pickWilayaName(confirmedWilaya, locale),
        name: customerName.trim(),
        phone: phone.trim(),
        address: deliveryMethod === 'home' ? address.trim() : null,
      });
    });
  }

  return (
    <>
      {/* ---- Left: product + live summary --------------------------------- */}
      <div className="flex flex-col">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-card bg-gray-50">
          <ProductImage
            src={variant.images[0]}
            name={name}
            width={420}
            height={420}
            sizes="(max-width: 767px) 88vw, 360px"
            className="drop-shadow-product"
          />
        </div>

        {/* Recalculates on every change below — no submit needed to see it,
            per the brief. Reuses <Price /> rather than hand-formatting DZD
            again. */}
        <div className="mt-6 rounded-card border border-gray-300 p-5">
          <h3 className="text-caption uppercase text-gray-700">{t('summaryTitle')}</h3>

          <dl className="mt-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-sm text-gray-700">
                {name}
                {variant.storage || colours.length > 1 ? (
                  <span className="block text-caption text-gray-500">
                    {[variant.colour.label, variant.storage].filter(Boolean).join(' — ')}
                    {' × '}
                    <bdi className="num">{quantity}</bdi>
                  </span>
                ) : null}
              </dt>
              <dd className="shrink-0">
                <Price value={subtotal} size="sm" />
              </dd>
            </div>

            <div className="flex items-baseline justify-between gap-4 border-t border-gray-300 pt-3">
              <dt className="text-sm text-gray-700">{t('deliveryFeeLabel')}</dt>
              <dd className="text-sm font-medium">
                {wilaya ? <Price value={deliveryFee} size="sm" /> : <span className="text-gray-500">—</span>}
              </dd>
            </div>

            <div className="flex items-baseline justify-between gap-4 border-t border-gray-300 pt-3">
              <dt className="text-base font-semibold">{t('totalLabel')}</dt>
              <dd>
                <Price value={total} size="md" />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* ---- Right: the form ------------------------------------------------ */}
      <form onSubmit={handleSubmit} className="flex flex-col" noValidate>
        <p className="text-caption uppercase text-gold-text">{t('eyebrow')}</p>
        <h2 id={titleId} className="mt-2 text-h2 font-semibold">
          {name}
        </h2>

        {colours.length > 1 ? (
          <div className="mt-6">
            <h3 className="text-caption uppercase text-gray-700">{tProduct('colours')}</h3>
            <div role="group" aria-label={tProduct('colours')} className="mt-3 flex flex-wrap gap-2.5">
              {colours.map((colour) => {
                const selected = colour.slug === colourSlug;
                return (
                  <button
                    key={colour.slug}
                    type="button"
                    aria-pressed={selected}
                    aria-label={colour.label}
                    onClick={() => selectColour(colour.slug)}
                    className={cn(
                      'h-9 w-9 rounded-full border-2 transition-[border-color,box-shadow] duration-200 ease-brand',
                      selected ? 'border-ink' : 'border-transparent hover:border-gray-300',
                    )}
                  >
                    <span
                      className="block h-full w-full rounded-full border border-gray-300"
                      style={{ backgroundColor: colour.hex }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {storageOptions.length > 1 ? (
          <div className="mt-6">
            <h3 className="text-caption uppercase text-gray-700">{tProduct('storage')}</h3>
            <div role="group" aria-label={tProduct('storage')} className="mt-3 flex flex-wrap gap-2">
              {storageOptions.map((option) => {
                const selected = option === storage;
                return (
                  <button
                    key={option ?? 'none'}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setStorage(option)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ease-brand',
                      selected
                        ? 'border-ink bg-ink text-white'
                        : 'border-gray-300 text-ink hover:border-gray-500',
                    )}
                  >
                    <bdi>{option}</bdi>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <h3 className="text-caption uppercase text-gray-700">{t('quantityLabel')}</h3>
          <div className="mt-3 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label={t('decreaseQuantity')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-base font-semibold text-ink transition-[background-color,border-color,opacity] duration-200 ease-brand hover:border-ink hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-35"
            >
              −
            </button>
            <span className="num min-w-[2ch] text-center text-base font-semibold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label={t('increaseQuantity')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-base font-semibold text-ink transition-[background-color,border-color,opacity] duration-200 ease-brand hover:border-ink hover:bg-ink hover:text-white"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-caption uppercase text-gray-700">{t('deliveryMethodLabel')}</h3>
          {/* Real radio inputs, visually hidden, styled via their <label>
              sibling — native keyboard/screen-reader semantics for free,
              which a hand-rolled toggle-button pair would have to
              reimplement (roving tabindex, arrow-key navigation) to be
              equally correct. The swatches above use a plain button group
              instead because a round colour dot is awkward to style as a
              native radio; a two-option text pill is not. */}
          <div className="mt-3 flex gap-2">
            {(['desk', 'home'] as const).map((option) => (
              <label
                key={option}
                className={cn(
                  'flex-1 cursor-pointer rounded-full border px-4 py-2.5 text-center text-sm font-medium transition-colors duration-200 ease-brand',
                  deliveryMethod === option
                    ? 'border-ink bg-ink text-white'
                    : 'border-gray-300 text-ink hover:border-gray-500',
                )}
              >
                <input
                  type="radio"
                  name="delivery-method"
                  value={option}
                  checked={deliveryMethod === option}
                  onChange={() => setDeliveryMethod(option)}
                  className="sr-only"
                />
                {option === 'desk' ? t('deskOption') : t('homeOption')}
              </label>
            ))}
          </div>
        </div>

        <Field
          id="checkout-wilaya"
          label={t('wilayaLabel')}
          required
          error={errors.wilaya}
          className="mt-6"
        >
          {(props) => (
            <select
              {...props}
              value={wilayaCode ?? ''}
              onChange={(event) => setWilayaCode(event.target.value ? Number(event.target.value) : null)}
            >
              <option value="" disabled>
                {t('wilayaPlaceholder')}
              </option>
              {wilayas.map((w) => (
                // `<option>` can only ever hold plain text — `<bdi>` here would
                // be silently stripped by the browser, not just visually
                // inert, so the wilaya name is passed as a bare string.
                <option key={w.code} value={w.code}>
                  {pickWilayaName(w, locale)}
                </option>
              ))}
            </select>
          )}
        </Field>

        {/* Optional, and deliberately not gated on being loaded: a customer who
            doesn't know their daira can still order with just the wilaya. Only
            rendered once a wilaya is chosen, since the list depends on it. */}
        {wilayaCode !== null ? (
          <Field id="checkout-daira" label={t('dairaLabel')} className="mt-6">
            {(props) => (
              <select
                {...props}
                value={dairaId ?? ''}
                disabled={dairas === null}
                onChange={(event) => setDairaId(event.target.value ? Number(event.target.value) : null)}
              >
                <option value="">
                  {dairas === null ? t('dairaLoading') : t('dairaPlaceholder')}
                </option>
                {(dairas ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
        ) : null}

        {deliveryMethod === 'home' ? (
          <Field
            id="checkout-address"
            label={t('addressLabel')}
            required
            error={errors.address}
            className="mt-6"
          >
            {(props) => (
              <textarea
                {...props}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                rows={2}
              />
            )}
          </Field>
        ) : null}

        <Field
          id="checkout-name"
          label={t('nameLabel')}
          required
          error={errors.name}
          className="mt-6"
        >
          {(props) => (
            <input
              {...props}
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
            />
          )}
        </Field>

        <Field
          id="checkout-phone"
          label={t('phoneLabel')}
          hint={t('phoneHint')}
          required
          error={errors.phone}
          className="mt-6"
        >
          {(props) => (
            <input
              {...props}
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          )}
        </Field>

        {/* Honeypot. Off-screen rather than `display:none` (some bots skip
            hidden inputs), `tabIndex={-1}` and `aria-hidden` so no keyboard or
            screen-reader user can reach it, and `autoComplete="off"` so a
            browser never helpfully fills it in. A human leaves it empty; the
            server rejects anything else without saying why. */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
          <label htmlFor="checkout-website">Website</label>
          <input
            id="checkout-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>

        {errors.submit ? (
          <p role="alert" className="mt-6 rounded-card bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.submit}
          </p>
        ) : null}

        <div className="mt-8">
          <Button type="submit" fullWidth disabled={pending}>
            {pending ? t('submitting') : t('submitCta')}
          </Button>
        </div>
      </form>
    </>
  );
}
