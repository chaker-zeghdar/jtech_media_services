import Link from 'next/link';
import { ProductRow } from '@/components/admin/ProductRow';
import { listAdminProducts } from '@/lib/queries/admin';
import { ADMIN_BTN_PRIMARY } from '@/components/admin/styles';

/** Always live — a catalogue editor showing a cached list is a bug report. */
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await listAdminProducts();
  const drafts = products.filter((product) => !product.published).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">المنتجات</h1>
          <p className="mt-1 text-sm text-gray-700">
            {products.length} منتج
            {drafts > 0 ? ` — منها ${drafts} غير منشور` : ''}
          </p>
        </div>

        <Link href="/admin/products/new" className={ADMIN_BTN_PRIMARY}>
          + منتج جديد
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-300 bg-white">
        {/* See the orders table for why this wraps in a scrolling div rather
            than shrinking columns or relying on the outer `overflow-hidden`. */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-gray-300 bg-gray-50 text-start">
              <tr>
                <th className="px-4 py-3 text-start font-medium">المنتج</th>
                <th className="px-4 py-3 text-start font-medium">القسم</th>
                <th className="px-4 py-3 text-start font-medium">السعر من</th>
                <th className="px-4 py-3 text-start font-medium">النسخ</th>
                <th className="px-4 py-3 text-start font-medium">منشور</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {products.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-gray-700">
            لا توجد منتجات بعد.
          </p>
        ) : null}
      </div>
    </div>
  );
}
