import { randomUUID } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getAdminUser } from '@/lib/supabase/server';

/**
 * Hands the admin form a short-lived presigned PUT URL so the browser can send
 * the file **straight to R2**, never through this server. A Next route handler
 * would otherwise have to buffer every product photo in memory on the way past,
 * for no benefit.
 *
 * `/api` is excluded from the middleware matcher, so this route is NOT behind
 * the admin gate — it does its own session check, deliberately. A route that
 * mints write credentials for object storage should not be one middleware edit
 * away from being open to the internet.
 */

const MAX_BYTES = 8 * 1024 * 1024;

/** Bitmap formats only — no SVG, which is a script-execution vector. */
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

/** Presigned URL lifetime. Long enough for a slow phone upload, short enough. */
const EXPIRES_IN = 300;

/** Every variable this route needs, in the order they appear in .env.example. */
const REQUIRED_R2_VARS = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_BASE_URL',
] as const;

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
function readVar(name: (typeof REQUIRED_R2_VARS)[number]): string | null {
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
function missingR2Vars(): string[] {
  return REQUIRED_R2_VARS.filter((name) => readVar(name) === null);
}

function r2Client(accountId: string, accessKeyId: string, secretAccessKey: string) {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function POST(request: Request) {
  // 1 ─ Session first, before R2 is even constructed.
  const user = await getAdminUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2 ─ Input, BEFORE the configuration check.
  //
  //     Order matters here and got it wrong the first time: with the config
  //     check first, an unconfigured deploy answered every malformed request
  //     with the same 500, so a rejected SVG looked like a server fault. What
  //     the caller sent is wrong (or not) independently of whether this
  //     deployment happens to have R2 credentials.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const { filename, contentType, size } = (body ?? {}) as {
    filename?: unknown;
    contentType?: unknown;
    size?: unknown;
  };

  if (typeof filename !== 'string' || filename.length === 0 || filename.length > 200) {
    return Response.json({ error: 'A filename is required.' }, { status: 400 });
  }
  if (typeof contentType !== 'string' || !ALLOWED.has(contentType)) {
    return Response.json(
      { error: `Unsupported type. Allowed: ${[...ALLOWED].join(', ')}.` },
      { status: 415 },
    );
  }
  /* Advisory only. The client declares its own size and a presigned PUT can't
     enforce a cap, so this rejects the honest oversized upload early rather
     than pretending to be a security control. A real ceiling is a bucket-side
     policy in Cloudflare. */
  if (size !== undefined && (typeof size !== 'number' || size <= 0 || size > MAX_BYTES)) {
    return Response.json(
      { error: `Files must be under ${Math.floor(MAX_BYTES / 1024 / 1024)} MB.` },
      { status: 413 },
    );
  }

  // 3 ─ Configuration. A 500 here means the deploy is missing R2 credentials,
  //     which is an operator problem and should say so rather than surfacing as
  //     an opaque AWS SDK error.
  //
  //     It names the specific variables that are missing rather than restating
  //     the whole list: "R2 is not configured" is unactionable when four of the
  //     five are already set and one has a typo. Safe to return because the
  //     session check above already ran — only a signed-in admin sees this — and
  //     because it carries variable NAMES only. Never add the values: three of
  //     the five are secrets.
  const missing = missingR2Vars();
  if (missing.length > 0) {
    return Response.json(
      {
        error: `R2 is not configured. Missing or empty: ${missing.join(', ')}.`,
        missing,
      },
      { status: 500 },
    );
  }

  /* Non-null after the check above, and re-read through `readVar` so the
     trimmed values are the ones actually used. */
  const accountId = readVar('R2_ACCOUNT_ID')!;
  const accessKeyId = readVar('R2_ACCESS_KEY_ID')!;
  const secretAccessKey = readVar('R2_SECRET_ACCESS_KEY')!;
  const bucket = readVar('R2_BUCKET_NAME')!;
  const publicBase = readVar('R2_PUBLIC_BASE_URL')!;
  const client = r2Client(accountId, accessKeyId, secretAccessKey);

  // 4 ─ A key that can't collide and stays browsable in the R2 console.
  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '-').slice(-100);
  const key = `products/${randomUUID()}-${safeName}`;

  // 5 ─ Presign.
  try {
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
      { expiresIn: EXPIRES_IN },
    );

    return Response.json({
      uploadUrl,
      publicUrl: `${publicBase.replace(/\/$/, '')}/${key}`,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Could not presign the upload.' },
      { status: 502 },
    );
  }
}
