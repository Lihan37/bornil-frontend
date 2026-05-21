import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AdminShell from './AdminShell';
import LoadingState from '../../components/LoadingState';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import type { OrderStatus } from '../../types';
import { formatPrice } from '../../utils/format';

const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

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
      {isLoading ? <LoadingState /> : null}
      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order._id} className="rounded-3xl border border-roseGold/10 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-roseGold">{new Date(order.createdAt).toLocaleString()}</p>
                <h2 className="mt-1 font-display text-2xl font-bold">{order.customerName}</h2>
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
      </div>
    </AdminShell>
  );
}
