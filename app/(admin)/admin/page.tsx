import Link from 'next/link';
import { ADMIN_BTN_GHOST, ADMIN_BTN_PRIMARY, ADMIN_CARD } from '@/components/admin/styles';
import { formatInteger } from '@/lib/format';
import {
  ORDER_STATUSES,
  countOrdersByStatus,
  listAdminProducts,
  recentPendingOrders,
} from '@/lib/queries/admin';

/** Always live — a dashboard showing stale counts is a bug report. */
export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<(typeof ORDER_STATUSES)[number], string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكّد',
  delivered: 'تم التسليم',
  canceled: 'ملغى',
};

/** Pending is the only status that means "someone has to do something". */
const STATUS_TONE: Record<(typeof ORDER_STATUSES)[number], string> = {
  pending: 'border-gold bg-gold-tint',
  confirmed: 'border-gray-300 bg-white',
  delivered: 'border-gray-300 bg-white',
  canceled: 'border-gray-300 bg-white',
};

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={ADMIN_CARD}>
      <p className="text-sm text-gray-700">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      {hint ? <p dir="auto" className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

export default async function AdminDashboardPage() {
  /* Independent reads, so they overlap rather than stacking three round trips.
     `listAdminProducts()` is reused rather than given a dedicated count query:
     the catalogue is small, and one source of truth for "what the admin sees"
     beats shaving a few rows off a private page. */
  const [products, orderCounts, pending] = await Promise.all([
    listAdminProducts(),
    countOrdersByStatus(),
    recentPendingOrders(5),
  ]);

  const drafts = products.filter((product) => !product.published).length;
  const totalOrders = ORDER_STATUSES.reduce((sum, status) => sum + orderCounts[status], 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">الرئيسية</h1>
          {/* `dir="auto"` on Arabic sentences. The admin shell is `dir="ltr"`
              (deliberately — the product form is dense with Latin fields), and
              under LTR bidi a trailing "." on an Arabic sentence is placed at the
              visual LEFT. `auto` takes direction from the first strong character,
              so the full stop lands where a reader expects it. */}
          <p dir="auto" className="mt-1 text-sm text-gray-700">
            نظرة سريعة على المتجر.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/products/new" className={ADMIN_BTN_PRIMARY}>
            + منتج جديد
          </Link>
          <Link href="/admin/orders" className={ADMIN_BTN_GHOST}>
            عرض الطلبات
          </Link>
        </div>
      </div>

      {/* ---- Catalogue ---- */}
      <section>
        <h2 className="text-sm font-medium text-gray-700">المنتجات</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="إجمالي المنتجات" value={formatInteger(products.length)} />
          <Stat
            label="مسودات غير منشورة"
            value={formatInteger(drafts)}
            hint={drafts > 0 ? 'لا تظهر في المتجر.' : 'كل المنتجات منشورة.'}
          />
          <Stat label="إجمالي الطلبات" value={formatInteger(totalOrders)} />
        </div>
      </section>

      {/* ---- Orders by status ---- */}
      <section>
        <h2 className="text-sm font-medium text-gray-700">الطلبات حسب الحالة</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ORDER_STATUSES.map((status) => (
            <div key={status} className={`rounded-xl border p-5 ${STATUS_TONE[status]}`}>
              <p className="text-sm text-gray-700">{STATUS_LABEL[status]}</p>
              <p className="mt-2 text-3xl font-semibold">{formatInteger(orderCounts[status])}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Needs attention ---- */}
      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-gray-700">طلبات تحتاج متابعة</h2>
          <Link href="/admin/orders" className="text-sm text-gray-700 hover:text-ink">
            عرض الكل ←
          </Link>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-gray-300 bg-white">
          {pending.length > 0 ? (
            // See the orders table for why this wraps in a scrolling div
            // rather than shrinking columns or relying on `overflow-hidden`.
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="border-b border-gray-300 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">المنتج</th>
                    <th className="px-4 py-3 text-start font-medium">الزبون</th>
                    <th className="px-4 py-3 text-start font-medium">المجموع</th>
                    <th className="px-4 py-3 text-start font-medium">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {pending.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium hover:underline"
                        >
                          {order.productName}
                        </Link>
                        {order.variantLabel ? (
                          <span className="block text-xs text-gray-500">{order.variantLabel}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{order.customerName}</td>
                      <td className="px-4 py-3">{formatInteger(order.total)} دج</td>
                      <td className="px-4 py-3 text-gray-700">
                        {/* `en-GB` for a stable dd/mm/yyyy in Latin digits: this is
                            a scan-and-compare column, and `ar-DZ` would render
                            Arabic-Indic numerals inconsistently with every other
                            number in this panel. */}
                        {new Date(order.createdAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p dir="auto" className="px-4 py-10 text-center text-sm text-gray-700">
              لا توجد طلبات قيد الانتظار.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
