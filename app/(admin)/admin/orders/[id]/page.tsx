import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderStatusControl } from '@/components/admin/OrderStatusControl';
import { ADMIN_CARD } from '@/components/admin/styles';
import { formatInteger } from '@/lib/format';
import { getAdminOrder, getDairaName, getWilayaName } from '@/lib/queries/admin';

export const dynamic = 'force-dynamic';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-gray-300 py-3 last:border-b-0">
      <dt className="shrink-0 text-sm text-gray-700">{label}</dt>
      <dd className="text-end text-sm font-medium">{children}</dd>
    </div>
  );
}

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const [dairaName, wilayaName] = await Promise.all([
    getDairaName(order.dairaId),
    getWilayaName(order.wilayaCode),
  ]);

  const subtotal = order.unitPrice * order.quantity;

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-gray-700 hover:text-ink">
        ← كل الطلبات
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            طلب <span className="num">{order.id.slice(0, 8).toUpperCase()}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-700">
            {new Date(order.createdAt).toLocaleString('en-GB')}
          </p>
        </div>

        <div className="w-56">
          <OrderStatusControl orderId={order.id} status={order.status} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* ---- What was ordered ---- */}
        <section className={ADMIN_CARD}>
          <h2 className="text-lg font-semibold">المنتج</h2>
          <dl className="mt-3">
            <Row label="المنتج">
              {/* `product_id` is nullable — the product may have been deleted
                  after the order was placed. The order keeps its own snapshot of
                  the name either way, so this degrades to plain text rather than
                  linking to a page that would 404. */}
              {order.productId ? (
                <Link href={`/admin/products/${order.productId}`} className="hover:underline">
                  {order.productName}
                </Link>
              ) : (
                <span>
                  {order.productName}
                  <span className="block text-xs font-normal text-gray-500">
                    (المنتج لم يعد موجوداً)
                  </span>
                </span>
              )}
            </Row>
            {order.variantLabel ? <Row label="النسخة">{order.variantLabel}</Row> : null}
            <Row label="الكمية">
              <span className="num">{order.quantity}</span>
            </Row>
            <Row label="سعر الوحدة">
              <span className="num">{formatInteger(order.unitPrice)}</span> دج
            </Row>
            <Row label="المجموع الفرعي">
              <span className="num">{formatInteger(subtotal)}</span> دج
            </Row>
            <Row label="التوصيل">
              <span className="num">{formatInteger(order.deliveryFee)}</span> دج
            </Row>
            <Row label="الإجمالي">
              <span className="num text-base">{formatInteger(order.total)}</span> دج
            </Row>
          </dl>
        </section>

        {/* ---- Who ordered it ---- */}
        <section className={ADMIN_CARD}>
          <h2 className="text-lg font-semibold">الزبون والتوصيل</h2>
          <dl className="mt-3">
            <Row label="الاسم">{order.customerName}</Row>
            <Row label="الهاتف">
              <a href={`tel:${order.customerPhone}`} className="num hover:underline" dir="ltr">
                {order.customerPhone}
              </a>
            </Row>
            <Row label="طريقة الاستلام">
              {order.deliveryMethod === 'home' ? 'التوصيل إلى المنزل' : 'مكتب التوصيل'}
            </Row>
            <Row label="الولاية">
              {wilayaName ?? '—'} <span className="num text-gray-500">({order.wilayaCode})</span>
            </Row>
            {dairaName ? <Row label="الدائرة">{dairaName}</Row> : null}
            {order.address ? <Row label="العنوان">{order.address}</Row> : null}
            {order.landingSlug ? <Row label="صفحة الوصول">{order.landingSlug}</Row> : null}
            {order.notes ? <Row label="ملاحظات">{order.notes}</Row> : null}
          </dl>
        </section>
      </div>
    </div>
  );
}
