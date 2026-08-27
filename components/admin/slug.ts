import { slugify } from '@/content/schemas';

/**
 * FNV-1a, base36. Small, dependency-free, deterministic and browser-safe.
 * Not a security hash — it only needs to map the same label to the same short
 * token every time.
 */
function shortHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

/**
 * A slug that is always valid against `slugSchema`, even for Arabic input.
 *
 * `slugify()` keeps only `[a-z0-9]`, so it returns "" for any purely Arabic
 * string — which is what the admin actually types. An empty slug fails
 * `slugSchema.min(1)`, and for the two slugs the form HIDES (a spec's `key` and
 * a colour's `slug`) there would be no field for the admin to fix it in: the
 * save would just fail with an error pointing at something invisible.
 *
 * So those two fall back to a hash of the label. It is deterministic, which is
 * the property that matters: two variants labelled "أسود" get the same colour
 * slug and therefore group correctly in `variantsForColour()`, exactly as they
 * would have under a hand-typed "black".
 *
 * The product slug does NOT use this — it is a public URL segment, so the form
 * leaves it visible and simply declines to auto-fill when there is nothing
 * Latin to build from.
 */
export function stableSlug(label: string, prefix: string): string {
  const direct = slugify(label);
  if (direct) return direct;
  const trimmed = label.trim();
  return trimmed ? `${prefix}-${shortHash(trimmed)}` : '';
}
