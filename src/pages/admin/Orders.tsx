import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AdminShell from './AdminShell';
import LoadingState from '../../components/LoadingState';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import type { OrderStatus } from '../../types';
import { formatPrice } from '../../utils/format';

const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-sky-100 text-sky-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-violet-100 text-violet-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function Orders() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({ queryKey: ['orders'], queryFn: getOrders });
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Could not update order status. Check your backend API.'),
  });

  return (
    <AdminShell title="Orders">
      {isLoading ? <LoadingState label="Loading orders…" /> : null}
      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order._id} className="rounded-3xl border border-roseGold/10 bg-white/90 p-5 shadow-[0_18px_40px_-30px_rgba(74,40,48,0.5)] backdrop-blur-sm transition hover:border-roseGold/25">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-roseGold">{new Date(order.createdAt).toLocaleString()}</p>
                  <span className={`badge ${statusStyles[order.orderStatus]}`}>{order.orderStatus}</span>
                </div>
                <h2 className="mt-1.5 font-display text-2xl font-bold">{order.customerName}</h2>
                <p className="mt-1 text-sm text-ink/60">{order.phone} · {order.address}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xl font-extrabold">{formatPrice(order.totalAmount)}</p>
                <select
                  className="field mt-2 min-w-44"
                  value={order.orderStatus}
                  onChange={(event) => mutation.mutate({ id: order._id, status: event.target.value as OrderStatus })}
                >
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && !orders.length ? <p className="rounded-3xl border border-roseGold/10 bg-white/80 p-8 text-center text-ink/55">No orders yet.</p> : null}
      </div>
    </AdminShell>
  );
}
