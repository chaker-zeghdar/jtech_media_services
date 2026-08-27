import Link from 'next/link';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { ORDER_STATUS_LABEL } from '@/components/admin/orderStatus';
import { ADMIN_CARD } from '@/components/admin/styles';
import { orderStatusSchema } from '@/content/schemas';
import { formatInteger } from '@/lib/format';
import { ORDER_STATUSES, countOrdersByStatus, listAdminOrders } from '@/lib/queries/admin';

/** Always live — an orders list showing stale rows is a bug report. */
export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  /* An unknown ?status= falls back to "all" rather than 404ing — a filter is a
     view preference, not an addressable resource. */
  const parsed = orderStatusSchema.safeParse(rawStatus);
  const active = parsed.success ? parsed.data : null;

  const [orders, counts] = await Promise.all([
    listAdminOrders(active ?? undefined),
    countOrdersByStatus(),
  ]);

  const total = ORDER_STATUSES.reduce((sum, s) => sum + counts[s], 0);

  const pills = [
    { key: null, label: 'الكل', count: total, href: '/admin/orders' },
    ...ORDER_STATUSES.map((s) => ({
      key: s,
      label: ORDER_STATUS_LABEL[s],
      count: counts[s],
      href: `/admin/orders?status=${s}`,
    })),
  ];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">الطلبات</h1>
        <p dir="auto" className="mt-1 text-sm text-gray-700">
          {formatInteger(total)} طلب إجمالاً.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {pills.map((pill) => {
          const selected = pill.key === active;
          return (
            <Link
              key={pill.key ?? 'all'}
              href={pill.href}
              aria-current={selected ? 'page' : undefined}
              className={
                selected
                  ? 'rounded-full bg-ink px-4 py-2 text-sm font-medium text-white'
                  : 'rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-ink hover:text-ink'
              }
            >
              {pill.label} <span className="num">({formatInteger(pill.count)})</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-300 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-300 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-start font-medium">التاريخ</th>
              <th className="px-4 py-3 text-start font-medium">الزبون</th>
              <th className="px-4 py-3 text-start font-medium">المنتج</th>
              <th className="px-4 py-3 text-start font-medium">الولاية</th>
              <th className="px-4 py-3 text-start font-medium">المجموع</th>
              <th className="px-4 py-3 text-start font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {orders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">
                  <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                    {/* `en-GB` for a stable dd/mm/yyyy in Latin digits — every
                        other number in this panel is Latin too. */}
                    {new Date(order.createdAt).toLocaleDateString('en-GB')}
                  </Link>
                  <span className="block text-xs text-gray-500">
                    {order.id.slice(0, 8).toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                    {order.customerName}
                  </Link>
                  <span className="block text-xs text-gray-500" dir="ltr">
                    {order.customerPhone}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {order.productName}
                  <span className="block text-xs text-gray-500">
                    {[order.variantLabel, `× ${order.quantity}`].filter(Boolean).join(' — ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{order.wilayaCode}</td>
                <td className="px-4 py-3">{formatInteger(order.total)} دج</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 ? (
          <div className={ADMIN_CARD.replace('rounded-xl border border-gray-300 bg-white', '')}>
            <p dir="auto" className="py-6 text-center text-sm text-gray-700">
              لا توجد طلبات{active ? ` بحالة "${ORDER_STATUS_LABEL[active]}"` : ''}.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
