import { randomUUID } from 'node:crypto';
import { S3Client } from '@aws-sdk/client-s3';

/**
 * Cloudflare R2 configuration, read and validated in one place.
 *
 * This was inline in `app/api/admin/uploads/route.ts` and stayed there happily
 * while that route was the only thing touching the bucket. It moved here when
 * the normalize route and `scripts/normalize-product-images.ts` became the
 * second and third: three copies of "read five variables, trim them, complain
 * by NAME if any is missing" is three places for the trimming rule to be
 * forgotten in.
 *
 * Server-only. Three of the five variables are secrets and none of them are
 * `NEXT_PUBLIC_`, so importing this into a client component would fail the
 * build — which is the intended outcome, not a hazard to work around.
 */

/** Every variable R2 access needs, in the order they appear in .env.example. */
export const REQUIRED_R2_VARS = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_BASE_URL',
] as const;

export type R2Var = (typeof REQUIRED_R2_VARS)[number];

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** Public base with any trailing slash already removed. */
  publicBase: string;
};

/**
 * Reads a required variable, treating whitespace-only as absent and trimming
 * what it returns.
 *
 * The trim is not cosmetic. Pasting a value into a dashboard field very easily
 * carries a trailing newline or space, which passes a plain `!value` check and
 * then fails much later and much more confusingly — a signature computed over a
 * key with a stray `\n` produces a SignatureDoesNotMatch from R2, and an
 * account id with one produces a hostname that simply doesn't resolve.
 */
export function readR2Var(name: R2Var): string | null {
  const value = process.env[name];
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Names of the variables that are missing or empty. **Names only, never
 * values** — three of these five are secrets, and an error body is exactly the
 * kind of thing that ends up pasted into a chat or a screenshot.
 */
export function missingR2Vars(): R2Var[] {
  return REQUIRED_R2_VARS.filter((name) => readR2Var(name) === null);
}

/** Config, or `null` when anything is missing — callers report which. */
export function r2Config(): R2Config | null {
  if (missingR2Vars().length > 0) return null;
  return {
    accountId: readR2Var('R2_ACCOUNT_ID')!,
    accessKeyId: readR2Var('R2_ACCESS_KEY_ID')!,
    secretAccessKey: readR2Var('R2_SECRET_ACCESS_KEY')!,
    bucket: readR2Var('R2_BUCKET_NAME')!,
    publicBase: readR2Var('R2_PUBLIC_BASE_URL')!.replace(/\/$/, ''),
  };
}

export function r2Client(config: R2Config): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

/** The public URL an object key is served from. */
export function publicUrlFor(config: R2Config, key: string): string {
  return `${config.publicBase}/${key}`;
}

/**
 * The object key a public URL refers to, or `null` if the URL does not belong
 * to this bucket.
 *
 * The null case is a security boundary, not tidiness: the normalize route takes
 * a URL from the browser and fetches it, so without this check an admin session
 * could point it at any host and have the server request it — a server-side
 * request forgery with the bucket's own credentials attached to the write that
 * follows.
 */
export function keyFromPublicUrl(config: R2Config, url: string): string | null {
  const prefix = `${config.publicBase}/`;
  if (!url.startsWith(prefix)) return null;
  const key = url.slice(prefix.length);
  // No traversal, no empty key, and inside the folder uploads actually use.
  if (key.length === 0 || key.includes('..') || !key.startsWith('products/')) return null;
  return key;
}

/**
 * Key for a normalized derivative.
 *
 * Its own folder, and a fresh UUID rather than a name derived from the
 * original's: the batch script and the upload path both write here, and a
 * derived name would make a re-run silently overwrite an object that product
 * rows already point at. A new key each time means the previous version is
 * still there if a normalization turns out to have been wrong.
 */
export function normalizedKey(extension: string): string {
  return `products/normalized/${randomUUID()}.${extension}`;
}
