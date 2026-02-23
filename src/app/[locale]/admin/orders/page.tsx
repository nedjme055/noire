import { revalidatePath } from 'next/cache';
import { OrderStatus } from '@prisma/client';
import { AdminShell } from '@/components/admin/admin-shell';
import { requireAdmin } from '@/lib/auth/guard';
import { prisma } from '@/lib/db/prisma';
import { formatDzd } from '@/lib/utils';

const STATUSES: OrderStatus[] = ['new', 'confirmed', 'shipped', 'delivered', 'canceled', 'returned'];

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-amber-50 text-amber-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  canceled: 'bg-red-50 text-red-600',
  returned: 'bg-gray-100 text-gray-600',
};

async function updateStatus(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const status = String(formData.get('status')) as OrderStatus;
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath('/');
}

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { status?: OrderStatus };
}) {
  await requireAdmin(params.locale);

  const filterStatus = searchParams.status;
  const orders = await prisma.order.findMany({
    where: filterStatus ? { status: filterStatus } : undefined,
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  // Count by status for filter tabs
  const allOrders = await prisma.order.groupBy({ by: ['status'], _count: { _all: true } });
  const countByStatus = Object.fromEntries(allOrders.map((g) => [g.status, g._count._all]));

  return (
    <AdminShell locale={params.locale}>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-black">Orders</h1>
          <p className="mt-0.5 text-[13px] text-black/45">{orders.length} orders {filterStatus ? `· ${filterStatus}` : '· all'}</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        <a
          href={`/${params.locale}/admin/orders`}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors ${!filterStatus ? 'border-black bg-black text-white' : 'border-black/12 bg-white text-black/60 hover:border-black/25 hover:text-black'
            }`}
        >
          All
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
            {allOrders.reduce((a, g) => a + g._count._all, 0)}
          </span>
        </a>
        {STATUSES.map((status) => (
          <a
            key={status}
            href={`/${params.locale}/admin/orders?status=${status}`}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${filterStatus === status ? 'border-black bg-black text-white' : 'border-black/12 bg-white text-black/60 hover:border-black/25 hover:text-black'
              }`}
          >
            {status}
            {countByStatus[status] ? (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filterStatus === status ? 'bg-white/20 text-white' : 'bg-black/6 text-black/50'}`}>
                {countByStatus[status]}
              </span>
            ) : null}
          </a>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="admin-card overflow-hidden">
            <div className="flex flex-wrap items-start gap-4 p-4">
              {/* Order info */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[14px] font-semibold text-black">{order.orderNumber}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-black/70">{order.customerName}</p>
                <p className="text-[12px] text-black/40">{order.phone} · {order.wilayaCode} — {order.commune}</p>
                {order.address && <p className="text-[12px] text-black/40">{order.address}</p>}
                {order.notes && <p className="text-[12px] italic text-black/30">&ldquo;{order.notes}&rdquo;</p>}
              </div>

              {/* Amount + item count */}
              <div className="text-right">
                <p className="text-[15px] font-semibold text-black">{formatDzd(order.total, params.locale)}</p>
                <p className="mt-0.5 text-[12px] text-black/40">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </p>
                <p className="mt-0.5 text-[11px] text-black/30">
                  {new Date(order.createdAt).toLocaleDateString(params.locale === 'ar' ? 'ar' : params.locale === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Order items */}
            {order.items.length > 0 && (
              <div className="border-t border-black/8 px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-1.5 rounded-lg border border-black/8 bg-black/[0.02] px-2.5 py-1">
                      <span className="text-[12px] font-medium text-black/70">{item.productName}</span>
                      {item.size && <span className="text-[11px] text-black/40">· {item.size}</span>}
                      <span className="text-[11px] text-black/40">× {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status update */}
            <div className="border-t border-black/8 px-4 py-3">
              <form action={updateStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={order.id} />
                <select
                  name="status"
                  defaultValue={order.status}
                  className="admin-input-sm flex-1"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status} className="capitalize">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <button type="submit" className="admin-btn-primary py-1.5 text-[12px]">
                  Update Status
                </button>
              </form>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="admin-card flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-black/5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black/30">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-black/50">No orders {filterStatus ? `with status "${filterStatus}"` : 'yet'}</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
