'use client';

import { useRef, useState } from 'react';
import { ADMIN_BTN_GHOST } from './styles';

type ImageUploaderProps = {
  images: string[];
  onChange: (images: string[]) => void;
};

type Status =
  | { state: 'idle' }
  | { state: 'uploading'; name: string }
  | { state: 'processing'; name: string }
  | { state: 'error'; message: string };

/**
 * File → presigned URL → **direct PUT to R2** → append the public URL to the
 * variant's `images`.
 *
 * The bytes never pass through the Next server; the route handler only mints a
 * short-lived signed URL. That is the whole reason for presigning, and it is
 * why a 12MB photo doesn't have to be buffered in a serverless function.
 *
 * Nothing here writes to Supabase. A successful upload lands the file in R2 and
 * returns a URL, which goes into the form's local state; it reaches
 * `product_variants.images` only when the admin saves the product. A photo
 * uploaded and then abandoned is an orphaned object in the bucket, which is
 * cheap — an image URL saved for a file that failed to upload would be a broken
 * product page, which is not.
 *
 * ── The third hop: normalize ───────────────────────────────────────────────
 *
 * After the PUT lands, `../normalize` rewrites the photo into the canonical
 * square every card and gallery expects (`lib/images/normalize.ts`) and returns
 * the URL of that copy, which is what gets stored. It is a separate call rather
 * than part of the upload because the upload deliberately never passes through
 * the server — see that route's own note.
 *
 * A normalize failure is SWALLOWED and the original URL kept. An un-normalized
 * photo is merely inconsistent with its neighbours; losing the upload over a
 * cosmetic step would be worse, and the batch script can pick it up later.
 */
export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  async function upload(file: File) {
    setStatus({ state: 'uploading', name: file.name });

    try {
      const presign = await fetch('/api/admin/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      });

      if (!presign.ok) {
        const body = (await presign.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `تعذّر تجهيز الرفع (${presign.status})`);
      }

      const { uploadUrl, publicUrl } = (await presign.json()) as {
        uploadUrl: string;
        publicUrl: string;
      };

      const put = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      // R2 rejecting the PUT (expired signature, CORS, size) must NOT leave a
      // URL in the array — the file isn't there.
      if (!put.ok) throw new Error(`رفض التخزين الرفع (${put.status})`);

      /* Best-effort. Anything that goes wrong past this point leaves a
         perfectly usable original in the array. */
      let stored = publicUrl;
      setStatus({ state: 'processing', name: file.name });
      try {
        const normalized = await fetch('/api/admin/uploads/normalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: publicUrl }),
        });
        if (normalized.ok) {
          const { url } = (await normalized.json()) as { url?: string };
          if (typeof url === 'string' && url.length > 0) stored = url;
        }
      } catch {
        // Keep `publicUrl`.
      }

      onChange([...images, stored]);
      setStatus({ state: 'idle' });
    } catch (err) {
      setStatus({
        state: 'error',
        message: err instanceof Error ? err.message : 'فشل الرفع',
      });
    }
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {images.map((url, index) => (
          <li key={url} className="flex items-center gap-3 rounded-lg border border-gray-300 p-2">
            {/* Plain <img>, not next/image: these are freshly-uploaded R2 URLs
                in a private tool, and routing them through the optimizer would
                add a remotePatterns dependency for a thumbnail nobody but the
                admin sees. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-14 w-14 shrink-0 rounded object-contain" />

            <div className="min-w-0 flex-1">
              {index === 0 ? (
                <span className="inline-block rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-white">
                  صورة البطاقة
                </span>
              ) : null}
              <span className="block truncate text-xs text-gray-500" dir="ltr">
                {url}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="نقل لأعلى"
                className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === images.length - 1}
                aria-label="نقل لأسفل"
                className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                aria-label="حذف الصورة"
                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            // Clear, so re-picking the same file fires onChange again.
            event.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status.state === 'uploading' || status.state === 'processing'}
          className={ADMIN_BTN_GHOST}
        >
          {status.state === 'uploading'
            ? `جارٍ الرفع… ${status.name}`
            : status.state === 'processing'
              ? `جارٍ المعالجة… ${status.name}`
              : '+ رفع صورة'}
        </button>

        {images.length === 0 ? (
          <span className="text-xs text-gray-500">
            بدون صور — ستظهر البطاقة بالحالة الفارغة المصمّمة.
          </span>
        ) : null}
      </div>

      {status.state === 'error' ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
