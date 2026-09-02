import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { normalizeProductImage } from '@/lib/images/normalize';
import { keyFromPublicUrl, missingR2Vars, normalizedKey, publicUrlFor, r2Client, r2Config } from '@/lib/r2';
import { getAdminUser } from '@/lib/supabase/server';

/**
 * Rewrites a just-uploaded photo into the canonical square (see
 * `lib/images/normalize.ts`) and returns the URL of the normalized copy.
 *
 * ── Why this is a second round trip and not part of the upload ─────────────
 *
 * The obvious design is to process the file on its way past — but nothing goes
 * past. `../uploads` hands the browser a presigned PUT so the bytes go
 * **straight to R2**, deliberately, so a photo never has to be buffered in a
 * serverless function. Moving the upload back through the server to get a
 * `sharp` call would undo that on purpose, and on Vercel it would also walk
 * into the 4.5MB request body limit while `../uploads` advertises an 8MB cap.
 *
 * So the file lands first and is normalized in place afterwards: the browser
 * PUTs to R2, then calls this with the public URL it was given. Both hops of
 * the work here are server-to-R2, which is fast and has no body limit.
 *
 * The original object is left where it is rather than deleted. It is a few
 * hundred KB, and it is the only copy of what the client actually shot — if a
 * normalization turns out to have trimmed into a product, the source to redo it
 * from should still exist.
 *
 * ── Failure is not fatal ───────────────────────────────────────────────────
 *
 * <ImageUploader /> keeps the original URL when this route errors. A photo that
 * is merely un-normalized still renders; a failed save loses the upload. That
 * asymmetry is why this is a separate call the client can shrug off rather than
 * a step that can fail the upload.
 */

/** Ceiling on what will be pulled back out of R2 to process. */
const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request) {
  // 1 ─ Session first, before R2 is even constructed. Same order as ../uploads,
  //     and for the same reason: `/api` is outside the middleware matcher, so
  //     this route's own check is the only gate on it.
  const user = await getAdminUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const { url } = (body ?? {}) as { url?: unknown };
  if (typeof url !== 'string' || url.length === 0) {
    return Response.json({ error: 'A url is required.' }, { status: 400 });
  }

  const config = r2Config();
  if (!config) {
    const missing = missingR2Vars();
    return Response.json(
      { error: `R2 is not configured. Missing or empty: ${missing.join(', ')}.`, missing },
      { status: 500 },
    );
  }

  /* Rejects anything that is not an object in this bucket's `products/` folder.
     This route fetches whatever URL it is handed, so without the check a signed
     -in admin — or anything that reaches this endpoint with their cookie —
     could aim the server at an arbitrary host. */
  const key = keyFromPublicUrl(config, url);
  if (!key) {
    return Response.json({ error: 'That URL is not a product upload.' }, { status: 400 });
  }

  const client = r2Client(config);

  try {
    const object = await client.send(
      new GetObjectCommand({ Bucket: config.bucket, Key: key }),
    );
    if (!object.Body) {
      return Response.json({ error: 'The uploaded object is empty.' }, { status: 404 });
    }
    if (typeof object.ContentLength === 'number' && object.ContentLength > MAX_BYTES) {
      return Response.json({ error: 'That image is too large to process.' }, { status: 413 });
    }

    const input = Buffer.from(await object.Body.transformToByteArray());
    const normalized = await normalizeProductImage(input);

    const outputKey = normalizedKey(normalized.extension);
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: outputKey,
        Body: normalized.buffer,
        ContentType: normalized.contentType,
        CacheControl: 'public, max-age=31536000, immutable',
        /* Provenance — see the note in scripts/normalize-product-images.ts. */
        Metadata: { 'source-key': key, strategy: normalized.strategy },
      }),
    );

    return Response.json({
      url: publicUrlFor(config, outputKey),
      strategy: normalized.strategy,
      width: normalized.width,
      height: normalized.height,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Could not normalize the image.' },
      { status: 502 },
    );
  }
}
