import { z } from 'zod';
import { productSchema } from '@/content/schemas';

/**
 * The save payload's shape, in a plain module rather than inside the actions
 * file.
 *
 * Two reasons it lives here. A `'use server'` module may only export async
 * functions, so a schema can't be exported from there — and more usefully, the
 * client form imports this to validate BEFORE submitting, so the same schema
 * runs on both sides. The client copy is the fast feedback; the server copy in
 * `saveProduct` is the one that actually decides.
 *
 * `product` is `productSchema` verbatim — the schema the public query layer
 * parses Supabase rows through. Anything that passes here is therefore
 * guaranteed to render on the storefront without a runtime zod failure, which
 * is the whole point of not writing a separate admin-shaped lookalike.
 */
export const saveInputSchema = z.object({
  /** null → create. A uuid → update that row. */
  id: z.string().uuid().nullable(),
  published: z.boolean(),
  product: productSchema,
});

export type SaveProductInput = z.infer<typeof saveInputSchema>;
