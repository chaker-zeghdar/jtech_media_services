'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteProduct, setPublished } from '@/app/(admin)/admin/actions';
import type { AdminProduct } from '@/lib/queries/admin';
import { priceFrom } from '@/lib/product';
import { formatInteger } from '@/lib/format';

export function ProductRow({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function togglePublished() {
    setError(null);
    startTransition(async () => {
      try {
        await setPublished(product.id, !product.published);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل التحديث');
      }
    });
  }

  function remove() {
    // Deleting a product also drops its variants. Cheap confirm beats an undo
    // stack for a single-admin tool.
    if (!confirm(`حذف "${product.name}" نهائياً؟`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteProduct(product.id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل الحذف');
      }
    });
  }

  return (
    <tr className={pending ? 'opacity-50' : undefined}>
      <td className="px-4 py-3">
        <Link href={`/admin/products/${product.id}`} className="font-medium hover:underline">
          {product.name}
        </Link>
        <span className="block text-xs text-gray-500">{product.slug}</span>
        {error ? <span className="block text-xs text-red-700">{error}</span> : null}
      </td>
      <td className="px-4 py-3 text-gray-700">{product.category}</td>
      <td className="px-4 py-3">{formatInteger(priceFrom(product))} دج</td>
      <td className="px-4 py-3 text-gray-700">{product.variants.length}</td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={togglePublished}
          disabled={pending}
          aria-pressed={product.published}
          className={
            product.published
              ? 'rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white'
              : 'rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700'
          }
        >
          {product.published ? 'منشور' : 'مسودة'}
        </button>
      </td>
      <td className="px-4 py-3 text-end">
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="text-xs font-semibold text-red-700 hover:underline"
        >
          حذف
        </button>
      </td>
    </tr>
  );
}
