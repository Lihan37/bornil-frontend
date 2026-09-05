import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AdminShell from './AdminShell';
import LoadingState from '../../components/LoadingState';
import { approveOrderEditRequest, getOrders, rejectOrderEditRequest, updateOrderStatus } from '../../services/orderService';
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

function requestedQuantity(order: Order, productId: string) {
  return order.editRequest?.requestedItems.find((item) => item.productId === productId)?.quantity;
}

export default function Orders() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({ queryKey: ['orders'], queryFn: getOrders });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Could not update order status. Check your backend API.'),
  });
  const approveMutation = useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) => approveOrderEditRequest(id, adminNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Edit request approved');
    },
    onError: () => toast.error('Could not approve edit request'),
  });
  const rejectMutation = useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) => rejectOrderEditRequest(id, adminNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Edit request rejected');
    },
    onError: () => toast.error('Could not reject edit request'),
  });

  const respondToEdit = (id: string, action: 'approve' | 'reject') => {
    const adminNote = window.prompt(action === 'approve' ? 'Optional approval note' : 'Optional rejection note')?.trim() || undefined;
    if (action === 'approve') approveMutation.mutate({ id, adminNote });
    else rejectMutation.mutate({ id, adminNote });
  };

  return (
    <AdminShell title="Orders">
      {isLoading ? <LoadingState label="Loading orders..." /> : null}
      <div className="grid gap-4">
        {orders.map((order) => {
          const subtotal = getOrderSubtotal(order);
          const deliveryCharge = getOrderDeliveryCharge(order);
          const hasPendingEdit = order.editRequest?.status === 'pending';

          return (
            <div key={order._id} className="rounded-3xl border border-roseGold/10 bg-white/90 p-5 shadow-[0_18px_40px_-30px_rgba(74,40,48,0.5)] backdrop-blur-sm transition hover:border-roseGold/25">
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-roseGold">{new Date(order.createdAt).toLocaleString()}</p>
                    <span className={`badge ${statusStyles[order.orderStatus]}`}>{order.orderStatus}</span>
                    {hasPendingEdit ? <span className="badge bg-roseGold text-white">Edit requested</span> : null}
                  </div>
                  <h2 className="mt-1.5 font-display text-2xl font-bold">{order.customerName}</h2>
                  <p className="mt-1 text-sm text-ink/60">{order.phone} - {order.address}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xl font-extrabold">{formatPrice(order.totalAmount)}</p>
                  <select
                    className="field mt-2 min-w-44"
                    value={order.orderStatus}
                    onChange={(event) => statusMutation.mutate({ id: order._id, status: event.target.value as OrderStatus })}
                  >
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-pearl/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45">Ordered products</p>
                <div className="mt-3 grid gap-3">
                  {order.items.map((item) => {
                    const requestedQty = requestedQuantity(order, item.productId);
                    return (
                      <div key={`${order._id}-${item.productId}`} className="grid gap-3 rounded-2xl bg-white p-3 text-sm sm:grid-cols-[56px_1fr_auto] sm:items-center">
                        {item.image ? <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" /> : <div className="hidden h-14 w-14 rounded-xl bg-blush sm:block" />}
                        <div>
                          <p className="font-bold text-ink">{item.name}</p>
                          <p className="text-xs text-ink/50">Qty {item.quantity} x {formatPrice(item.price)}</p>
                          {hasPendingEdit && requestedQty !== undefined && requestedQty !== item.quantity ? (
                            <p className="mt-1 text-xs font-bold text-roseGold">Requested qty: {requestedQty}</p>
                          ) : null}
                        </div>
                        <p className="font-extrabold text-ink sm:text-right">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 grid gap-2 border-t border-roseGold/10 pt-4 text-sm text-ink/65 sm:grid-cols-3">
                  <p>Subtotal: <span className="font-bold text-ink">{formatPrice(subtotal)}</span></p>
                  <p>Delivery ({getDeliveryLabel(order)}): <span className="font-bold text-ink">{formatPrice(deliveryCharge)}</span></p>
                  <p>Total: <span className="font-bold text-ink">{formatPrice(order.totalAmount)}</span></p>
                </div>
              </div>

              {order.editRequest ? (
                <div className="mt-4 rounded-2xl border border-roseGold/15 bg-white p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-roseGold">Edit request: {order.editRequest.status}</p>
                      <p className="mt-1 text-sm text-ink/65">Requested total: <span className="font-bold text-ink">{formatPrice(order.editRequest.requestedTotalAmount)}</span></p>
                      {order.editRequest.note ? <p className="mt-1 text-sm text-ink/60">Customer note: {order.editRequest.note}</p> : null}
                      {order.editRequest.adminNote ? <p className="mt-1 text-sm text-ink/60">Admin note: {order.editRequest.adminNote}</p> : null}
                    </div>
                    {hasPendingEdit ? (
                      <div className="flex flex-wrap gap-2">
                        <button className="btn-primary py-2" type="button" disabled={approveMutation.isPending} onClick={() => respondToEdit(order._id, 'approve')}>Approve edit</button>
                        <button className="rounded-full bg-red-50 px-5 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100" type="button" disabled={rejectMutation.isPending} onClick={() => respondToEdit(order._id, 'reject')}>Reject</button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
        {!isLoading && !orders.length ? <p className="rounded-3xl border border-roseGold/10 bg-white/80 p-8 text-center text-ink/55">No orders yet.</p> : null}
      </div>
    </AdminShell>
  );
}