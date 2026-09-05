import { useQuery } from '@tanstack/react-query';
import { PackageOpen } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import { getMyOrders } from '../services/orderService';
import { formatPrice } from '../utils/format';
import type { Order, OrderStatus } from '../types';

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

export default function OrderHistory() {
  const { data: orders = [], isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: getMyOrders });

  return (
    <section className="container-pad py-12">
      <p className="eyebrow mb-2">Account</p>
      <h1 className="font-display text-4xl font-bold">Order history</h1>

      {isLoading ? <div className="mt-6"><LoadingState label="Loading your orders..." /></div> : null}

      <div className="mt-6 grid gap-4">
        {orders.map((order) => {
          const subtotal = getOrderSubtotal(order);
          const deliveryCharge = getOrderDeliveryCharge(order);

          return (
            <article key={order._id} className="rounded-3xl border border-roseGold/10 bg-white/90 p-5 shadow-[0_18px_40px_-30px_rgba(74,40,48,0.5)] backdrop-blur-sm transition hover:border-roseGold/25 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-roseGold">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <h2 className="mt-1 font-display text-2xl font-bold">Order #{order._id.slice(-6).toUpperCase()}</h2>
                  <p className="mt-1 text-sm text-ink/55">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                </div>
                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  <p className="text-xl font-extrabold">{formatPrice(order.totalAmount)}</p>
                  <span className={`badge ${statusStyles[order.orderStatus]}`}>{order.orderStatus}</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-pearl/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45">Products</p>
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
            </article>
          );
        })}

        {!isLoading && !orders.length ? (
          <div className="grid place-items-center rounded-4xl border border-roseGold/15 bg-white/80 px-6 py-14 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-blush text-roseGold">
              <PackageOpen size={24} />
            </div>
            <p className="mt-4 font-display text-xl font-bold">No orders yet</p>
            <p className="mt-1 text-sm text-ink/55">When you place your first order, it will appear here.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}