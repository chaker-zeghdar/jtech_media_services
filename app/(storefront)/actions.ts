'use server';

import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

/**
 * The storefront's one server action: placing an order.
 *
 * Deliberately NOT in `app/(admin)/admin/actions.ts`. That file's every export
 * begins with `requireAdmin()`; this one runs for anonymous visitors, and the
 * two must not share a module where a careless import could blur which is
 * which.
 *
 * ── The anon client, on purpose ────────────────────────────────────────────
 *
 * This uses the same anon/session-aware client the public pages read through,
 * not the service-role key. RLS's "anyone may INSERT an order" policy is what
 * permits the write. The integrity guarantee here does not come from an
 * elevated key — it comes from the fact that **every number that matters is
 * looked up or computed on this side**. The client sends a variant id, a
 * quantity and an address; it does not send a price, a delivery fee, or a
 * total, and anything it did send of that kind would be ignored.
 */

/** Mirrors `isPlausiblePhone` in CheckoutView — 05/06/07 plus eight digits. */
const PHONE = /^0[5-7]\d{8}$/;

const submitOrderSchema = z.object({
  /**
   * The product is NOT sent by the client. `Product` (content/schemas.ts) has no
   * `id` field — it never needed one while the catalogue was static — so the
   * checkout genuinely doesn't have one to send. Deriving the product from the
   * variant's own foreign key is both the smaller change and the safer one:
   * it is one less client-supplied identifier to cross-validate, and it makes a
   * mismatched product/variant pair unrepresentable rather than merely checked.
   */
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  deliveryMethod: z.enum(['desk', 'home']),
  wilayaCode: z.number().int().min(1).max(58),
  dairaId: z.number().int().nullable(),
  customerName: z.string().min(1).max(200),
  customerPhone: z.string().regex(PHONE),
  address: z.string().max(500).nullable(),
  landingSlug: z.string().nullable(),
  /** Honeypot — a real visitor never fills this; a bot script often does. */
  website: z.string().max(0),
});

export type SubmitOrderResult =
  | { ok: true; orderId: string; total: number; deliveryFee: number; unitPrice: number }
  /**
   * A stable code, not a sentence. The storefront is trilingual and every
   * user-facing string in it comes from `messages/{ar,fr,en}.json`; returning
   * prose here would hardcode Arabic into a page a French visitor might be
   * reading. CheckoutView maps these through `t()`.
   */
  | { ok: false; error: 'invalid' | 'unavailable' | 'failed' };

type VariantJoin = {
  id: string;
  price: number;
  colour_label: string;
  storage: string | null;
  product: { id: string; name: string; published: boolean };
};

export async function submitOrder(rawInput: unknown): Promise<SubmitOrderResult> {
  const parsed = submitOrderSchema.safeParse(rawInput);

  /* Returned, never thrown: this runs from a public form and should degrade to
     an inline message. The zod issues are deliberately not forwarded — an
     anonymous caller has no use for our field names. */
  if (!parsed.success) return { ok: false, error: 'invalid' };
  const input = parsed.data;

  // Same generic failure as a validation error — telling a bot it tripped a
  // honeypot just tells it which field to leave alone next time.
  if (input.website !== '') return { ok: false, error: 'invalid' };

  if (input.deliveryMethod === 'home' && (input.address ?? '').trim().length === 0) {
    return { ok: false, error: 'invalid' };
  }

  const supabase = await createClient();

  // ---- The variant, and its product, from the database --------------------
  const { data: variantData, error: variantError } = await supabase
    .from('product_variants')
    .select('id, price, colour_label, storage, product:products!inner(id, name, published)')
    .eq('id', input.variantId)
    .maybeSingle();

  if (variantError) return { ok: false, error: 'failed' };
  const variant = variantData as VariantJoin | null;
  if (!variant || !variant.product?.published) return { ok: false, error: 'unavailable' };

  // ---- Delivery fee, from `wilayas` ---------------------------------------
  /* The database, not `content/wilayas.ts`. That file was the original seed
     source for this table back in Phase 2; the table has been the live source
     of truth since, and a fee edited there must not be silently overridden by
     a stale literal in the bundle. */
  const { data: wilaya, error: wilayaError } = await supabase
    .from('wilayas')
    .select('code, desk_fee, home_fee')
    .eq('code', input.wilayaCode)
    .maybeSingle();

  if (wilayaError) return { ok: false, error: 'failed' };
  if (!wilaya) return { ok: false, error: 'unavailable' };

  const deliveryFee =
    input.deliveryMethod === 'home' ? (wilaya.home_fee as number) : (wilaya.desk_fee as number);

  // ---- The daira must belong to the chosen wilaya -------------------------
  /* Optional field, but a daira attached to the wrong wilaya is a genuinely
     wrong address on a real delivery, not a cosmetic mismatch. */
  if (input.dairaId !== null) {
    const { data: daira, error: dairaError } = await supabase
      .from('dairas')
      .select('id, wilaya_code')
      .eq('id', input.dairaId)
      .maybeSingle();

    if (dairaError) return { ok: false, error: 'failed' };
    if (!daira || daira.wilaya_code !== input.wilayaCode) return { ok: false, error: 'invalid' };
  }

  // ---- Money, computed here and nowhere else ------------------------------
  const unitPrice = variant.price;
  const total = unitPrice * input.quantity + deliveryFee;

  const variantLabel = [variant.colour_label, variant.storage].filter(Boolean).join(' — ');

  /**
   * The id is minted here rather than read back from the insert.
   *
   * `.insert().select()` needs BOTH an INSERT and a SELECT policy, and `anon`
   * deliberately cannot read `orders` — a customer must not be able to list
   * other people's orders. Asking for the row back therefore failed with
   * "new row violates row-level security policy", which reads like the INSERT
   * was refused when in fact only the read-back was. Generating the uuid
   * up-front means the write needs no return value, and the confirmation still
   * gets a real database id.
   */
  const orderId = randomUUID();

  const { error: insertError } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      product_id: variant.product.id,
      variant_id: variant.id,
      // Snapshotted, not joined at read time: an order is a record of what was
      // bought, and it must survive the product being renamed or deleted.
      product_name: variant.product.name,
      variant_label: variantLabel,
      quantity: input.quantity,
      unit_price: unitPrice,
      wilaya_code: input.wilayaCode,
      daira_id: input.dairaId,
      delivery_method: input.deliveryMethod,
      delivery_fee: deliveryFee,
      total,
      customer_name: input.customerName.trim(),
      customer_phone: input.customerPhone.replace(/\s+/g, ''),
      address: input.deliveryMethod === 'home' ? (input.address ?? '').trim() : null,
      landing_slug: input.landingSlug,
    });

  if (insertError) return { ok: false, error: 'failed' };

  /* The server's own numbers go back to the client. In the normal case they
     match what the live summary already showed; returning them means the
     confirmation shows what was actually recorded rather than what the browser
     believed. */
  return { ok: true, orderId, total, deliveryFee, unitPrice };
}
