import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AdminShell from './AdminShell';
import LoadingState from '../../components/LoadingState';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import type { Order, OrderStatus } from '../../types';
import { formatPrice } from '../../utils/format';

const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'paid', 'cancelled'];

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-sky-100 text-sky-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-violet-100 text-violet-700',
  delivered: 'bg-teal-100 text-teal-700',
  paid: 'bg-emerald-500 text-white',
  cancelled: 'bg-red-100 text-red-600',
};

const deliveryAreaLabels = {
  inside_dhaka: 'Inside Dhaka',
  outside_dhaka: 'Outside Dhaka',
} as const;

function getOrderSubtotal(order: Order) {
  return order.subtotalAmount ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getOrderDeliveryCharge(order: Order) {
  return order.deliveryCharge ?? Math.max(order.totalAmount - getOrderSubtotal(order), 0);
}

function getDeliveryLabel(order: Order) {
  return order.deliveryArea ? deliveryAreaLabels[order.deliveryArea] : 'Delivery';
}

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
      {isLoading ? <LoadingState label="Loading orders..." /> : null}
      <div className="grid gap-4">
        {orders.map((order) => {
          const subtotal = getOrderSubtotal(order);
          const deliveryCharge = getOrderDeliveryCharge(order);

          return (
            <div key={order._id} className="rounded-3xl border border-roseGold/10 bg-white/90 p-5 shadow-[0_18px_40px_-30px_rgba(74,40,48,0.5)] backdrop-blur-sm transition hover:border-roseGold/25">
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-roseGold">{new Date(order.createdAt).toLocaleString()}</p>
                    <span className={`badge ${statusStyles[order.orderStatus]}`}>{order.orderStatus}</span>
                  </div>
                  <h2 className="mt-1.5 font-display text-2xl font-bold">{order.customerName}</h2>
                  <p className="mt-1 text-sm text-ink/60">{order.phone} - {order.address}</p>
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

              <div className="mt-4 rounded-2xl bg-pearl/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45">Ordered products</p>
                <div className="mt-3 grid gap-3">
                  {order.items.map((item) => (
                    <div key={`${order._id}-${item.productId}`} className="grid gap-3 rounded-2xl bg-white p-3 text-sm sm:grid-cols-[56px_1fr_auto] sm:items-center">
                      {item.image ? <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" /> : <div className="hidden h-14 w-14 rounded-xl bg-blush sm:block" />}
                      <div>
                        <p className="font-bold text-ink">{item.name}</p>
                        <p className="text-xs text-ink/50">Qty {item.quantity} x {formatPrice(item.price)}</p>
                      </div>
                      <p className="font-extrabold text-ink sm:text-right">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-2 border-t border-roseGold/10 pt-4 text-sm text-ink/65 sm:grid-cols-3">
                  <p>Subtotal: <span className="font-bold text-ink">{formatPrice(subtotal)}</span></p>
                  <p>Delivery ({getDeliveryLabel(order)}): <span className="font-bold text-ink">{formatPrice(deliveryCharge)}</span></p>
                  <p>Total: <span className="font-bold text-ink">{formatPrice(order.totalAmount)}</span></p>
                </div>
              </div>
            </div>
          );
        })}
        {!isLoading && !orders.length ? <p className="rounded-3xl border border-roseGold/10 bg-white/80 p-8 text-center text-ink/55">No orders yet.</p> : null}
      </div>
    </AdminShell>
  );
}